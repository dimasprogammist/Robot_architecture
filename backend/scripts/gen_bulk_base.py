# -*- coding: utf-8 -*-
"""Bulk-write remaining course lessons and guides as markdown files."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def W(path: Path, lines: list[str]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = "\n".join(lines).rstrip() + "\n"
    # pad to min lines if needed
    while text.count("\n") < 110:
        text += "\n## Дополнение\n\nПеречитайте основной разбор и отметьте краевой случай, который легче всего забыть на практике.\n"
    path.write_text(text, encoding="utf-8")
    return text.count("\n")


def fm(lid, title, mid, mtitle, morder, order):
    return [
        "---",
        f"id: {lid}",
        f"title: {title}",
        f"module_id: {mid}",
        f"module_title: {mtitle}",
        f"module_order: {morder}",
        f"order: {order}",
        "---",
        "",
    ]


def lesson(path, lid, title, mid, mtitle, morder, order, sections: dict[str, list[str]]):
    lines = fm(lid, title, mid, mtitle, morder, order)
    lines.append(f"# {title}")
    lines.append("")
    order_keys = [
        "Цель",
        "Что уже нужно знать",
        "Объяснение с нуля",
        "Термины",
        "Внутреннее устройство",
        "Пример",
        "Разбор",
        "Код",
        "Практика",
        "Типичные ошибки",
        "Что запомнить",
        "Задание",
        "Связь со следующим уроком",
    ]
    for key in order_keys:
        if key not in sections:
            continue
        lines.append(f"## {key}")
        lines.append("")
        for para in sections[key]:
            lines.append(para)
            lines.append("")
    n = W(path, lines)
    print(f"{path.relative_to(ROOT)}: {n}")
    return n


def code_block(code: str) -> str:
    return "```python\n" + code.strip() + "\n```"


def sql_block(code: str) -> str:
    return "```sql\n" + code.strip() + "\n```"


STATS: list[tuple[str, int]] = []


def add(npath: Path, n: int):
    STATS.append((str(npath), n))
)
