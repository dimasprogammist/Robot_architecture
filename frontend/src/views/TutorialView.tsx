import { useEffect, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { RichMarkdown } from '../components/RichMarkdown'
import { api, type CourseLesson, type CourseOverview } from '../lib/api'

export function TutorialView() {
  const [overview, setOverview] = useState<CourseOverview | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [lesson, setLesson] = useState<CourseLesson | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({})

  useEffect(() => {
    api
      .course()
      .then((data) => {
        setOverview(data)
        setError(null)
        const first = data.modules[0]?.lessons[0]
        if (first) setActiveLessonId(first.id)
      })
      .catch(() => setError('Не удалось загрузить учебник.'))
  }, [])

  useEffect(() => {
    if (!activeLessonId) return
    api
      .courseLesson(activeLessonId)
      .then((data) => {
        setLesson(data)
        setError(null)
      })
      .catch(() => setError('Не удалось загрузить урок.'))
  }, [activeLessonId])

  return (
    <div className="page learning-page tutorial-page">
      <aside className="learning-nav">
        <h1>Учебник</h1>
        <p className="lede">
          Последовательный курс: от устройства компьютера к сетям, Git, Python, базам, backend и сборке приложения.
        </p>
        {overview ? (
          <p className="hint">
            {overview.total_lessons} уроков в {overview.modules.length} разделах
          </p>
        ) : null}
        {error ? <p className="hint">{error}</p> : null}
        {overview?.modules.map((mod) => {
          const open = openModules[mod.id] !== false
          return (
          <section key={mod.id} className="learning-cat">
            <button className="learning-cat-btn tutorial-module-title" type="button" onClick={() => setOpenModules((value) => ({ ...value, [mod.id]: !open }))} aria-expanded={open}>
              <ChevronDown className={open ? '' : 'collapsed-chevron'} size={15} />
              <span>{mod.title}</span>
              <span className="hint">{mod.lessons.length}</span>
            </button>
            {open ? <div className="learning-sec">
              {mod.lessons.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activeLessonId === item.id ? 'active' : ''}`}
                  type="button"
                  onClick={() => setActiveLessonId(item.id)}
                >
                  <span>{item.title}</span>
                </button>
              ))}
            </div> : null}
          </section>
          )
        })}
      </aside>
      <article className="learning-article tutorial-article">
        {lesson ? (
          <>
            <p className="hint">
              {lesson.module_title} · урок {lesson.order}
            </p>
            <h1>{lesson.title}</h1>
            <RichMarkdown>{lesson.content}</RichMarkdown>
            <div className="tutorial-nav-buttons">
              {lesson.prev_lesson_id ? (
                <button className="btn" type="button" onClick={() => setActiveLessonId(lesson.prev_lesson_id)}>
                  <ChevronLeft size={15} /> Предыдущий урок
                </button>
              ) : (
                <span />
              )}
              {lesson.next_lesson_id ? (
                <button className="btn" type="button" onClick={() => setActiveLessonId(lesson.next_lesson_id)}>
                  Следующий урок <ChevronRight size={15} />
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <p className="lede">Загрузка курса…</p>
        )}
      </article>
    </div>
  )
}
