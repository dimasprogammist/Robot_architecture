from __future__ import annotations

import ast
import os
import sqlite3
import subprocess
import sys
import tempfile
from pathlib import Path
from shutil import which

FORBIDDEN = (ast.Import, ast.ImportFrom, ast.Global, ast.Nonlocal)


def _strip_stdout(raw: bytes) -> str:
    return raw.decode("utf-8", "replace").replace("\r\n", "\n").strip()


def _forbid_python(source: str) -> str | None:
    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        return f"Синтаксис: {exc.msg}"
    for node in ast.walk(tree):
        if isinstance(node, FORBIDDEN):
            return "В учебной песочнице запрещены import и global."
        if isinstance(node, ast.Attribute) and isinstance(node.value, ast.Name) and node.value.id in {"__builtins__", "__import__"}:
            return "Обращение к __builtins__ запрещено."
        if isinstance(node, ast.Name) and node.id in {"open", "exec", "eval", "compile", "__import__"}:
            return f"Имя {node.id} запрещено."
    return None


def run_python(code: str, tests: list[dict]) -> dict:
    err = _forbid_python(code)
    if err:
        return {"ok": False, "available": True, "output": "", "error": err, "message": err}
    env = {
        "PATH": os.environ.get("PATH", ""),
        "SYSTEMROOT": os.environ.get("SYSTEMROOT", ""),
        "PYTHONIOENCODING": "utf-8",
        "PYTHONDONTWRITEBYTECODE": "1",
    }
    results = []
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "task.py"
        path.write_text(code, encoding="utf-8")
        for i, test in enumerate(tests or [{"stdout": ""}]):
            try:
                proc = subprocess.run(
                    [sys.executable, "-I", str(path)],
                    input=(test.get("stdin") or "").encode("utf-8"),
                    capture_output=True,
                    timeout=min(4, int(test.get("timeout") or 3)),
                    cwd=tmp,
                    env=env,
                    check=False,
                )
            except subprocess.TimeoutExpired:
                return {
                    "ok": False,
                    "available": True,
                    "output": "",
                    "error": "Превышено время выполнения.",
                    "message": "Слишком долго. Проверьте циклы.",
                }
            out = _strip_stdout(proc.stdout)
            err_text = _strip_stdout(proc.stderr)
            expect = str(test.get("stdout", "")).strip()
            ok = proc.returncode == 0 and (expect == "" or out == expect)
            results.append({"ok": ok, "output": out, "error": err_text, "expect": expect})
            if not ok:
                msg = err_text or (f"Ожидали «{expect}», получили «{out}»." if expect else "Программа завершилась с ошибкой.")
                return {"ok": False, "available": True, "output": out, "error": err_text, "message": msg, "tests": results}
    return {"ok": True, "available": True, "output": results[-1]["output"] if results else "", "error": "", "message": "Все тесты пройдены.", "tests": results}


def run_sql(schema: str, query: str, expected: list) -> dict:
    q = query.strip().rstrip(";")
    if not q:
        return {"ok": False, "available": True, "output": "", "error": "Пустой запрос.", "message": "Напишите SELECT."}
    low = q.lower()
    if any(word in low for word in ("attach ", "pragma", "drop ", "insert ", "update ", "delete ", "alter ")):
        return {"ok": False, "available": True, "output": "", "error": "Запрос не разрешён.", "message": "В учебной задаче нужен только SELECT."}
    try:
        conn = sqlite3.connect(":memory:")
        conn.executescript(schema)
        cur = conn.execute(q)
        rows = [list(r) for r in cur.fetchall()]
        conn.close()
    except sqlite3.Error as exc:
        return {"ok": False, "available": True, "output": "", "error": str(exc), "message": f"SQL: {exc}"}
    def norm(row: list) -> list:
        return [float(x) if isinstance(x, (int, float)) else x for x in row]

    got = [norm(r) for r in rows]
    exp = [norm(list(r)) for r in expected]
    ok = got == exp
    return {
        "ok": ok,
        "available": True,
        "output": str(got),
        "error": "",
        "message": "Верно." if ok else f"Ожидали {exp}, получили {got}.",
    }


def run_cpp(code: str, tests: list[dict]) -> dict:
    compiler = which("g++") or which("clang++") or which("c++")
    if not compiler:
        return {
            "ok": False,
            "available": False,
            "output": "",
            "error": "",
            "message": "Компилятор C++ в этой среде не установлен. Решение сохранено, но не запускалось. Это не зачёт.",
        }
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "main.cpp"
        exe = Path(tmp) / ("main.exe" if os.name == "nt" else "main")
        src.write_text(code, encoding="utf-8")
        built = subprocess.run([compiler, "-std=c++17", "-O0", str(src), "-o", str(exe)], capture_output=True, timeout=8, cwd=tmp)
        if built.returncode != 0:
            err = _strip_stdout(built.stderr) or _strip_stdout(built.stdout)
            return {"ok": False, "available": True, "output": "", "error": err, "message": err or "Ошибка компиляции."}
        for test in tests or [{"stdout": ""}]:
            try:
                proc = subprocess.run([str(exe)], input=(test.get("stdin") or "").encode(), capture_output=True, timeout=3, cwd=tmp)
            except subprocess.TimeoutExpired:
                return {"ok": False, "available": True, "output": "", "error": "Таймаут.", "message": "Программа не завершилась вовремя."}
            out = _strip_stdout(proc.stdout)
            expect = str(test.get("stdout", "")).strip()
            if proc.returncode != 0 or (expect and out != expect):
                return {"ok": False, "available": True, "output": out, "error": _strip_stdout(proc.stderr), "message": f"Ожидали «{expect}», получили «{out}»."}
    return {"ok": True, "available": True, "output": out, "error": "", "message": "Программа прошла тесты."}


def run_item(item: dict, payload: dict) -> dict:
    kind = item.get("kind")
    code = str(payload.get("code") or payload.get("text") or "")
    if kind == "code" and item.get("lang") == "python":
        return run_python(code, item.get("tests") or [])
    if kind == "sql" or (kind == "code" and item.get("lang") == "sql"):
        return run_sql(item.get("sql_schema") or "", code, item.get("expected_rows") or [])
    if kind == "code" and item.get("lang") == "cpp":
        return run_cpp(code, item.get("tests") or [])
    return {
        "ok": False,
        "available": False,
        "output": "",
        "error": "",
        "message": "Для этого задания нет исполнителя кода. Используйте проверку ответа.",
    }
