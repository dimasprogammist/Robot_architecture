"""Service layer for the sequential robotics tutorial ("Учебник").

Responsibilities:
- expose modules/lessons with lock/completion status derived from progress
  stored in the DB (CurriculumProgressRow, one row per lesson)
- grade quiz answers (server-side, so the correct option is never sent to
  the client until after it answers)
- grade code tasks by actually running the student's code in a separate
  process with a timeout, so a runaway loop can't hang the backend
"""

from __future__ import annotations

import json
import multiprocessing as mp
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db import UserLessonProgressRow
from app.domain.curriculum_content import LESSON_INDEX, LESSON_MODULE, MODULE_INDEX, flat_lesson_sequence
from app.domain.curriculum_schema import (
    CodeCheckRequest,
    CourseProgressOut,
    LessonDetail,
    LessonProgress,
    LessonSummary,
    ModuleSummary,
    QuizCheckRequest,
    TaskCheckResult,
    TaskPublic,
)

CODE_TIMEOUT_SECONDS = 5


# ---- progress persistence -----------------------------------------------------


def _load_progress(db: Session, user_id: str, lesson_id: str) -> LessonProgress:
    row = db.get(UserLessonProgressRow, (user_id, lesson_id))
    if row is None:
        return LessonProgress(lesson_id=lesson_id)
    try:
        tasks_done = json.loads(row.tasks_done)
    except (json.JSONDecodeError, TypeError):
        tasks_done = []
    return LessonProgress(lesson_id=lesson_id, theory_done=row.theory_done, tasks_done=tasks_done)


def _load_all_progress(db: Session, user_id: str) -> dict[str, LessonProgress]:
    rows = db.query(UserLessonProgressRow).filter(UserLessonProgressRow.user_id == user_id).all()
    out: dict[str, LessonProgress] = {}
    for row in rows:
        try:
            tasks_done = json.loads(row.tasks_done)
        except (json.JSONDecodeError, TypeError):
            tasks_done = []
        out[row.lesson_id] = LessonProgress(
            lesson_id=row.lesson_id, theory_done=row.theory_done, tasks_done=tasks_done
        )
    return out


def _save_progress(db: Session, user_id: str, progress: LessonProgress) -> None:
    row = db.get(UserLessonProgressRow, (user_id, progress.lesson_id))
    now = datetime.now(timezone.utc)
    if row is None:
        row = UserLessonProgressRow(
            user_id=user_id,
            lesson_id=progress.lesson_id,
            theory_done=progress.theory_done,
            tasks_done=json.dumps(progress.tasks_done),
            updated_at=now,
        )
        db.add(row)
    else:
        row.theory_done = progress.theory_done
        row.tasks_done = json.dumps(progress.tasks_done)
        row.updated_at = now
    db.commit()


def _lesson_locked_map() -> dict[str, bool]:
    """Every lesson is available. Completion is tracked, but nothing is gated."""
    return {lesson.id: False for _module, lesson in flat_lesson_sequence()}


# ---- public read API -----------------------------------------------------------


def get_course_overview(db: Session, user_id: str) -> CourseProgressOut:
    locked_map = _lesson_locked_map()
    all_progress = _load_all_progress(db, user_id)
    modules_out: list[ModuleSummary] = []
    total = 0
    completed = 0
    for module in sorted(MODULE_INDEX.values(), key=lambda m: m.order):
        lesson_summaries: list[LessonSummary] = []
        for lesson in sorted(module.lessons, key=lambda l: l.order):
            total += 1
            prog = all_progress.get(lesson.id, LessonProgress(lesson_id=lesson.id))
            task_ids = [t.id for t in lesson.tasks]
            is_complete = prog.is_complete(task_ids)
            if is_complete:
                completed += 1
            lesson_summaries.append(
                LessonSummary(
                    id=lesson.id,
                    order=lesson.order,
                    title=lesson.title,
                    summary=lesson.summary,
                    technologies=lesson.technologies,
                    task_count=len(lesson.tasks),
                    locked=locked_map.get(lesson.id, True),
                    completed=is_complete,
                )
            )
        modules_out.append(
            ModuleSummary(
                id=module.id,
                order=module.order,
                title=module.title,
                goal=module.goal,
                icon=module.icon,
                lessons=lesson_summaries,
            )
        )
    return CourseProgressOut(total_lessons=total, completed_lessons=completed, modules=modules_out)


