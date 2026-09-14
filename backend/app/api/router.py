from __future__ import annotations

import json
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import ProjectRow, SettingsRow, UserTemplateRow, get_db, init_db, new_id, utcnow
from app.domain.library import BUILTIN_TYPES, LIBRARY_PRESETS
from app.domain.schema import (
    AiExportRequest,
    ArchitectureVersion,
    GlobalSettings,
    Project,
    ProjectCreate,
    ProjectSummary,
)
from app.services.export import to_ai_prompt, to_markdown, to_semantic_export
from app.services.importer import import_json
from app.services.templates import TEMPLATES, create_from_template

router = APIRouter()


def _row_to_project(row: ProjectRow) -> Project:
    return Project.model_validate_json(row.data)


def _save(db: Session, project: Project, row: ProjectRow | None = None) -> Project:
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
            created_at=datetime.fromisoformat(project.created_at),
            updated_at=utcnow(),
        )
        db.add(row)
    else:
        row.name = project.name
        row.description = project.description
        row.data = payload
        row.updated_at = utcnow()
    db.commit()
    return project


@router.get("/projects", response_model=list[ProjectSummary])
def list_projects(db: Session = Depends(get_db)):
    rows = db.query(ProjectRow).order_by(ProjectRow.updated_at.desc()).all()
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
def create_project(body: ProjectCreate, db: Session = Depends(get_db)):
    project = create_from_template(body.template_id, body.name, body.description)
    return _save(db, project)


@router.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: str, db: Session = Depends(get_db)):
    row = db.get(ProjectRow, project_id)
    if not row:
        raise HTTPException(404, "Project not found")
    return _row_to_project(row)


@router.put("/projects/{project_id}", response_model=Project)
def update_project(project_id: str, body: Project, db: Session = Depends(get_db)):
    row = db.get(ProjectRow, project_id)
    if not row:
        raise HTTPException(404, "Project not found")
    body.id = project_id
    return _save(db, body, row)


@router.delete("/projects/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    row = db.get(ProjectRow, project_id)
    if not row:
        raise HTTPException(404, "Project not found")
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.post("/projects/{project_id}/duplicate", response_model=Project)
def duplicate_project(project_id: str, db: Session = Depends(get_db)):
    row = db.get(ProjectRow, project_id)
    if not row:
        raise HTTPException(404, "Project not found")
    project = _row_to_project(row)
    project.id = new_id()
    project.name = f"{project.name} copy"
    project.created_at = datetime.now(timezone.utc).isoformat()
    # keep internal ids; it's a snapshot copy which is fine for MVP
    return _save(db, project)


class VersionCreate(BaseModel):
    label: str | None = None


@router.post("/projects/{project_id}/versions", response_model=Project)
def save_version(project_id: str, body: VersionCreate, db: Session = Depends(get_db)):
    row = db.get(ProjectRow, project_id)
    if not row:
        raise HTTPException(404, "Project not found")
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
    return _save(db, project, row)


@router.get("/projects/{project_id}/export.json")
def export_json(project_id: str, db: Session = Depends(get_db)):
    row = db.get(ProjectRow, project_id)
    if not row:
        raise HTTPException(404, "Project not found")
    return to_semantic_export(_row_to_project(row))


@router.get("/projects/{project_id}/export.md", response_class=PlainTextResponse)
def export_md(project_id: str, db: Session = Depends(get_db)):
    row = db.get(ProjectRow, project_id)
    if not row:
        raise HTTPException(404, "Project not found")
    return to_markdown(_row_to_project(row))


@router.post("/projects/{project_id}/export/ai", response_class=PlainTextResponse)
def export_ai(project_id: str, body: AiExportRequest, db: Session = Depends(get_db)):
    row = db.get(ProjectRow, project_id)
    if not row:
        raise HTTPException(404, "Project not found")
    return to_ai_prompt(_row_to_project(row), body.task, body.rules or None)


@router.post("/projects/import", response_model=Project)
def import_project(payload: dict, db: Session = Depends(get_db)):
    try:
        project = import_json(payload)
    except Exception as exc:
        raise HTTPException(400, f"Invalid architecture JSON: {exc}") from exc
    project.id = new_id()
    project.created_at = datetime.now(timezone.utc).isoformat()
    return _save(db, project)


@router.get("/templates")
def list_templates(db: Session = Depends(get_db)):
    builtin = [{"id": t["id"], "name": t["name"], "description": t["description"], "kind": "builtin"} for t in TEMPLATES]
    custom = [
        {"id": r.id, "name": r.name, "description": r.description, "kind": "custom"}
        for r in db.query(UserTemplateRow).order_by(UserTemplateRow.created_at.desc()).all()
    ]
    return builtin + custom


class SaveTemplateBody(BaseModel):
    name: str
    description: str = ""


@router.post("/projects/{project_id}/save-template")
def save_template(project_id: str, body: SaveTemplateBody, db: Session = Depends(get_db)):
    row = db.get(ProjectRow, project_id)
    if not row:
        raise HTTPException(404, "Project not found")
    tpl = UserTemplateRow(
        id=new_id(),
        name=body.name,
        description=body.description,
        snapshot=row.data,
        created_at=utcnow(),
    )
    db.add(tpl)
    db.commit()
    return {"id": tpl.id, "name": tpl.name}


@router.post("/templates/{template_id}/create", response_model=Project)
def create_from_user_template(template_id: str, body: ProjectCreate, db: Session = Depends(get_db)):
    row = db.get(UserTemplateRow, template_id)
    if row:
        data = json.loads(row.snapshot)
        project = Project.model_validate(data)
        project.id = new_id()
        project.name = body.name or row.name
        project.description = body.description or row.description
        project.created_at = datetime.now(timezone.utc).isoformat()
        project.versions = []
        return _save(db, project)
    project = create_from_template(template_id, body.name, body.description)
    return _save(db, project)


@router.get("/library")
def library():
    return {
        "types": [t.model_dump() for t in BUILTIN_TYPES],
        "presets": LIBRARY_PRESETS,
    }


@router.get("/settings", response_model=GlobalSettings)
def get_settings(db: Session = Depends(get_db)):
    row = db.get(SettingsRow, "local")
    if not row:
        return GlobalSettings()
    return GlobalSettings.model_validate_json(row.data)


@router.put("/settings", response_model=GlobalSettings)
def put_settings(body: GlobalSettings, db: Session = Depends(get_db)):
    row = db.get(SettingsRow, "local")
    if not row:
        row = SettingsRow(id="local", data=body.model_dump_json())
        db.add(row)
    else:
        row.data = body.model_dump_json()
    db.commit()
    return body


def bootstrap() -> None:
    init_db()
