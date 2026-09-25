# -*- coding: utf-8 -*-
from pathlib import Path
import ast, traceback
p = Path("backend/scripts/gen_09_algorithms_a.py")
text = p.read_text(encoding="utf-8")
print("endswith", repr(text[-80:]))
print("lines", text.count("\n"), "cr", text.count("\r"))
try:
    ast.parse(text)
    print("OK")
except SyntaxError as e:
    traceback.print_exc()
    # binary search: which lesson breaks full file
    # Replace all lesson bodies with short stubs and add back one by one
