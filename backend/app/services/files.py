from __future__ import annotations

from pathlib import Path

from app.db import DATA_DIR, new_id, utcnow

FILES_DIR = DATA_DIR / "files"
FILES_DIR.mkdir(parents=True, exist_ok=True)

KIND_BY_EXT = {
    ".stl": "stl",
    ".step": "step",
    ".stp": "stp",
    ".obj": "obj",
    ".pdf": "pdf",
    ".md": "markdown",
}


def save_upload(project_id: str, filename: str, content: bytes) -> dict:
    ext = Path(filename).suffix.lower()
    file_id = new_id()
    stored = f"{file_id}{ext}"
    dest_dir = FILES_DIR / project_id
    dest_dir.mkdir(parents=True, exist_ok=True)
    path = dest_dir / stored
    path.write_bytes(content)
    return {
        "id": file_id,
        "filename": filename,
        "kind": KIND_BY_EXT.get(ext, "other"),
        "mime": "",
        "size": len(content),
        "version": "1",
        "description": "",
        "uploaded_at": utcnow().isoformat(),
        "stored": stored,
        "project_id": project_id,
    }


def resolve_path(project_id: str, file_id: str, filename: str | None = None) -> Path | None:
    dest_dir = FILES_DIR / project_id
    if not dest_dir.exists():
        return None
    for p in dest_dir.iterdir():
        if p.stem == file_id or p.name.startswith(file_id):
            return p
    return None
