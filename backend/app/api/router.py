from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import ProjectRow, SettingsRow, UserLessonProgressRow, UserRow, UserTemplateRow, get_db, init_db, new_id, utcnow
from app.domain.library import BUILTIN_TYPES, LIBRARY_PRESETS
from app.domain.schema import (
    PROTOCOL_COLORS,
    AiExportRequest,
    ArchitectureVersion,
    GlobalSettings,
    Project,
    ProjectCreate,
    ProjectSummary,
)
from app.services.export import to_ai_prompt, to_markdown, to_semantic_export
from app.services.templates import TEMPLATES, create_from_template
from app.services.learning import categories as learning_categories, get_article
from app.services.course import course_lesson, course_overview, mark_lesson_seen
from app.domain.curriculum_schema import CodeCheckRequest, QuizCheckRequest
from app.services import curriculum as curriculum_service
from app.services.sqlgen import generate_sql
from app.services.files import import_json, resolve_path, save_upload
from app.services.auth import login_user, logout_user, optional_user, public_user, register_user, require_user

router = APIRouter()

AUTH_ILLUSTRATION = Path(__file__).resolve().parents[2] / "AutorizationPic.svg"


@router.get("/auth-illustration")
def auth_illustration():
    if not AUTH_ILLUSTRATION.is_file():
        raise HTTPException(404, "Иллюстрация не найдена")
    return FileResponse(AUTH_ILLUSTRATION, media_type="image/svg+xml")


def _row_to_project(row: ProjectRow) -> Project:
    return Project.model_validate_json(row.data)


def _save(db: Session, project: Project, row: ProjectRow | None = None, user_id: str | None = None) -> Project:
    project.updated_at = datetime.now(timezone.utc).isoformat()
    payload = project.model_dump_json()
    if row is None:
        row = db.get(ProjectRow, project.id)
    if row is None:
        row = ProjectRow(
            id=project.id,
            name=project.name,
            description=project.description,
            data=payload,
            user_id=user_id,
            created_at=datetime.fromisoformat(project.created_at),
            updated_at=utcnow(),
        )
        db.add(row)
    else:
        if user_id and not row.user_id:
            row.user_id = user_id
        row.name = project.name
        row.description = project.description
        row.data = payload
        row.updated_at = utcnow()
    db.commit()
    return project


def _owned_row(db: Session, project_id: str, user: UserRow) -> ProjectRow:
    row = db.get(ProjectRow, project_id)
    if not row or (row.user_id and row.user_id != user.id):
        raise HTTPException(404, "Проект не найден")
    if not row.user_id:
        row.user_id = user.id
        db.commit()
    return row


@router.post("/auth/register")
def auth_register(body: dict, db: Session = Depends(get_db)):
    user = register_user(db, str(body.get("email") or ""), str(body.get("password") or ""), str(body.get("display_name") or ""))
    _user, token = login_user(db, user.email, str(body.get("password") or ""))
    return {"token": token, "user": public_user(user)}


@router.post("/auth/login")
def auth_login(body: dict, db: Session = Depends(get_db)):
    user, token = login_user(db, str(body.get("email") or ""), str(body.get("password") or ""))
    return {"token": token, "user": public_user(user)}


