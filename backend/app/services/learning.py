from __future__ import annotations

from pathlib import Path

LEARNING_DIR = Path(__file__).resolve().parents[2] / "learning"


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
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if val.startswith("[") and val.endswith("]"):
                    meta[key] = [x.strip().strip('"').strip("'") for x in val[1:-1].split(",") if x.strip()]
                else:
                    meta[key] = val
    return meta, body


def list_articles() -> list[dict]:
    LEARNING_DIR.mkdir(parents=True, exist_ok=True)
    items = []
    for path in sorted(LEARNING_DIR.rglob("*.md")):
        meta, _ = _parse_frontmatter(path.read_text(encoding="utf-8"))
        rel = path.relative_to(LEARNING_DIR).as_posix()
        items.append(
            {
                "id": meta.get("id") or rel.replace(".md", "").replace("/", "-"),
                "path": rel,
                "title": meta.get("title") or path.stem,
                "description": meta.get("description") or "",
                "category": meta.get("category") or path.parent.name,
                "tags": meta.get("tags") or [],
                "order": int(meta.get("order") or 0),
                "related": meta.get("related") or [],
                "technologies": meta.get("technologies") or [],
                "section": meta.get("section") or "",
            }
        )
    items.sort(key=lambda a: (a["category"], a["order"], a["title"]))
    return items


def get_article(article_id: str) -> dict | None:
    for item in list_articles():
        if item["id"] == article_id or item["path"] == article_id:
            path = LEARNING_DIR / item["path"]
            meta, body = _parse_frontmatter(path.read_text(encoding="utf-8"))
            return {**item, "content": body, "links": meta.get("links") or []}
    return None


def categories() -> list[dict]:
    grouped: dict[str, list] = {}
    for a in list_articles():
        grouped.setdefault(a["category"], []).append(
            {
                "id": a["id"],
                "title": a["title"],
                "description": a["description"],
                "section": a.get("section") or "",
                "order": a.get("order") or 0,
            }
        )
    order = [
        "guide-computer",
        "guide-os",
        "guide-terminal",
        "guide-linux",
        "guide-networks",
        "guide-git",
        "guide-programming",
        "guide-python",
        "guide-algorithms",
        "guide-sql",
        "guide-backend",
        "guide-fastapi",
        "guide-websocket",
        "guide-frontend",
        "guide-architecture",
        "guide-kafka",
        "guide-docker",
        "devices",
        "networking",
        "python",
        "cpp",
        "vision",
        "neural",
        "git",
        "linux",
        "bash",
        "sql",
        "docker",
        "databases",
        "protocols",
        "microcontrollers",
        "electronics",
        "robotics",
        "software-architecture",
        "app",
    ]
    labels = {
        "guide-computer": "Справочник · компьютер",
        "guide-os": "Справочник · операционная система",
        "guide-terminal": "Справочник · терминал",
        "guide-linux": "Справочник · Linux",
        "guide-networks": "Справочник · сети",
        "guide-git": "Справочник · Git",
        "guide-programming": "Справочник · программирование",
        "guide-python": "Справочник · Python",
        "guide-algorithms": "Справочник · алгоритмы",
        "guide-sql": "Справочник · SQL и базы",
        "guide-backend": "Справочник · backend",
        "guide-fastapi": "Справочник · FastAPI",
        "guide-websocket": "Справочник · WebSocket",
        "guide-frontend": "Справочник · frontend",
        "guide-architecture": "Справочник · архитектура",
        "guide-kafka": "Справочник · Kafka",
        "guide-docker": "Справочник · Docker",
        "devices": "Устройства компьютера",
        "networking": "Компьютерные сети",
        "python": "Языки программирования · Python",
        "cpp": "Языки программирования · C++",
        "vision": "Машинное зрение",
        "neural": "Нейронные сети",
        "linux": "Linux",
        "git": "Git",
        "bash": "Bash",
        "sql": "SQL",
        "docker": "Docker",
        "databases": "Databases",
        "protocols": "Protocols",
        "microcontrollers": "Microcontrollers",
        "electronics": "Electronics",
        "robotics": "Robotics",
        "software-architecture": "Software Architecture",
        "app": "Using Architecture Canvas",
    }
    out = []
    seen = set()
    for key in order:
        if key in grouped:
            out.append({"id": key, "name": labels.get(key, key), "articles": grouped[key]})
            seen.add(key)
    for key, arts in grouped.items():
        if key not in seen:
            out.append({"id": key, "name": labels.get(key, key), "articles": arts})
    return out
