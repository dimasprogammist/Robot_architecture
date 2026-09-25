from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "learning"


def fm(meta: dict) -> str:
    lines = ["---"]
    for k, v in meta.items():
        if isinstance(v, list):
            inner = ", ".join(str(x) for x in v)
            lines.append(f"{k}: [{inner}]")
        else:
            lines.append(f"{k}: {v}")
    lines.append("---")
    return "\n".join(lines) + "\n\n"


def bullets(items: list[str]) -> str:
    return "\n".join(f"- {x}" for x in items)


def render(
    *,
    cat: str,
    slug: str,
    title: str,
    section: str,
    order: int,
    description: str,
    tags: list[str],
    technologies: list[str],
    related: list[str],
    about: str,
    robot: str,
    lang: str,
    code: str,
    example: str | None = None,
    mistakes: list[str],
    canvas: str,
    extra: str = "",
) -> str:
    aid = f"{cat}-{slug}"
    meta = {
        "id": aid,
        "title": title,
        "category": cat,
        "section": section,
        "order": order,
        "description": description,
        "tags": tags,
        "technologies": technologies,
        "related": related,
    }
    parts = [
        fm(meta),
        f"# {title}\n\n",
        about.strip() + "\n\n",
        "## Зачем это в робототехнической системе\n\n",
        robot.strip() + "\n\n",
        "## Синтаксис и контракт\n\n",
        f"```{lang}\n{code.strip()}\n```\n\n",
    ]
    if example:
        parts += ["## Пример\n\n", f"```{lang}\n{example.strip()}\n```\n\n"]
    parts += [
        "## Типичные ошибки\n\n",
        bullets(mistakes) + "\n\n",
        "## В Architecture Canvas\n\n",
        canvas.strip() + "\n\n",
    ]
    if extra:
        parts += [extra.strip() + "\n"]
    if related:
        parts += ["## Связанные разделы\n\n", bullets(related) + "\n"]
    return "".join(parts)


def write_article(cat: str, slug: str, text: str) -> None:
    folder = ROOT / cat
    folder.mkdir(parents=True, exist_ok=True)
    (folder / f"{slug}.md").write_text(text, encoding="utf-8")