def get_lesson_detail(db: Session, user_id: str, lesson_id: str) -> LessonDetail | None:
    lesson = LESSON_INDEX.get(lesson_id)
    if lesson is None:
        return None
    module = MODULE_INDEX[LESSON_MODULE[lesson_id]]
    locked_map = _lesson_locked_map()
    progress = _load_progress(db, user_id, lesson_id)

    sequence = flat_lesson_sequence()
    ids_in_order = [l.id for _m, l in sequence]
    idx = ids_in_order.index(lesson_id)
    prev_id = ids_in_order[idx - 1] if idx > 0 else None
    next_id = ids_in_order[idx + 1] if idx < len(ids_in_order) - 1 else None

    tasks_public = [
        TaskPublic(
            id=t.id,
            type=t.type,
            prompt=t.prompt,
            hint=t.hint,
            options=t.options,
            starter_code=t.starter_code,
            passed=t.id in progress.tasks_done,
        )
        for t in lesson.tasks
    ]

    return LessonDetail(
        id=lesson.id,
        order=lesson.order,
        title=lesson.title,
        summary=lesson.summary,
        why=lesson.why,
        technologies=lesson.technologies,
        theory=lesson.theory,
        glossary=lesson.glossary,
        common_mistakes=lesson.common_mistakes,
        tasks=tasks_public,
        theory_done=progress.theory_done,
        locked=locked_map.get(lesson.id, True),
        module_id=module.id,
        module_title=module.title,
        prev_lesson_id=prev_id,
        next_lesson_id=next_id,
    )


def mark_theory_done(db: Session, user_id: str, lesson_id: str) -> LessonDetail | None:
    if lesson_id not in LESSON_INDEX:
        return None
    progress = _load_progress(db, user_id, lesson_id)
    progress.theory_done = True
    _save_progress(db, user_id, progress)
    return get_lesson_detail(db, user_id, lesson_id)


# ---- grading --------------------------------------------------------------------


def check_quiz(db: Session, user_id: str, lesson_id: str, task_id: str, req: QuizCheckRequest) -> TaskCheckResult | None:
    lesson = LESSON_INDEX.get(lesson_id)
    if lesson is None:
        return None
    task = next((t for t in lesson.tasks if t.id == task_id), None)
    if task is None or task.type != "quiz":
        return None

    passed = req.option_id == task.correct_option_id
    if passed:
        progress = _load_progress(db, user_id, lesson_id)
        if task_id not in progress.tasks_done:
            progress.tasks_done.append(task_id)
        _save_progress(db, user_id, progress)

    return TaskCheckResult(passed=passed, explanation=task.explanation)


def _run_code_worker(code: str, setup_code: str, tests: list[dict], queue: "mp.Queue") -> None:
    ns: dict = {}
    try:
        if setup_code:
            exec(setup_code, ns)
        exec(code, ns)
    except Exception as e:  # noqa: BLE001 - deliberately broad, this is student code
        queue.put({"passed": False, "error": f"Ошибка при выполнении кода: {e}", "test_results": []})
        return

    results = []
    all_passed = True
    for test in tests:
        try:
            actual = eval(test["call"], ns)  # noqa: S307 - sandboxed subprocess, local single-user tool
            actual_repr = repr(actual)
            ok = actual_repr == test["expected"]
        except Exception as e:  # noqa: BLE001
            ok = False
            actual_repr = f"Ошибка: {e}"
        all_passed = all_passed and ok
        results.append(
            {
                "call": test["call"],
                "expected": test["expected"],
                "actual": actual_repr,
                "passed": ok,
                "label": test.get("label", ""),
            }
        )
    queue.put({"passed": all_passed, "test_results": results})


def _run_code_sandboxed(code: str, setup_code: str, tests: list[dict]) -> dict:
    queue: mp.Queue = mp.Queue()
    process = mp.Process(target=_run_code_worker, args=(code, setup_code, tests, queue))
    process.start()
    process.join(CODE_TIMEOUT_SECONDS)
    if process.is_alive():
        process.terminate()
        process.join()
        return {
            "passed": False,
            "error": "Превышено время выполнения — возможно, в коде бесконечный цикл.",
            "test_results": [],
        }
    if not queue.empty():
        return queue.get()
    return {
        "passed": False,
        "error": "Код завершился аварийно (процесс упал без результата).",
        "test_results": [],
    }


def check_code(db: Session, user_id: str, lesson_id: str, task_id: str, req: CodeCheckRequest) -> TaskCheckResult | None:
    lesson = LESSON_INDEX.get(lesson_id)
    if lesson is None:
        return None
    task = next((t for t in lesson.tasks if t.id == task_id), None)
    if task is None or task.type != "code":
        return None

    tests_as_dicts = [t.model_dump() for t in task.tests]
    outcome = _run_code_sandboxed(req.code, task.setup_code, tests_as_dicts)

    if outcome.get("passed"):
        progress = _load_progress(db, user_id, lesson_id)
        if task_id not in progress.tasks_done:
            progress.tasks_done.append(task_id)
        _save_progress(db, user_id, progress)

    return TaskCheckResult(
        passed=bool(outcome.get("passed")),
        error=outcome.get("error"),
        test_results=outcome.get("test_results", []),
    )
