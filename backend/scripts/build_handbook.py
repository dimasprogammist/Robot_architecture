#!/usr/bin/env python3
from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from cpp_course import cpp_articles  # noqa: E402
from handbook_lib import ROOT  # noqa: E402
from python_course import python_articles  # noqa: E402
from rest_course import rest_articles  # noqa: E402

ID_RE = re.compile(r"^id:\s*(.+)$", re.M)


def article_id(text: str) -> str:
    m = ID_RE.search(text)
    if not m:
        raise ValueError("no id")
    return m.group(1).strip()


def filter_related(text: str, known: set[str]) -> str:
    lines = text.splitlines()
    out = []
    in_rel_fm = False
    skip_related_section = False
    fm_done = 0
    for i, line in enumerate(lines):
        if line.strip() == "---":
            fm_done += 1
            out.append(line)
            continue
        if fm_done == 1 and line.startswith("related:"):
            raw = line.split(":", 1)[1].strip()
            ids = [x.strip() for x in raw.strip("[]").split(",") if x.strip()]
            ids = [x for x in ids if x in known and x != article_id(text)]
            out.append("related: [" + ", ".join(ids) + "]")
            continue
        if line.strip() == "## Связанные разделы":
            skip_related_section = True
            rels = []
            # collect from original remaining bullets later
            rest = lines[i + 1 :]
            bullets = []
            for r in rest:
                if r.startswith("- "):
                    cand = r[2:].strip()
                    if cand in known:
                        bullets.append(cand)
                elif r.startswith("#"):
                    break
            if bullets:
                out.append(line)
                out.extend(f"- {b}" for b in bullets)
            # skip until next heading or eof in this loop via flag
            continue
        if skip_related_section:
            if line.startswith("- ") or line.strip() == "":
                continue
            skip_related_section = False
        out.append(line)
    return "\n".join(out) + "\n"


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    for child in ROOT.iterdir():
        if child.is_dir() and not child.name.startswith("_"):
            shutil.rmtree(child)
    articles = python_articles() + cpp_articles() + rest_articles()
    known = {article_id(t) for t in articles}
    counts: dict[str, int] = {}
    for text in articles:
        text = filter_related(text, known)
        aid = article_id(text)
        cat = aid.split("-", 1)[0]
        # cpp ids start with cpp, software-architecture with software... wait
        # id format is {cat}-{slug} but cat may contain no extra hyphen except software-architecture
        folder = None
        for c in [
            "software-architecture",
            "microcontrollers",
            "python",
            "cpp",
            "linux",
            "git",
            "bash",
            "sql",
            "docker",
            "databases",
            "networking",
            "protocols",
            "electronics",
            "robotics",
            "app",
        ]:
            if aid.startswith(c + "-"):
                folder = c
                break
        if not folder:
            raise SystemExit(f"unknown cat for {aid}")
        slug = aid[len(folder) + 1 :]
        dest = ROOT / folder
        dest.mkdir(parents=True, exist_ok=True)
        (dest / f"{slug}.md").write_text(text, encoding="utf-8")
        counts[folder] = counts.get(folder, 0) + 1
    print("articles", sum(counts.values()))
    for k in sorted(counts):
        print(f"  {k}: {counts[k]}")


if __name__ == "__main__":
    main()
