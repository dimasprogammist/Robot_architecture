from __future__ import annotations

from datetime import timezone
from uuid import uuid4

from fastapi import HTTPException

from app.db import SessionLocal, UserRow, UserSessionRow, engine, init_db
from app.services.auth import ROLE_ADMIN, login_user, logout_user, register_user, require_admin, user_from_token


def _email() -> str:
    return f"sess-{uuid4().hex[:12]}@example.com"


def setup_module() -> None:
    init_db()


def test_login_creates_open_session_and_failed_login_does_not():
    db = SessionLocal()
    try:
        email = _email()
        register_user(db, email, "secret12", "Tester")
        before = db.query(UserSessionRow).count()
        try:
            login_user(db, email, "wrong-password")
            raise AssertionError("expected HTTPException")
        except HTTPException as exc:
            assert exc.status_code == 401
        assert db.query(UserSessionRow).count() == before
        user, token = login_user(db, email, "secret12")
        row = db.query(UserSessionRow).filter(UserSessionRow.user_id == user.id).one()
        assert row.login_at is not None
        assert row.logout_at is None
        assert user_from_token(db, token) is not None
        after_refresh = db.query(UserSessionRow).filter(UserSessionRow.user_id == user.id).count()
        user_from_token(db, token)
        user_from_token(db, token)
        assert db.query(UserSessionRow).filter(UserSessionRow.user_id == user.id).count() == after_refresh
    finally:
        db.close()


def test_logout_updates_matching_session_only():
    db = SessionLocal()
    try:
        email = _email()
        register_user(db, email, "secret12", "Tester")
        user_a, token_a = login_user(db, email, "secret12")
        _user_b, token_b = login_user(db, email, "secret12")
        rows = db.query(UserSessionRow).filter(UserSessionRow.user_id == user_a.id).order_by(UserSessionRow.login_at).all()
        assert len(rows) == 2
        first_id, second_id = rows[0].id, rows[1].id
        logout_user(db, token_a)
        db.expire_all()
        first = db.get(UserSessionRow, first_id)
        second = db.get(UserSessionRow, second_id)
        assert first is not None and first.logout_at is not None
        assert first.logout_at.tzinfo in (timezone.utc, None) or first.logout_at.tzinfo is not None
        assert second is not None and second.logout_at is None
        closed = first.logout_at
        logout_user(db, token_a)
        db.expire_all()
        again = db.get(UserSessionRow, first_id)
        assert again is not None and again.logout_at == closed
        logout_user(db, token_b)
        db.expire_all()
        second = db.get(UserSessionRow, second_id)
        assert second is not None and second.logout_at is not None
    finally:
        db.close()


def test_admin_sessions_api_is_forbidden_for_regular_users():
    db = SessionLocal()
    try:
        email = _email()
        user = register_user(db, email, "secret12", "U")
        login_user(db, email, "secret12")
        try:
            require_admin(user)
            raise AssertionError("expected HTTPException")
        except HTTPException as exc:
            assert exc.status_code == 403
        user.role = ROLE_ADMIN
        db.commit()
        assert require_admin(user).id == user.id
        from app.services.auth import list_user_sessions

        rows = list_user_sessions(db, user.id)
        assert rows
        assert all(item.user_id == user.id for item in rows)
        assert any(item.logout_at is None for item in rows)
    finally:
        db.close()
    with engine.begin() as conn:
        tables = {row[0] for row in conn.exec_driver_sql("SELECT name FROM sqlite_master WHERE type='table'").all()}
        indexes = {row[1] for row in conn.exec_driver_sql("PRAGMA index_list(user_sessions)").all()}
    assert "user_sessions" in tables
    assert "ix_user_sessions_user_id" in indexes
    assert "ix_user_sessions_login_at" in indexes