@router.post("/auth/logout")
def auth_logout(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    if authorization and authorization.lower().startswith("bearer "):
        logout_user(db, authorization.split(" ", 1)[1].strip())
    return {"ok": True}


@router.get("/auth/me")
def auth_me(user: UserRow = Depends(require_user)):
    return public_user(user)


@router.get("/projects", response_model=list[ProjectSummary])
def list_projects(user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    rows = (
        db.query(ProjectRow)
        .filter(ProjectRow.user_id == user.id)
        .order_by(ProjectRow.updated_at.desc())
        .all()
    )
    out: list[ProjectSummary] = []
    for row in rows:
        p = _row_to_project(row)
        out.append(
            ProjectSummary(
                id=p.id,
                name=p.name,
                description=p.description,
                created_at=p.created_at,
                updated_at=p.updated_at,
                current_version_label=p.current_version_label,
                component_count=len(p.components),
            )
        )
    return out


@router.post("/projects", response_model=Project)
def create_project(body: ProjectCreate, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    project = create_from_template(body.template_id, body.name, body.description)
    return _save(db, project, user_id=user.id)


@router.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: str, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    return _row_to_project(_owned_row(db, project_id, user))


@router.put("/projects/{project_id}", response_model=Project)
def update_project(project_id: str, body: Project, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    row = _owned_row(db, project_id, user)
    body.id = project_id
    return _save(db, body, row, user_id=user.id)


@router.delete("/projects/{project_id}")
def delete_project(project_id: str, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    row = _owned_row(db, project_id, user)
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.post("/projects/{project_id}/duplicate", response_model=Project)
def duplicate_project(project_id: str, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    row = _owned_row(db, project_id, user)
    project = _row_to_project(row)
    project.id = new_id()
    project.name = f"{project.name} (копия)"
    project.created_at = datetime.now(timezone.utc).isoformat()
    # keep internal ids; it's a snapshot copy which is fine for MVP
    return _save(db, project, user_id=user.id)


class VersionCreate(BaseModel):
    label: str | None = None


@router.post("/projects/{project_id}/versions", response_model=Project)
def save_version(project_id: str, body: VersionCreate, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    row = _owned_row(db, project_id, user)
    project = _row_to_project(row)
    n = len(project.versions) + 2
    label = body.label or f"v{n}"
    snap = project.model_dump()
    snap["versions"] = []
    project.versions.append(
        ArchitectureVersion(
            id=str(uuid4()),
            label=label,
            created_at=datetime.now(timezone.utc).isoformat(),
            snapshot=snap,
        )
    )
    project.current_version_label = label
    return _save(db, project, row, user_id=user.id)


@router.get("/projects/{project_id}/export.json")
def export_json(project_id: str, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    return to_semantic_export(_row_to_project(_owned_row(db, project_id, user)))


@router.get("/projects/{project_id}/export.md", response_class=PlainTextResponse)
def export_md(project_id: str, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    return to_markdown(_row_to_project(_owned_row(db, project_id, user)))


@router.post("/projects/{project_id}/export/ai", response_class=PlainTextResponse)
def export_ai(project_id: str, body: AiExportRequest, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    return to_ai_prompt(_row_to_project(_owned_row(db, project_id, user)), body.task, body.rules or None, body)


@router.post("/projects/import", response_model=Project)
def import_project(payload: dict, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    try:
        project = import_json(payload)
    except Exception as exc:
        raise HTTPException(400, f"Некорректный JSON архитектуры: {exc}") from exc
    project.id = new_id()
    project.created_at = datetime.now(timezone.utc).isoformat()
    return _save(db, project, user_id=user.id)


@router.get("/templates")
def list_templates(user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    builtin = [{"id": t["id"], "name": t["name"], "description": t["description"], "kind": "builtin"} for t in TEMPLATES]
    custom = [
        {"id": r.id, "name": r.name, "description": r.description, "kind": "custom"}
        for r in db.query(UserTemplateRow)
        .filter((UserTemplateRow.user_id == user.id) | (UserTemplateRow.user_id.is_(None)))
        .order_by(UserTemplateRow.created_at.desc())
        .all()
    ]
    return builtin + custom


class SaveTemplateBody(BaseModel):
    name: str
    description: str = ""


@router.post("/projects/{project_id}/save-template")
def save_template(project_id: str, body: SaveTemplateBody, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    row = _owned_row(db, project_id, user)
    tpl = UserTemplateRow(
        id=new_id(),
        name=body.name,
        description=body.description,
        snapshot=row.data,
        user_id=user.id,
        created_at=utcnow(),
    )
    db.add(tpl)
    db.commit()
    return {"id": tpl.id, "name": tpl.name}


@router.post("/templates/{template_id}/create", response_model=Project)
def create_from_user_template(template_id: str, body: ProjectCreate, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    row = db.get(UserTemplateRow, template_id)
    if row and row.user_id and row.user_id != user.id:
        row = None
    if row:
        data = json.loads(row.snapshot)
        project = Project.model_validate(data)
        project.id = new_id()
        project.name = body.name or row.name
        project.description = body.description or row.description
        project.created_at = datetime.now(timezone.utc).isoformat()
        project.versions = []
        return _save(db, project, user_id=user.id)
    project = create_from_template(template_id, body.name, body.description)
    return _save(db, project, user_id=user.id)


@router.get("/library")
def library():
    return {
        "types": [t.model_dump() for t in BUILTIN_TYPES],
        "presets": LIBRARY_PRESETS,
        "protocol_colors": PROTOCOL_COLORS,
    }


@router.get("/course")
def read_course(user: UserRow = Depends(require_user)):
    del user
    return course_overview()


@router.get("/course/progress")
def read_course_progress(user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    overview = course_overview()
    lesson_ids = {
        lesson["id"]
        for mod in overview["modules"]
        for lesson in mod["lessons"]
    }
    rows = (
        db.query(UserLessonProgressRow)
        .filter(UserLessonProgressRow.user_id == user.id)
        .all()
    )
    done = sum(1 for row in rows if row.lesson_id in lesson_ids and row.theory_done)
    return {
        "course_total": overview["total_lessons"],
        "course_done": done,
        "exercises_total": 0,
        "exercises_done": 0,
        "completed_ids": [
            row.lesson_id for row in rows if row.lesson_id in lesson_ids and row.theory_done
        ],
    }


@router.post("/course/{lesson_id}/seen")
def mark_course_seen(lesson_id: str, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    lesson = course_lesson(lesson_id)
    if lesson is None:
        raise HTTPException(404, "Урок не найден")
    mark_lesson_seen(db, user.id, lesson_id, True)
    return {"ok": True}


@router.post("/course/{lesson_id}/unseen")
def mark_course_unseen(lesson_id: str, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    lesson = course_lesson(lesson_id)
    if lesson is None:
        raise HTTPException(404, "Урок не найден")
    mark_lesson_seen(db, user.id, lesson_id, False)
    return {"ok": True}


@router.get("/course/{lesson_id}")
def read_course_lesson(
    lesson_id: str,
    user: UserRow = Depends(require_user),
    db: Session = Depends(get_db),
):
    lesson = course_lesson(lesson_id)
    if lesson is None:
        raise HTTPException(404, "Урок не найден")
    row = db.get(UserLessonProgressRow, (user.id, lesson_id))
    return {**lesson, "completed": bool(row and row.theory_done)}


@router.get("/learning")
def learning_index():
    return learning_categories()


@router.get("/learning/{article_id}")
def learning_article(article_id: str):
    art = get_article(article_id)
    if not art:
        raise HTTPException(404, "Материал не найден")
    return art


@router.get("/curriculum")
def curriculum_overview(user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    return curriculum_service.get_course_overview(db, user.id)


@router.get("/curriculum/{lesson_id}")
def curriculum_lesson(lesson_id: str, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    lesson = curriculum_service.get_lesson_detail(db, user.id, lesson_id)
    if lesson is None:
        raise HTTPException(404, "Урок не найден")
    return lesson


@router.post("/curriculum/{lesson_id}/theory-done")
def curriculum_theory_done(lesson_id: str, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    lesson = curriculum_service.mark_theory_done(db, user.id, lesson_id)
    if lesson is None:
        raise HTTPException(404, "Урок не найден")
    return lesson


@router.post("/curriculum/{lesson_id}/tasks/{task_id}/check-quiz")
def curriculum_check_quiz(lesson_id: str, task_id: str, body: QuizCheckRequest, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    result = curriculum_service.check_quiz(db, user.id, lesson_id, task_id, body)
    if result is None:
        raise HTTPException(404, "Задание не найдено")
    return result


@router.post("/curriculum/{lesson_id}/tasks/{task_id}/check-code")
def curriculum_check_code(lesson_id: str, task_id: str, body: CodeCheckRequest, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    result = curriculum_service.check_code(db, user.id, lesson_id, task_id, body)
    if result is None:
        raise HTTPException(404, "Задание не найдено")
    return result


@router.get("/projects/{project_id}/export.sql", response_class=PlainTextResponse)
def export_sql(project_id: str, dialect: str = "postgresql", user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    return generate_sql(_row_to_project(_owned_row(db, project_id, user)), dialect)


@router.post("/projects/{project_id}/files")
async def upload_file(
    project_id: str,
    component_id: str = Form(""),
    file: UploadFile = File(...),
    user: UserRow = Depends(require_user),
    db: Session = Depends(get_db),
):
    _owned_row(db, project_id, user)
    content = await file.read()
    meta = save_upload(project_id, file.filename or "file.bin", content)
    meta["component_id"] = component_id or None
    return meta


@router.get("/projects/{project_id}/files/{file_id}")
def download_file(project_id: str, file_id: str, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    _owned_row(db, project_id, user)
    path = resolve_path(project_id, file_id)
    if not path:
        raise HTTPException(404, "Файл не найден")
    return FileResponse(path, filename=path.name)


@router.get("/settings", response_model=GlobalSettings)
def get_settings(user: UserRow | None = Depends(optional_user), db: Session = Depends(get_db)):
    key = user.id if user else "local"
    row = db.get(SettingsRow, key)
    if not row:
        return GlobalSettings()
    return GlobalSettings.model_validate_json(row.data)


@router.put("/settings", response_model=GlobalSettings)
def put_settings(body: GlobalSettings, user: UserRow = Depends(require_user), db: Session = Depends(get_db)):
    row = db.get(SettingsRow, user.id)
    if not row:
        row = SettingsRow(id=user.id, data=body.model_dump_json())
        db.add(row)
    else:
        row.data = body.model_dump_json()
    db.commit()
    return body


def bootstrap() -> None:
    init_db()
