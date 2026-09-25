# -*- coding: utf-8 -*-
from pathlib import Path
import ast

t = Path("backend/scripts/gen_09_algorithms_a.py").read_text(encoding="utf-8")
lines = t.splitlines(keepends=True)

# Reconstruct each L(...) call between counts.append
# Find line ranges for each lesson body
ranges = [(20, 111), (113, 191), (193, 278), (280, 353), (355, 436), (438, 515), (517, 589), (591, 661), (663, 738), (740, 821)]

header = "".join(lines[:17])  # through def main / counts = [] roughly
# better: compile prefix + each append alone

prefix = '''from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from _lesson_lib import frontmatter, write_lesson
OUT = Path("x")
M = ("algorithms", "Алгоритмы и структуры данных", 9)
def L(lid, title, order, body):
    return 1
def main():
    counts = []
'''

for a, b in ranges:
    chunk = "".join(lines[a - 1 : b])
    src = prefix + "    " + chunk.lstrip() + "\n    return counts\n"
    try:
        ast.parse(src)
        print(f"OK {a}-{b}")
    except SyntaxError as e:
        print(f"FAIL {a}-{b}: {e}")
        # show lines around error in chunk
        print("---- first 3 lines of chunk ----")
        print("".join(lines[a - 1 : a + 2]))
