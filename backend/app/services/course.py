"""Sequential course stored as Markdown, separate from the short robotics curriculum."""

from __future__ import annotations

from pathlib import Path

COURSE_DIR = Path(__file__).resolve().parents[2] / "course"


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

        if not meta.get("id") or not meta.get("title"):
            continue

        module_id = meta.get("module_id") or path.parent.name

        items.append(
            {
                "id": meta["id"],
                "title": meta["title"],
                "module_id": module_id,
                "module_title": meta.get("module_title") or path.parent.name,
                "module_order": int(meta.get("module_order") or 0),
                "order": int(meta.get("order") or 0),
                "content": body,
                "asset_base": f"/course-assets/{path.parent.name}/",
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


def course_overview() -> dict:
    modules: dict[str, dict] = {}

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
        key=lambda m: m["order"],
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