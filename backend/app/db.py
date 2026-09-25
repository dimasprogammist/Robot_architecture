from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, String, Text, create_engine
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


class SessionRow(Base):
    __tablename__ = "sessions"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


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
    _add_column("user_templates", "user_id", "user_id VARCHAR(36)")


def _add_column(table: str, column: str, ddl: str) -> None:
    with engine.begin() as conn:
        rows = conn.exec_driver_sql(f"PRAGMA table_info({table})").fetchall()
        names = {r[1] for r in rows}
        if names and column not in names:
            conn.exec_driver_sql(f"ALTER TABLE {table} ADD COLUMN {ddl}")


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
