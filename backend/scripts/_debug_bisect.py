# -*- coding: utf-8 -*-
from pathlib import Path
import ast

text = Path("backend/scripts/gen_09_algorithms_a.py").read_text(encoding="utf-8")
lines = text.splitlines(keepends=True)

# Keep header through line 18 (counts = [])
# Then add lessons 1..k
header = "".join(lines[:19])  # lines 1-19
footer = "".join(lines[822:])  # from print progress

ranges = [(20, 111), (113, 191), (193, 278), (280, 353), (355, 436), (438, 515), (517, 589), (591, 661), (663, 738), (740, 821)]

for k in range(1, 11):
    body = "".join("".join(lines[a-1:b]) for a, b in ranges[:k])
    # need blank lines between? ranges already include content
    # also include skipped blank lines between lessons - optional
    src = header + body + footer
    try:
        ast.parse(src)
        print(f"first {k} lessons OK")
    except SyntaxError as e:
        print(f"first {k} lessons FAIL: {e}")
        break

# Inspect stack lesson line with brackets for quote chars
for n, line in enumerate(lines, 1):
    if n in (468, 469, 470, 482, 485, 487, 493):
        print(n, [hex(ord(c)) for c in line if c in "'\"`"] , line[:100])
