from __future__ import annotations

import secrets

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db import ProjectMemberRow, ProjectRow, UserRow, new_id, utcnow

SHARE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_share_code(db: Session) -> str:
    for _ in range(60):
        chunks = ["".join(secrets.choice(SHARE_ALPHABET) for _ in range(4)) for _ in range(3)]
        code = "-".join(chunks)
        if db.query(ProjectRow).filter(ProjectRow.share_code == code).first() is None:
            return code
    raise HTTPException(500, "Не удалось выдать уникальный ID проекта")


def ensure_share_code(db: Session, row: ProjectRow) -> str:
    if not row.share_code:
        row.share_code = generate_share_code(db)
        db.commit()
    return row.share_code


def is_member(db: Session, project_id: str, user_id: str) -> bool:
    return (
        db.query(ProjectMemberRow)
        .filter(ProjectMemberRow.project_id == project_id, ProjectMemberRow.user_id == user_id)
        .first()
        is not None
    )


def can_access(db: Session, row: ProjectRow | None, user: UserRow) -> bool:
    if row is None:
        return False
    if not row.user_id or row.user_id == user.id:
        return True
    return is_member(db, row.id, user.id)


def add_member(db: Session, project_id: str, user_id: str, role: str = "member") -> None:
    if is_member(db, project_id, user_id):
        return
    db.add(
        ProjectMemberRow(
            id=new_id(),
            project_id=project_id,
            user_id=user_id,
            role=role,
            created_at=utcnow(),
        )
    )
    db.commit()
