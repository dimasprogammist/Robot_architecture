from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Index, String, Text, UniqueConstraint, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "architecture_canvas.db"

engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class ProjectRow(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    data: Mapped[str] = mapped_column(Text)
    user_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    share_code: Mapped[str | None] = mapped_column(String(32), nullable=True, unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class UserRow(Base):
    """Account. `role` is a free string so rights can grow later (user, admin, …)."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(255), default="")
    role: Mapped[str] = mapped_column(String(32), default="user")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class ProjectMemberRow(Base):
    __tablename__ = "project_members"
    __table_args__ = (UniqueConstraint("project_id", "user_id", name="uq_project_member"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    project_id: Mapped[str] = mapped_column(String(36), index=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True)
    role: Mapped[str] = mapped_column(String(32), default="member")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class PasswordResetRow(Base):
    __tablename__ = "password_resets"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class SessionRow(Base):
    __tablename__ = "sessions"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    session_log_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)


class UserSessionRow(Base):
    __tablename__ = "user_sessions"
    __table_args__ = (
        Index("ix_user_sessions_user_id", "user_id"),
        Index("ix_user_sessions_login_at", "login_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    login_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    logout_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class UserTemplateRow(Base):
    __tablename__ = "user_templates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    snapshot: Mapped[str] = mapped_column(Text)
    user_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class UserLessonProgressRow(Base):
    """Tutorial progress bound to an account."""

    __tablename__ = "user_lesson_progress"

    user_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    lesson_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    theory_done: Mapped[bool] = mapped_column(Boolean, default=False)
    tasks_done: Mapped[str] = mapped_column(Text, default="[]")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class CurriculumProgressRow(Base):
    """Progress in the sequential tutorial ('Учебник'), one row per lesson."""

    __tablename__ = "curriculum_progress"

    lesson_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    theory_done: Mapped[bool] = mapped_column(Boolean, default=False)
    tasks_done: Mapped[str] = mapped_column(Text, default="[]")  # JSON list[str]
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class SettingsRow(Base):
    __tablename__ = "user_settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    data: Mapped[str] = mapped_column(Text)


def init_db() -> None:
    Base.metadata.create_all(engine)
    _add_column("projects", "user_id", "user_id VARCHAR(36)")
    _add_column("projects", "share_code", "share_code VARCHAR(32)")
    _add_column("user_templates", "user_id", "user_id VARCHAR(36)")
    _add_column("sessions", "session_log_id", "session_log_id VARCHAR(36)")
    _ensure_index("ix_sessions_session_log_id", "sessions", "session_log_id")
    _migrate_password_resets()


def _migrate_password_resets() -> None:
    with engine.begin() as conn:
        rows = conn.exec_driver_sql("PRAGMA table_info(password_resets)").fetchall()
        names = {r[1] for r in rows}
        if not names or "token_hash" in names:
            return
        conn.exec_driver_sql("ALTER TABLE password_resets RENAME TO password_resets_legacy")
    Base.metadata.create_all(engine, tables=[PasswordResetRow.__table__])


def _add_column(table: str, column: str, ddl: str) -> None:
    with engine.begin() as conn:
        rows = conn.exec_driver_sql(f"PRAGMA table_info({table})").fetchall()
        names = {r[1] for r in rows}
        if names and column not in names:
            conn.exec_driver_sql(f"ALTER TABLE {table} ADD COLUMN {ddl}")


def _ensure_index(name: str, table: str, column: str) -> None:
    with engine.begin() as conn:
        conn.exec_driver_sql(f"CREATE INDEX IF NOT EXISTS {name} ON {table}({column})")


def get_db() -> Iterator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def new_id() -> str:
    return str(uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)
