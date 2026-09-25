import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { CheckCircle2, ChevronLeft, ChevronRight, Lock, PlayCircle } from 'lucide-react'
import {
  api,
  type CurriculumLessonDetail,
  type CurriculumOverview,
  type CurriculumTaskCheckResult,
  type CurriculumTaskPublic,
} from '../lib/api'

export function TutorialView() {
  const [overview, setOverview] = useState<CurriculumOverview | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const refreshOverview = () => {
    api
      .curriculum()
      .then((data) => {
        setOverview(data)
        setLoadError(null)
      })
      .catch(() => setLoadError('Не удалось загрузить программу учебника.'))
  }

  useEffect(() => {
    refreshOverview()
  }, [])

  useEffect(() => {
    if (activeLessonId || !overview) return
    const firstUnlocked = overview.modules.flatMap((m) => m.lessons).find((l) => !l.locked && !l.completed)
    const first = firstUnlocked || overview.modules.flatMap((m) => m.lessons)[0]
    if (first) setActiveLessonId(first.id)
  }, [overview, activeLessonId])

  return (
    <div className="page learning-page tutorial-page">
      <aside className="learning-nav">
        <h1>Учебник</h1>
        <p className="lede">
          Последовательный курс по робототехнике: от карты системы до микроконтроллеров, с заданиями на
          каждом шаге. Уроки открываются по порядку.
        </p>
        {overview ? (
          <div className="tutorial-progress">
            <div className="tutorial-progress-bar">
              <div
                className="tutorial-progress-fill"
                style={{
                  width: `${overview.total_lessons ? (100 * overview.completed_lessons) / overview.total_lessons : 0}%`,
                }}
              />
            </div>
            <span className="hint">
              {overview.completed_lessons} / {overview.total_lessons} уроков пройдено
            </span>
          </div>
        ) : null}
        {loadError ? <p className="hint">{loadError}</p> : null}
        {overview?.modules.map((mod) => (
          <section key={mod.id} className="learning-cat">
            <div className="learning-cat-btn tutorial-module-title">
              <span>{mod.title}</span>
            </div>
            <div className="learning-sec">
              {mod.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  className={`nav-item tutorial-lesson-item ${activeLessonId === lesson.id ? 'active' : ''}`}
                  type="button"
                  disabled={lesson.locked}
                  onClick={() => setActiveLessonId(lesson.id)}
                >
                  <span className="tutorial-lesson-icon">
                    {lesson.completed ? (
                      <CheckCircle2 size={15} />
                    ) : lesson.locked ? (
                      <Lock size={13} />
                    ) : (
                      <PlayCircle size={15} />
                    )}
                  </span>
                  <span>{lesson.title}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </aside>
      <div className="learning-article tutorial-article">
        {activeLessonId ? (
          <LessonPanel
            key={activeLessonId}
            lessonId={activeLessonId}
            onNavigate={setActiveLessonId}
            onProgress={refreshOverview}
          />
        ) : (
          <p className="lede">Загрузка программы курса…</p>
        )}
      </div>
    </div>
  )
}

function LessonPanel({
  lessonId,
  onNavigate,
  onProgress,
}: {
  lessonId: string
  onNavigate: (id: string) => void
  onProgress: () => void
}) {
  const [lesson, setLesson] = useState<CurriculumLessonDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    api
      .curriculumLesson(lessonId)
      .then((data) => {
        setLesson(data)
        setError(null)
      })
      .catch(() => setError('Не удалось загрузить урок.'))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  if (error) return <p className="hint">{error}</p>
  if (!lesson) return <p className="lede">Загрузка урока…</p>

  if (lesson.locked) {
    return (
      <div className="tutorial-locked">
        <Lock size={22} />
        <p className="lede">
          Этот урок пока закрыт — сначала пройдите теорию и задания предыдущего урока по порядку.
        </p>
      </div>
    )
  }

  const markTheoryDone = () => {
    api
      .curriculumTheoryDone(lesson.id)
      .then((updated) => {
        setLesson(updated)
        onProgress()
      })
      .catch(() => undefined)
  }

  const onTaskResolved = (taskId: string, result: CurriculumTaskCheckResult) => {
    if (result.passed) {
      setLesson((prev) =>
        prev ? { ...prev, tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, passed: true } : t)) } : prev
      )
      onProgress()
    }
  }

  return (
    <>
      <p className="hint">
        {lesson.module_title} · Урок {lesson.order}
      </p>
      <h1>{lesson.title}</h1>
      <p className="lede tutorial-why">
        <strong>Зачем это нужно:</strong> {lesson.why}
      </p>

      <Markdown>{lesson.theory}</Markdown>

      {Object.keys(lesson.glossary).length ? (
        <div className="tutorial-glossary">
          <h3>Мини-словарь</h3>
          <dl>
            {Object.entries(lesson.glossary).map(([term, def]) => (
              <div key={term} className="tutorial-glossary-item">
                <dt>{term}</dt>
                <dd>{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {lesson.common_mistakes.length ? (
        <div className="tutorial-mistakes">
          <h3>Типичные ошибки</h3>
          <ul>
            {lesson.common_mistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {!lesson.theory_done ? (
        <button className="btn primary" type="button" onClick={markTheoryDone}>
          Я прочитал теорию — дальше к заданиям
        </button>
      ) : (
        <>
          <h3 className="tutorial-tasks-title">Задания</h3>
          <div className="tutorial-tasks">
            {lesson.tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                index={i + 1}
                lessonId={lesson.id}
                task={task}
                onResolved={(result) => onTaskResolved(task.id, result)}
              />
            ))}
          </div>
        </>
      )}

      <div className="tutorial-nav-buttons">
        {lesson.prev_lesson_id ? (
          <button className="btn" type="button" onClick={() => onNavigate(lesson.prev_lesson_id!)}>
            <ChevronLeft size={15} /> Предыдущий урок
          </button>
        ) : (
          <span />
        )}
        {lesson.next_lesson_id ? (
          <button className="btn" type="button" onClick={() => onNavigate(lesson.next_lesson_id!)}>
            Следующий урок <ChevronRight size={15} />
          </button>
        ) : null}
      </div>
    </>
  )
}

function TaskCard({
  index,
  lessonId,
  task,
  onResolved,
}: {
  index: number
  lessonId: string
  task: CurriculumTaskPublic
  onResolved: (result: CurriculumTaskCheckResult) => void
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [code, setCode] = useState(task.starter_code)
  const [result, setResult] = useState<CurriculumTaskCheckResult | null>(null)
  const [checking, setChecking] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const checkQuiz = () => {
    if (!selectedOption) return
    setChecking(true)
    api
      .curriculumCheckQuiz(lessonId, task.id, selectedOption)
      .then((r) => {
        setResult(r)
        onResolved(r)
      })
      .finally(() => setChecking(false))
  }

  const checkCode = () => {
    setChecking(true)
    api
      .curriculumCheckCode(lessonId, task.id, code)
      .then((r) => {
        setResult(r)
        onResolved(r)
      })
      .finally(() => setChecking(false))
  }

  return (
    <div className={`tutorial-task ${task.passed ? 'passed' : ''}`}>
      <div className="tutorial-task-head">
        <span className="tutorial-task-badge">
          Задание {index} {task.passed ? <CheckCircle2 size={14} /> : null}
        </span>
      </div>
      <p className="tutorial-task-prompt">{task.prompt}</p>

      {task.type === 'quiz' ? (
        <div className="tutorial-quiz-options">
          {task.options.map((opt) => (
            <label key={opt.id} className={`tutorial-quiz-option ${selectedOption === opt.id ? 'selected' : ''}`}>
              <input
                type="radio"
                name={task.id}
                checked={selectedOption === opt.id}
                onChange={() => setSelectedOption(opt.id)}
                disabled={task.passed}
              />
              <span>{opt.text}</span>
            </label>
          ))}
          {!task.passed ? (
            <button className="btn primary" type="button" disabled={!selectedOption || checking} onClick={checkQuiz}>
              Проверить
            </button>
          ) : null}
        </div>
      ) : (
        <div className="tutorial-code-task">
          <textarea
            className="tutorial-code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={Math.max(6, code.split('\n').length + 1)}
          />
          <div className="tutorial-code-actions">
            {task.hint ? (
              <button className="btn" type="button" onClick={() => setShowHint((v) => !v)}>
                {showHint ? 'Скрыть подсказку' : 'Подсказка'}
              </button>
            ) : null}
            <button className="btn primary" type="button" disabled={checking} onClick={checkCode}>
              {checking ? 'Проверяю…' : 'Проверить код'}
            </button>
          </div>
          {showHint && task.hint ? <p className="hint tutorial-hint">{task.hint}</p> : null}
        </div>
      )}

      {result ? (
        <div className={`tutorial-result ${result.passed ? 'ok' : 'fail'}`}>
          {result.error ? <p>{result.error}</p> : null}
          {result.explanation ? <p>{result.explanation}</p> : null}
          {result.test_results?.length ? (
            <ul className="tutorial-test-results">
              {result.test_results.map((t, i) => (
                <li key={i} className={t.passed ? 'ok' : 'fail'}>
                  <code>{t.call}</code> → получено <code>{t.actual}</code>, ожидалось <code>{t.expected}</code>
                </li>
              ))}
            </ul>
          ) : null}
          {result.passed ? <p className="tutorial-result-ok-label">Верно ✓</p> : null}
        </div>
      ) : null}
    </div>
  )
}
