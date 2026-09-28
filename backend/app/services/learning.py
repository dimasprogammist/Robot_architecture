
from __future__ import annotations

from pathlib import Path


LEARNING_DIR = Path(__file__).resolve().parents[2] / "learning"


CATEGORY_ORDER = [
    # Основная последовательность справочника — как в Учебнике.
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

    # Дополнительные специализированные разделы.
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


CATEGORY_LABELS = {
    "guide-computer": "· Компьютер",
    "guide-os": "· Операционная система",
    "guide-terminal": "· Терминал",
    "guide-linux": "· Linux",
    "guide-networks": "· Сети",
    "guide-git": "· Git",
    "guide-programming": "· Программирование",
    "guide-python": "· Python",
    "guide-algorithms": "· Алгоритмы",
    "guide-sql": "· SQL и базы",
    "guide-backend": "· Backend",
    "guide-fastapi": "· FastAPI",
    "guide-websocket": "· WebSocket",
    "guide-frontend": "· Frontend",
    "guide-architecture": "· Архитектура",
    "guide-kafka": "· Kafka",
    "guide-docker": "· Docker",

    "devices": "· Устройства компьютера",
    "networking": "· Компьютерные сети",
    "python": "Языки программирования · Python",
    "cpp": "Языки программирования · C++",
    "vision": "· Машинное зрение",
    "neural": "· Нейронные сети",
    "linux": "· Linux",
    "git": "· Git",
    "bash": "· Bash",
    "sql": "· SQL",
    "docker": "· Docker",
    "databases": "· Базы данных",
    "protocols": "· Протоколы",
    "microcontrollers": "· Микроконтроллеры",
    "electronics": "· Электроника",
    "robotics": "· Робототехника",
    "software-architecture": "· Архитектура ПО",
    "app": "· Работа с Architecture Canvas",
}


_CATEGORY_ORDER_INDEX = {
    category: index
    for index, category in enumerate(CATEGORY_ORDER)
}


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
                    meta[key] = [
                        x.strip().strip('"').strip("'")
                        for x in val[1:-1].split(",")
                        if x.strip()
                    ]
                else:
                    meta[key] = val

    return meta, body


def list_articles() -> list[dict]:
    LEARNING_DIR.mkdir(parents=True, exist_ok=True)

    items = []

    for path in sorted(LEARNING_DIR.rglob("*.md")):
        meta, _ = _parse_frontmatter(
            path.read_text(encoding="utf-8")
        )

        rel = path.relative_to(LEARNING_DIR).as_posix()

        items.append(
            {
                "id": meta.get("id")
                or rel.replace(".md", "").replace("/", "-"),
                "path": rel,
                "title": meta.get("title") or path.stem,
                "description": meta.get("description") or "",
                "category": meta.get("category")
                or path.parent.name,
                "tags": meta.get("tags") or [],
                "order": int(meta.get("order") or 0),
                "related": meta.get("related") or [],
                "technologies": meta.get("technologies") or [],
                "section": meta.get("section") or "",
            }
        )

    items.sort(
        key=lambda article: (
            _CATEGORY_ORDER_INDEX.get(
                article["category"],
                len(CATEGORY_ORDER),
            ),
            article["category"],
            article["order"],
            article["title"],
        )
    )

    return items


def get_article(article_id: str) -> dict | None:
    for item in list_articles():
        if (
            item["id"] == article_id
            or item["path"] == article_id
        ):
            path = LEARNING_DIR / item["path"]

            meta, body = _parse_frontmatter(
                path.read_text(encoding="utf-8")
            )

            return {
                **item,
                "content": body,
                "links": meta.get("links") or [],
            }

    return None


def categories() -> list[dict]:
    grouped: dict[str, list] = {}

    for article in list_articles():
        grouped.setdefault(
            article["category"],
            [],
        ).append(
            {
                "id": article["id"],
                "title": article["title"],
                "description": article["description"],
                "section": article.get("section") or "",
                "order": article.get("order") or 0,
            }
        )

    out = []

    for key in CATEGORY_ORDER:
        if key not in grouped:
            continue

        articles = grouped[key]

        articles.sort(
            key=lambda article: (
                article["order"],
                article["title"],
            )
        )

        out.append(
            {
                "id": key,
                "name": CATEGORY_LABELS.get(key, key),
                "articles": articles,
            }
        )

    # Не теряем новые категории, которые появятся в будущем.
    # Они идут после основного курса и сортируются по названию.
    extra = sorted(
        (
            (key, articles)
            for key, articles in grouped.items()
            if key not in _CATEGORY_ORDER_INDEX
        ),
        key=lambda item: item[0],
    )

    for key, articles in extra:
        articles.sort(
            key=lambda article: (
                article["order"],
                article["title"],
            )
        )

        out.append(
            {
                "id": key,
                "name": CATEGORY_LABELS.get(key, key),
                "articles": articles,
            }
        )

    return out

