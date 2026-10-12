"""Move Reference markdown into Learning-style numbered folders. Does not rewrite file contents."""

from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "learning"

FOLDER_TO_MODULE = {
    "devices": "01-guide-computer",
    "python": "07-guide-python",
    "cpp": "08-guide-cpp",
    "git": "11-guide-git",
    "linux": "04-guide-linux",
    "bash": "03-guide-terminal",
    "sql": "12-guide-sql",
    "databases": "12b-guide-nosql",
    "docker": "19-guide-docker",
    "electronics": "20-guide-electronics",
    "microcontrollers": "21-guide-microcontrollers",
    "protocols": "22-guide-protocols",
    "robotics": "23-guide-robotics",
    "vision": "24-guide-computer-vision",
    "neural": "26-guide-neural-networks",
    "networking": "10-guide-networks",
    "software-architecture": "17-guide-architecture",
    "app": "app",
}

GUIDE_CATEGORY_TO_MODULE = {
    "guide-computer": "01-guide-computer",
    "guide-os": "02-guide-os",
    "guide-terminal": "03-guide-terminal",
    "guide-linux": "04-guide-linux",
    "guide-programming": "06-guide-programming",
    "guide-python": "07-guide-python",
    "guide-algorithms": "09-guide-algorithms",
    "guide-networks": "10-guide-networks",
    "guide-git": "11-guide-git",
    "guide-sql": "12-guide-sql",
    "guide-backend": "13-guide-backend",
    "guide-fastapi": "14-guide-fastapi",
    "guide-websocket": "15-guide-websocket",
    "guide-frontend": "16-guide-frontend",
    "guide-architecture": "17-guide-architecture",
    "guide-kafka": "18-guide-kafka",
    "guide-docker": "19-guide-docker",
}


def _category(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return ""
    parts = text.split("---", 2)
    if len(parts) < 3:
        return ""
    for line in parts[1].splitlines():
        if line.startswith("category:"):
            return line.split(":", 1)[1].strip().strip('"').strip("'")
    return ""


def _move_file(src: Path, dest_dir: Path) -> str:
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / src.name
    if dest.resolve() == src.resolve():
        return f"skip {src.relative_to(ROOT)}"
    if dest.exists():
        raise SystemExit(f"Refusing to overwrite {dest}")
    shutil.move(str(src), str(dest))
    return f"{src.relative_to(ROOT)} -> {dest.relative_to(ROOT)}"


def main() -> None:
    moved: list[str] = []
    guides = ROOT / "guides"
    if guides.is_dir():
        for path in sorted(guides.glob("*.md")):
            cat = _category(path)
            module = GUIDE_CATEGORY_TO_MODULE.get(cat) or "guides"
            moved.append(_move_file(path, ROOT / module))
        if guides.is_dir() and not any(guides.iterdir()):
            guides.rmdir()

    for folder, module in FOLDER_TO_MODULE.items():
        src_dir = ROOT / folder
        if not src_dir.is_dir() or src_dir.name == module:
            continue
        dest_dir = ROOT / module
        for path in sorted(src_dir.iterdir()):
            if path.is_file():
                moved.append(_move_file(path, dest_dir))
        leftover = list(src_dir.rglob("*"))
        if not leftover:
            src_dir.rmdir()

    print("\n".join(moved))
    print(f"moved {len(moved)} files")


if __name__ == "__main__":
    main()
