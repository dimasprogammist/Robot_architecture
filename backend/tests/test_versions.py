from uuid import uuid4

from fastapi import HTTPException

from app.api.router import ProjectCreate, VersionCreate, create_project, delete_version, save_version
from app.db import SessionLocal, init_db
from app.services.auth import register_user


def setup_module() -> None:
    init_db()


def test_delete_saved_version_from_storage():
    db = SessionLocal()
    try:
        email = f"ver-{uuid4().hex[:12]}@example.com"
        user = register_user(db, email, "secret12", "T")
        project = create_project(ProjectCreate(name="Версии", description="", template_id="robot"), user, db)
        saved = save_version(project.id, VersionCreate(label="снимок-1"), user, db)
        assert any(v.label == "снимок-1" for v in saved.versions)
        vid = next(v.id for v in saved.versions if v.label == "снимок-1")
        after = delete_version(project.id, vid, user, db)
        assert all(v.id != vid for v in after.versions)
        try:
            delete_version(project.id, vid, user, db)
            raise AssertionError("expected 404")
        except HTTPException as exc:
            assert exc.status_code == 404
        again = save_version(project.id, VersionCreate(label="снимок-2"), user, db)
        assert any(v.label == "снимок-2" for v in again.versions)
    finally:
        db.close()
