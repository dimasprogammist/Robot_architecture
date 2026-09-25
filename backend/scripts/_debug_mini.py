# -*- coding: utf-8 -*-
from pathlib import Path
import ast

text = Path("backend/scripts/gen_09_algorithms_a.py").read_text(encoding="utf-8")
lines = text.splitlines(keepends=True)
chunk = "".join(lines[19:111])  # lines 20-111
src = "def L(*a):\n    pass\ndef main():\n    counts = []\n" + chunk + "\n    return counts\n"
Path("backend/scripts/_mini_a.py").write_text(src, encoding="utf-8")
print("chunk end", repr(chunk[-30:]))
print("src end", repr(src[-40:]))
try:
    ast.parse(src)
    print("mini OK")
except SyntaxError as e:
    print("mini FAIL", e)
    # Check: is ''' closed? count
    print("triple count in chunk", chunk.count("'''"))
    # Show if ) after
    print("line 111 raw", repr(lines[110]))
