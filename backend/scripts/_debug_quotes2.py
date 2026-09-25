# -*- coding: utf-8 -*-
from pathlib import Path
t = Path("backend/scripts/gen_09_algorithms_a.py").read_bytes()
# find first '''
idx = t.find(b"'''")
print("first at", idx, t[idx:idx+3])
# find second
idx2 = t.find(b"'''", idx+3)
print("second at", idx2, t[idx2:idx2+5], "codes", list(t[idx2:idx2+5]))

# Check if any quote-like unicode in first lesson
text = Path("backend/scripts/gen_09_algorithms_a.py").read_text(encoding="utf-8")
first = text.split("counts.append")[1][:4000]
for i, ch in enumerate(first):
    if ch in "'\"\u2018\u2019\u201c\u201d\u00b4`":
        if ord(ch) not in (39, 34, 96):
            print("unusual quote", i, hex(ord(ch)), repr(ch))

# Try compile minimal
sample = "x = '''hello\nworld\n'''\n"
import ast
ast.parse(sample)
print("minimal ok")

# Extract exact first string literal content delimiters
start = text.index("'''", text.index("algo-what"))
end = text.index("'''", start + 3)
print("first string length", end - start)
# show 50 chars before end
print(repr(text[end-20:end+5]))

# Try parse just assignment of first body
body_with_delim = text[start:end+3]
src = "x = " + body_with_delim + "\n"
try:
    ast.parse(src)
    print("body alone OK")
except SyntaxError as e:
    print("body alone FAIL", e)
    # find premature close: scan for ''' inside
    inner = body_with_delim[3:-3]
    pos = inner.find("'''")
    print("inner triple at", pos)
    # find any ''' 
    p = 0
    while True:
        p2 = inner.find("''", p)
        if p2 < 0:
            break
        print("double quote at", p2, repr(inner[p2:p2+5]))
        p = p2 + 2
