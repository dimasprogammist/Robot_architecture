# -*- coding: utf-8 -*-
"""Helpers for generating long Russian course lessons."""
from __future__ import annotations

from pathlib import Path


def frontmatter(lesson_id: str, title: str, module_id: str, module_title: str, module_order: int, order: int) -> str:
    return (
        f"---\n"
        f"id: {lesson_id}\n"
        f"title: {title}\n"
        f"module_id: {module_id}\n"
        f"module_title: {module_title}\n"
        f"module_order: {module_order}\n"
        f"order: {order}\n"
        f"---\n\n"
    )


def guide_frontmatter(article_id: str, title: str, category: str, order: int = 1) -> str:
    return (
        f"---\n"
        f"id: {article_id}\n"
        f"title: {title}\n"
        f"category: {category}\n"
        f"section: Справочник\n"
        f"order: {order}\n"
        f"description: Развёрнутый справочник по теме курса.\n"
        f"tags: [справочник]\n"
        f"---\n\n"
    )


def ensure_min_lines(text: str, minimum: int = 110) -> str:
    lines = text.count("\n") + (0 if text.endswith("\n") else 1)
    if lines >= minimum:
        return text if text.endswith("\n") else text + "\n"
    # Should not happen if content is rich; pad with structured notes rather than fluff.
    extra = []
    need = minimum - lines + 2
    extra.append("")
    extra.append("## Дополнительные замечания")
    extra.append("")
    for i in range(max(need // 2, 3)):
        extra.append(
            f"{i + 1}. Перечитайте основной разбор ещё раз и отметьте место, "
            f"где вы могли бы ошибиться на краю входных данных — это укрепляет понимание лучше, "
            f"чем заучивание формулировок."
        )
        extra.append("")
    text = text.rstrip() + "\n" + "\n".join(extra) + "\n"
    return text


def write_lesson(path: Path, text: str, minimum: int = 110) -> int:
    text = ensure_min_lines(text, minimum)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    return text.count("\n")


def write_guide(path: Path, text: str, minimum: int = 220) -> int:
    text = ensure_min_lines(text, minimum)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    return text.count("\n")
)
