"""Schema for the sequential robotics tutorial ("Учебник").

This is deliberately separate from the reference library (`learning.py` /
`Справочник`): the tutorial is an ordered course with locked/unlocked
lessons and graded tasks, while the reference is a free-form lookup.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

TaskType = Literal["quiz", "code"]


class QuizOption(BaseModel):
    id: str
    text: str


class CodeTest(BaseModel):
    """A single check: evaluate `call` against the student's code and
    compare `repr(result)` to `expected`."""

    call: str
    expected: str
    label: str = ""


class CurriculumTask(BaseModel):
    id: str
    type: TaskType
    prompt: str
    hint: str = ""

    # quiz-only
    options: list[QuizOption] = Field(default_factory=list)
    correct_option_id: str | None = None
    explanation: str = ""

    # code-only
    starter_code: str = ""
    setup_code: str = ""  # hidden fixtures/imports executed before the student's code
    tests: list[CodeTest] = Field(default_factory=list)


class CurriculumLesson(BaseModel):
    id: str
    order: int
    title: str
    summary: str
    why: str  # "зачем это нужно и куда встраивается в общую картину"
    technologies: list[str] = Field(default_factory=list)
    theory: str  # markdown
    glossary: dict[str, str] = Field(default_factory=dict)
    common_mistakes: list[str] = Field(default_factory=list)
    tasks: list[CurriculumTask] = Field(default_factory=list)


class CurriculumModule(BaseModel):
    id: str
    order: int
    title: str
    goal: str
    icon: str = "layers"
    lessons: list[CurriculumLesson] = Field(default_factory=list)


# ---- API-facing (trimmed) views -------------------------------------------------


class TaskProgress(BaseModel):
    task_id: str
    passed: bool


class LessonProgress(BaseModel):
    lesson_id: str
    theory_done: bool = False
    tasks_done: list[str] = Field(default_factory=list)

    def is_complete(self, task_ids: list[str]) -> bool:
        return self.theory_done and all(t in self.tasks_done for t in task_ids)


class LessonSummary(BaseModel):
    id: str
    order: int
    title: str
    summary: str
    technologies: list[str]
    task_count: int
    locked: bool
    completed: bool


class ModuleSummary(BaseModel):
    id: str
    order: int
    title: str
    goal: str
    icon: str
    lessons: list[LessonSummary]


class TaskPublic(BaseModel):
    """Task without answer-revealing fields."""

    id: str
    type: TaskType
    prompt: str
    hint: str = ""
    options: list[QuizOption] = Field(default_factory=list)
    starter_code: str = ""
    passed: bool = False


class LessonDetail(BaseModel):
    id: str
    order: int
    title: str
    summary: str
    why: str
    technologies: list[str]
    theory: str
    glossary: dict[str, str]
    common_mistakes: list[str]
    tasks: list[TaskPublic]
    theory_done: bool
    locked: bool
    module_id: str
    module_title: str
    prev_lesson_id: str | None
    next_lesson_id: str | None


class QuizCheckRequest(BaseModel):
    option_id: str


class CodeCheckRequest(BaseModel):
    code: str


class TaskCheckResult(BaseModel):
    passed: bool
    explanation: str = ""
    error: str | None = None
    test_results: list[dict] = Field(default_factory=list)


class CourseProgressOut(BaseModel):
    total_lessons: int
    completed_lessons: int
    modules: list[ModuleSummary]
