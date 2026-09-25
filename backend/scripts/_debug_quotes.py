# -*- coding: utf-8 -*-
from pathlib import Path
t = Path("backend/scripts/gen_09_algorithms_a.py").read_text(encoding="utf-8")
# Find all ''' positions
positions = []
i = 0
while True:
    j = t.find("'''", i)
    if j < 0:
        break
    line = t.count("\n", 0, j) + 1
    ctx = repr(t[max(0, j - 10) : j + 13])
    positions.append((line, j, ctx))
    i = j + 3
print("count", len(positions))
for p in positions:
    print(p)

# Also find any line with odd single-quote patterns in stack section
for n, line in enumerate(t.splitlines(), 1):
    if "'''" in line or line.count("'") >= 3:
        if 460 <= n <= 520:
            print(n, line.count("'"), repr(line[:120]))
