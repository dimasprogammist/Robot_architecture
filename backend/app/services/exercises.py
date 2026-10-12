from __future__ import annotations

import json
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db import UserLessonProgressRow
from app.domain.exercises_catalog import all_items, public_sections
from app.services.course import mark_lesson_seen
from app.services.exercise_runner import run_item

PREFIX = "ex:"
CAPACITY_PER_SECTION = 50


def catalog_ids():
    return set(all_items().keys())


def normalize(raw: str) -> str:
    return " ".join(raw.strip().lower().replace("\\", "/").split())


def _key(exercise_id: str) -> str:
    return PREFIX + exercise_id


def _meta(row: UserLessonProgressRow | None) -> dict:
    if row is None:
        return {"draft": "", "hints": 0, "passed": False, "manual": False}
    try:
        data = json.loads(row.tasks_done or "{}")
    except json.JSONDecodeError:
        data = {}
    if isinstance(data, list):
        data = {}
    return {
        "draft": str(data.get("draft") or ""),
        "hints": int(data.get("hints") or 0),
        "passed": bool(data.get("passed")),
        "manual": bool(data.get("manual")),
    }


def _write_meta(db: Session, user_id: str, exercise_id: str, patch: dict) -> dict:
    key = _key(exercise_id)
    row = db.get(UserLessonProgressRow, (user_id, key))
    now = datetime.now(timezone.utc)
    meta = _meta(row)
    meta.update(patch)
    payload = json.dumps(meta, ensure_ascii=False)
    if row is None:
        db.add(UserLessonProgressRow(user_id=user_id, lesson_id=key, theory_done=False, tasks_done=payload, updated_at=now))
        db.flush()
        row = db.get(UserLessonProgressRow, (user_id, key))
    else:
        row.tasks_done = payload
        row.updated_at = now
    assert row is not None
    db.commit()
    return meta


def overview() -> dict:
    sections = public_sections()
    total = sum(len(s["items"]) for s in sections)
    return {"sections": sections, "total": total, "capacity_per_section": CAPACITY_PER_SECTION}


def progress(db: Session, user_id: str) -> dict:
    catalog = all_items()
    rows = (
        db.query(UserLessonProgressRow)
        .filter(UserLessonProgressRow.user_id == user_id, UserLessonProgressRow.lesson_id.like(PREFIX + "%"))
        .all()
    )
    done_ids = []
    states = {}
    for row in rows:
        eid = row.lesson_id[len(PREFIX) :]
        if eid not in catalog:
            continue
        meta = _meta(row)
        states[eid] = {**meta, "completed": bool(row.theory_done)}
        if row.theory_done:
            done_ids.append(eid)
    return {"total": len(catalog), "done": len(done_ids), "completed_ids": done_ids, "states": states}


def check_answer(db: Session, user_id: str, exercise_id: str, payload: dict) -> dict:
    item = all_items().get(exercise_id)
    if item is None:
        return {"ok": False, "reason": "Задание не найдено."}
    kind = item["kind"]
    ok = False
    if kind == "choice":
        ok = str(payload.get("option") or "") == item["answer"]
    elif kind == "multi":
        got = sorted(str(x) for x in (payload.get("options") or []))
        ok = got == sorted(str(x) for x in item.get("answers") or [])
    elif kind in {"text", "math"}:
        given = normalize(str(payload.get("text") or ""))
        ok = given in {normalize(a) for a in item.get("accept") or []}
    elif kind in {"code", "sql"}:
        run = run_item(item, payload)
        if run.get("ok"):
            mark_lesson_seen(db, user_id, _key(exercise_id), True)
            _write_meta(db, user_id, exercise_id, {"passed": True, "draft": str(payload.get("code") or payload.get("text") or "")})
        else:
            _write_meta(db, user_id, exercise_id, {"draft": str(payload.get("code") or payload.get("text") or "")})
        return {
            **run,
            "explain": item["explain"],
            "hint": (item.get("hints") or [item.get("hint") or ""])[0] if item.get("hints") or item.get("hint") else "",
        }
    else:
        given = normalize(str(payload.get("text") or payload.get("option") or ""))
        ok = given in {normalize(a) for a in item.get("accept") or []} or given == str(item.get("answer") or "")
    if ok:
        mark_lesson_seen(db, user_id, _key(exercise_id), True)
        _write_meta(db, user_id, exercise_id, {"passed": True})
    return {
        "ok": ok,
        "available": True,
        "explain": item["explain"],
        "hint": (item.get("hints") or [item.get("hint") or ""])[0] if item.get("hints") or item.get("hint") else "",
        "message": "Верно." if ok else "Пока неверно. Прочитайте пояснение и попробуйте снова.",
    }


def set_completed(db: Session, user_id: str, exercise_id: str, done: bool) -> dict:
    mark_lesson_seen(db, user_id, _key(exercise_id), done)
    _write_meta(db, user_id, exercise_id, {"manual": done})
    return {"ok": True, "completed": done}


def uncheck(db: Session, user_id: str, exercise_id: str) -> None:
    set_completed(db, user_id, exercise_id, False)


def reveal_hint(db: Session, user_id: str, exercise_id: str) -> dict:
    item = all_items().get(exercise_id)
    if item is None:
        return {"ok": False, "hint": "", "index": 0}
    hints = list(item.get("hints") or [])
    if item.get("hint") and item["hint"] not in hints:
        hints.insert(0, item["hint"])
    row = db.get(UserLessonProgressRow, (user_id, _key(exercise_id)))
    meta = _meta(row)
    nxt = min(len(hints), int(meta["hints"]) + 1)
    _write_meta(db, user_id, exercise_id, {"hints": nxt})
    opened = hints[:nxt]
    return {"ok": True, "hints": opened, "total": len(hints), "index": nxt}


def save_draft(db: Session, user_id: str, exercise_id: str, draft: str) -> dict:
    meta = _write_meta(db, user_id, exercise_id, {"draft": draft})
    return {"ok": True, "draft": meta["draft"]}
