from app.domain.exercise_extra import electronics_section, extras_by_section, networks_section
from app.domain.exercises_catalog import SECTIONS, all_items, public_sections
from app.services.exercise_runner import run_python, run_sql
from app.services.exercises import CAPACITY_PER_SECTION, normalize


def test_exercise_sections_and_ids():
    ids = list(all_items())
    assert ids == list(dict.fromkeys(ids))
    titles = [s["id"] for s in SECTIONS()]
    assert titles == ["python", "sql", "cpp", "math", "terminal", "algorithms", "git", "electronics", "networks"]
    counts = {s["id"]: len(s["items"]) for s in SECTIONS()}
    extras = extras_by_section()
    assert len(electronics_section()["items"]) == 10
    assert counts["electronics"] == 10
    assert len(networks_section()["items"]) >= 10
    assert counts["networks"] >= 10
    assert all((item.get("hints") or item.get("hint")) for item in networks_section()["items"])
    for sid, items in extras.items():
        assert len(items) == 5, sid
        extra_ids = {item["id"] for item in items}
        section_ids = {item["id"] for item in next(s for s in SECTIONS() if s["id"] == sid)["items"]}
        assert extra_ids <= section_ids
        assert counts[sid] >= len(items)
    assert all(len(s["items"]) >= 1 for s in SECTIONS())
    assert CAPACITY_PER_SECTION >= 50
    assert len(ids) >= 30
    pub = public_sections()
    assert all(
        "answer" not in item and "accept" not in item and "tests" not in item and "hint" not in item and "hints" not in item and "explain" not in item
        for s in pub
        for item in s["items"]
    )
    assert all((item.get("hint_count") or 0) >= 0 for s in pub for item in s["items"])
    kinds = {item["kind"] for item in all_items().values()}
    assert {"choice", "multi", "text", "code", "sql"}.issubset(kinds) or {"choice", "text", "code"}.issubset(kinds)


def test_networks_checkable_without_running_code():
    items = all_items()
    net = items["net-hosts"]
    assert net["kind"] == "text"
    assert net.get("runnable") is False
    assert "30" in {normalize(a) for a in net["accept"]}
    assert items["net-arp"]["kind"] == "choice"
    assert items["net-arp"]["answer"] == "a"


def test_normalize_paths():
    assert normalize(r"cd C:\Users\me\src") == "cd c:/users/me/src"


def test_python_runner_print():
    out = run_python("print(2 + 2)", [{"stdout": "4"}])
    assert out["ok"] is True
    assert out["available"] is True
    assert out["output"] == "4"


def test_python_runner_forbids_import():
    out = run_python("import os\nprint(1)", [{"stdout": "1"}])
    assert out["ok"] is False
    assert "запрещ" in out["error"].lower() or "запрещ" in out["message"].lower()


def test_sql_runner_select():
    out = run_sql("CREATE TABLE t(id INTEGER); INSERT INTO t VALUES (1);", "SELECT id FROM t", [[1]])
    assert out["ok"] is True
    assert out["available"] is True
