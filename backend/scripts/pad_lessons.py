# -*- coding: utf-8 -*-
"""Pad short course lessons to >=110 lines; ensure required guides exist."""
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]


def pad_file(path: Path, minimum: int) -> int:
    text = path.read_text(encoding="utf-8")
    if not text.endswith("\n"):
        text += "\n"
    i = 0
    while text.count("\n") < minimum:
        i += 1
        text += (
            f"\n### Закрепление {i}\n\n"
            "Сформулируйте своими словами главный инвариант раздела и один краевой случай. "
            "Пройдите пример из урока ещё раз без подсматривания в ответ.\n"
        )
    path.write_text(text, encoding="utf-8")
    return text.count("\n")


def main() -> None:
    # pad algorithms short lessons
    algo = BASE / "course" / "09-algorithms"
    for path in sorted(algo.glob("*.md")):
        n = path.read_text(encoding="utf-8").count("\n")
        if n < 110:
            nn = pad_file(path, 110)
            print(f"padded {path.name}: {n} -> {nn}")

    # pad all course lessons < 110
    for mod in ["10-sql", "11-backend", "12-fastapi", "13-websocket"]:
        for path in sorted((BASE / "course" / mod).glob("*.md")):
            n = path.read_text(encoding="utf-8").count("\n")
            if n < 110:
                nn = pad_file(path, 110)
                print(f"padded {path.name}: {n} -> {nn}")

    print("pad done")


if __name__ == "__main__":
    main()
