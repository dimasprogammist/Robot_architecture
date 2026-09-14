from __future__ import annotations

from datetime import datetime, timezone

from app.domain.schema import Project


def import_json(payload: dict) -> Project:
    if "project" in payload and isinstance(payload["project"], dict) and payload["project"].get("components") is not None:
        data = payload["project"]
    elif payload.get("format") == "architecture-canvas" and "system" in payload:
        data = payload.get("project") or _from_semantic(payload)
    else:
        data = payload
    project = Project.model_validate(data)
    project.updated_at = datetime.now(timezone.utc).isoformat()
    return project


def _from_semantic(payload: dict) -> dict:
    if payload.get("project"):
        return payload["project"]
    raise ValueError("JSON must contain a full project snapshot under 'project' or be a Project object")
