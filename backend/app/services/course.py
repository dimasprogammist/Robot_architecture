"""Sequential course stored as Markdown, separate from the short robotics curriculum."""

from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from app.db import UserLessonProgressRow

COURSE_DIR = Path(__file__).resolve().parents[2] / "course"
_NOTES_EXTS = (".svg", ".png", ".webp", ".jpg", ".jpeg")
_NUM_PREFIX = re.compile(r"^(\d+)")


def ensure_notes_folders() -> None:
    try:
        for path in COURSE_DIR.iterdir():
            if not path.is_dir() or path.name.startswith("."):
                continue
            notes = path / "notes"
            notes.mkdir(exist_ok=True)
            keep = notes / ".gitkeep"
            if not keep.exists():
                keep.write_text("", encoding="utf-8")
    except OSError:
        return


def _notes_url(md_path: Path, lesson_id: str, order: int = 0) -> str | None:
    section = md_path.parent
    if section.name.lower() in {"lesson", "lessons", "picture", "pictures"}:
        section = section.parent
    notes = section / "notes"
    if not notes.is_dir():
        return None
    stems: list[str] = []
    numbers: list[int] = []
    if order:
        numbers.append(int(order))
    match = _NUM_PREFIX.match(md_path.stem)
    if match:
        numbers.append(int(match.group(1)))
    for num in numbers:
        stems.extend([f"L{num:02d}", f"L{num}", f"{num:02d}", str(num)])
    stems.extend([lesson_id, md_path.stem])
    seen: set[str] = set()
    for stem in stems:
        if not stem or stem in seen:
            continue
        seen.add(stem)
        for ext in _NOTES_EXTS:
            candidate = notes / f"{stem}{ext}"
            if candidate.is_file():
                rel = candidate.relative_to(COURSE_DIR).as_posix()
                return f"/course-assets/{rel}"
    return None


def _parse_frontmatter(text: str) -> tuple[dict, str]:
    meta: dict = {}
    body = text

    if text.startswith("---"):
        parts = text.split("---", 2)

        if len(parts) >= 3:
            raw, body = parts[1], parts[2].lstrip("\n")

            for line in raw.strip().splitlines():
                if ":" not in line:
                    continue

                key, val = line.split(":", 1)
                meta[key.strip()] = val.strip().strip('"').strip("'")

    return meta, body


def _lessons() -> list[dict]:
    COURSE_DIR.mkdir(parents=True, exist_ok=True)

    items = []

    for path in COURSE_DIR.rglob("*.md"):
        meta, body = _parse_frontmatter(
            path.read_text(encoding="utf-8")
        )

        if meta.get("kind") == "module":
            continue

        if not meta.get("id") or not meta.get("title"):
            continue

        module_id = meta.get("module_id") or path.parent.name
        rel_dir = path.parent.relative_to(COURSE_DIR)
        asset_dir = "" if rel_dir == Path(".") else rel_dir.as_posix()
        asset_base = f"/course-assets/{asset_dir}/" if asset_dir else "/course-assets/"

        items.append(
            {
                "id": meta["id"],
                "title": meta["title"],
                "module_id": module_id,
                "module_title": meta.get("module_title") or path.parent.name,
                "module_order": int(meta.get("module_order") or 0),
                "order": int(meta.get("order") or 0),
                "content": body,
                "asset_base": asset_base,
                "notes_url": _notes_url(path, str(meta["id"]), int(meta.get("order") or 0)),
            }
        )

    items.sort(
        key=lambda x: (
            x["module_order"],
            x["order"],
            x["title"],
        )
    )

    return items


def _module_stubs() -> list[dict]:
    stubs: list[dict] = []
    COURSE_DIR.mkdir(parents=True, exist_ok=True)
    for path in COURSE_DIR.rglob("*.md"):
        meta, _body = _parse_frontmatter(path.read_text(encoding="utf-8"))
        if meta.get("kind") != "module":
            continue
        module_id = meta.get("module_id") or path.parent.name
        stubs.append(
            {
                "id": module_id,
                "order": int(meta.get("module_order") or 0),
                "title": meta.get("module_title") or meta.get("title") or path.parent.name,
                "lessons": [],
            }
        )
    return stubs


def course_overview() -> dict:
    ensure_notes_folders()
    modules: dict[str, dict] = {}

    for stub in _module_stubs():
        modules[stub["id"]] = stub

    for lesson in _lessons():
        mod = modules.setdefault(
            lesson["module_id"],
            {
                "id": lesson["module_id"],
                "order": lesson["module_order"],
                "title": lesson["module_title"],
                "lessons": [],
            },
        )

        mod["lessons"].append(
            {
                "id": lesson["id"],
                "order": lesson["order"],
                "title": lesson["title"],
            }
        )

    ordered = sorted(
        modules.values(),
        key=lambda m: (m["order"], 0 if m["lessons"] else 1, m["title"]),
    )

    total = sum(
        len(m["lessons"])
        for m in ordered
    )

    return {
        "total_lessons": total,
        "modules": ordered,
    }


def course_lesson(lesson_id: str) -> dict | None:
    lessons = _lessons()

    ids = [
        item["id"]
        for item in lessons
    ]

    if lesson_id not in ids:
        return None

    idx = ids.index(lesson_id)
    lesson = lessons[idx]

    return {
        **lesson,
        "prev_lesson_id": ids[idx - 1] if idx else None,
        "next_lesson_id": (
            ids[idx + 1]
            if idx + 1 < len(ids)
            else None
        ),
    }


def mark_lesson_seen(db: Session, user_id: str, lesson_id: str, done: bool = True) -> None:
    row = db.get(UserLessonProgressRow, (user_id, lesson_id))
    now = datetime.now(timezone.utc)
    if row is None:
        db.add(
            UserLessonProgressRow(
                user_id=user_id,
                lesson_id=lesson_id,
                theory_done=done,
                tasks_done="[]",
                updated_at=now,
            )
        )
    else:
        row.theory_done = done
        row.updated_at = now
    db.commit()