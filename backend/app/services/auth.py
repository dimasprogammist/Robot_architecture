from __future__ import annotations

import hashlib
import secrets

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db import SessionRow, UserRow, get_db, new_id, utcnow

ROLE_USER = "user"
ROLE_ADMIN = "admin"


def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
    return f"{salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    salt, _, digest = stored.partition("$")
    if not salt or not digest:
        return False
    check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
    return secrets.compare_digest(check, digest)


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def register_user(db: Session, email: str, password: str, display_name: str) -> UserRow:
    email = email.strip().lower()
    if "@" not in email or len(password) < 6:
        raise HTTPException(400, "Нужны почта и пароль не короче 6 символов")
    if db.query(UserRow).filter(UserRow.email == email).first():
        raise HTTPException(409, "Такой аккаунт уже есть")
    user = UserRow(
        id=new_id(),
        email=email,
        password_hash=hash_password(password),
        display_name=display_name.strip() or email.split("@")[0],
        role=ROLE_USER,
        created_at=utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, email: str, password: str) -> tuple[UserRow, str]:
    user = db.query(UserRow).filter(UserRow.email == email.strip().lower()).first()
    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(401, "Неверная почта или пароль")
    token = secrets.token_urlsafe(32)
    db.add(SessionRow(token_hash=_token_hash(token), user_id=user.id, created_at=utcnow()))
    db.commit()
    return user, token


def logout_user(db: Session, token: str) -> None:
    row = db.get(SessionRow, _token_hash(token))
    if row:
        db.delete(row)
        db.commit()


def user_from_token(db: Session, token: str) -> UserRow | None:
    row = db.get(SessionRow, _token_hash(token))
    if row is None:
        return None
    return db.get(UserRow, row.user_id)


def optional_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> UserRow | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    return user_from_token(db, authorization.split(" ", 1)[1].strip())


def require_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> UserRow:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Нужно войти в аккаунт")
    user = user_from_token(db, authorization.split(" ", 1)[1].strip())
    if user is None:
        raise HTTPException(401, "Сессия недействительна")
    return user


def public_user(user: UserRow) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "role": user.role,
    }
