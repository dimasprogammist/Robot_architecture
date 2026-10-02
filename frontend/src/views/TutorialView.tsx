import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { RichMarkdown } from '../components/RichMarkdown'
import { api, type CourseLesson, type CourseOverview } from '../lib/api'

type CourseGroup = {
  title: string
  moduleIds: string[]
}

type CourseBlock = {
  title: string
  from: number
  to: number
}

const COURSE_GROUPS: CourseGroup[] = [
  {
    title: 'I. Фундамент',
    moduleIds: [
      'computer',
      'os',
      'terminal',
      'linux',
      'programming',
      'python',
      'cpp',
      'algorithms',
      'networks',
      'git',
    ],
  },
  {
    title: 'II. Математика',
    moduleIds: [
      'mathematics',
    ],
  },
  {
    title: 'III. Данные и разработка',
    moduleIds: [
      'sql',
      'backend',
      'fastapi',
      'websocket',
      'frontend',
      'architecture',
      'kafka',
      'docker',
    ],
  },
  {
    title: 'IV. Электроника и робототехника',
    moduleIds: [
      'electronics',
      'microcontrollers',
      'protocols',
      'robotics',
    ],
  },
  {
    title: 'V. Компьютерное зрение и ИИ',
    moduleIds: [
      'computer-vision',
      'machine-vision',
      'neural-networks',
    ],
  },
  {
    title: 'VI. Практика',
    moduleIds: [
      'capstone',
    ],
  },
]

const CPP_BLOCKS: CourseBlock[] = [
  {
    title: 'I. Основы C++',
    from: 1,
    to: 13,
  },
  {
    title: 'II. Память и указатели',
    from: 14,
    to: 20,
  },
  {
    title: 'III. Структуры и объектная модель',
    from: 21,
    to: 31,
  },
  {
    title: 'IV. STL',
    from: 32,
    to: 41,
  },
  {
    title: 'V. Современный C++',
    from: 42,
    to: 52,
  },
  {
    title: 'VI. Работа с проектами',
    from: 53,
    to: 59,
  },
  {
    title: 'VII. Ошибки и отладка',
    from: 60,
    to: 66,
  },
  {
    title: 'VIII. C++ для систем и робототехники',
    from: 67,
    to: 75,
  },
  {
    title: 'IX. Практика',
    from: 76,
    to: 80,
  },
]

const STORAGE_KEYS = {
  openGroups: 'tutorial.openGroups',
  openModules: 'tutorial.openModules',
  openBlocks: 'tutorial.openBlocks',
}

function readStorageState(
  key: string,
): Record<string, boolean> {
  try {
    const value = localStorage.getItem(key)

    if (!value) {
      return {}
    }

    const parsed = JSON.parse(value)

    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, boolean>
    }
  } catch {
    // Ignore invalid localStorage data.
  }

  return {}
}

function writeStorageState(
  key: string,
  value: Record<string, boolean>,
) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore localStorage errors.
  }
}

export function TutorialView() {
  const [overview, setOverview] = useState<CourseOverview | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [lesson, setLesson] = useState<CourseLesson | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [openModules, setOpenModules] = useState<Record<string, boolean>>(
    () => readStorageState(STORAGE_KEYS.openModules),
  )

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    () => readStorageState(STORAGE_KEYS.openGroups),
  )

  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>(
    () => readStorageState(STORAGE_KEYS.openBlocks),
  )

  const [q, setQ] = useState('')

  useEffect(() => {
    api
      .course()
      .then((data) => {
        setOverview(data)
        setError(null)

        const first = data.modules[0]?.lessons[0]

        if (first && !activeLessonId) {
          setActiveLessonId(first.id)
        }

        setOpenGroups((current) => {
          if (Object.keys(current).length) {
            return current
          }

          const initial: Record<string, boolean> = {}

          COURSE_GROUPS.forEach((group) => {
            initial[group.title] = true
          })

          writeStorageState(STORAGE_KEYS.openGroups, initial)

          return initial
        })

        setOpenModules((current) => {
          if (Object.keys(current).length) {
            return current
          }

          const initial: Record<string, boolean> = {}

          data.modules.forEach((module) => {
            initial[module.id] = true
          })

          writeStorageState(STORAGE_KEYS.openModules, initial)

          return initial
        })

        setOpenBlocks((current) => {
          if (Object.keys(current).length) {
            return current
          }

          const initial: Record<string, boolean> = {}

          CPP_BLOCKS.forEach((block) => {
            initial[block.title] = true
          })

          writeStorageState(STORAGE_KEYS.openBlocks, initial)

          return initial
        })
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

  useEffect(() => {
    writeStorageState(STORAGE_KEYS.openGroups, openGroups)
  }, [openGroups])

  useEffect(() => {
    writeStorageState(STORAGE_KEYS.openModules, openModules)
  }, [openModules])

  useEffect(() => {
    writeStorageState(STORAGE_KEYS.openBlocks, openBlocks)
  }, [openBlocks])

  const filteredModules = useMemo(() => {
    const search = q.trim().toLowerCase()

    if (!search) {
      return overview?.modules || []
    }

    return (
      overview?.modules
        .map((mod) => ({
          ...mod,
          lessons: mod.lessons.filter((item) =>
            item.title.toLowerCase().includes(search),
          ),
        }))
        .filter((mod) => mod.lessons.length) || []
    )
  }, [overview, q])

  const groupedModules = useMemo(() => {
    if (!filteredModules.length) {
      return []
    }

    const modulesById = new Map(
      filteredModules.map((module) => [module.id, module]),
    )

    const used = new Set<string>()

    const groups = COURSE_GROUPS.map((group) => {
      const modules = group.moduleIds
        .map((id) => modulesById.get(id))
        .filter(Boolean)

      modules.forEach((module) => {
        if (module) {
          used.add(module.id)
        }
      })

      return {
        ...group,
        modules,
      }
    }).filter((group) => group.modules.length)

    const ungrouped = filteredModules.filter(
      (module) => !used.has(module.id),
    )

    if (ungrouped.length) {
      groups.push({
        title: 'VII. Дополнительные разделы',
        moduleIds: ungrouped.map((module) => module.id),
        modules: ungrouped,
      })
    }

    return groups
  }, [filteredModules])

  const toggleGroup = (title: string) => {
    setOpenGroups((value) => ({
      ...value,
      [title]: !value[title],
    }))
  }

  const toggleModule = (moduleId: string) => {
    setOpenModules((value) => ({
      ...value,
      [moduleId]: value[moduleId] === false,
    }))
  }

  const toggleBlock = (blockTitle: string) => {
    setOpenBlocks((value) => ({
      ...value,
      [blockTitle]: value[blockTitle] === false,
    }))
  }

  const renderLesson = (item: CourseLesson) => (
    <button
      key={item.id}
      className={`nav-item ${
        activeLessonId === item.id ? 'active' : ''
      }`}
      type="button"
      onClick={() => setActiveLessonId(item.id)}
    >
      <span>{item.title}</span>
    </button>
  )

  const renderCppBlocks = (mod: CourseOverview['modules'][number]) => {
    return (
      <div className="learning-sec tutorial-cpp-blocks">
        {CPP_BLOCKS.map((block) => {
          const blockLessons = mod.lessons.filter(
            (item) =>
              item.order >= block.from &&
              item.order <= block.to,
          )

          const open = q
            ? true
            : openBlocks[block.title] !== false

          return (
            <section
              key={block.title}
              className="tutorial-cpp-block"
            >
              <button
                className="learning-cat-btn tutorial-block-title"
                type="button"
                onClick={() => toggleBlock(block.title)}
                aria-expanded={open}
              >
                <ChevronDown
                  className={
                    open ? '' : 'collapsed-chevron'
                  }
                  size={14}
                />

                <span>{block.title}</span>

                <span className="hint">
                  {blockLessons.length}
                </span>
              </button>

              {open && blockLessons.length ? (
                <div className="tutorial-block-lessons">
                  {blockLessons.map(renderLesson)}
                </div>
              ) : null}
            </section>
          )
        })}
      </div>
    )
  }

  return (
    <div className="page learning-page tutorial-page">
      <aside className="learning-nav">
        <h1>Учебник</h1>

        <input
          className="lib-search"
          placeholder="Поиск по учебнику"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {overview ? (
          <p className="hint">
            {overview.total_lessons} уроков в {overview.modules.length} разделах
          </p>
        ) : null}

        {error ? <p className="hint">{error}</p> : null}

        {groupedModules.map((group) => {
          const groupOpen = q
            ? true
            : openGroups[group.title] !== false

          return (
            <section
              key={group.title}
              className="learning-group"
            >
              <button
                className="learning-group-title"
                type="button"
                onClick={() => toggleGroup(group.title)}
                aria-expanded={groupOpen}
              >
                <ChevronDown
                  className={
                    groupOpen ? '' : 'collapsed-chevron'
                  }
                  size={16}
                />

                <span>{group.title}</span>
              </button>

              {groupOpen ? (
                <div className="learning-group-content">
                  {group.modules.map((mod) => {
                    const open = q
                      ? true
                      : openModules[mod.id] !== false

                    return (
                      <section
                        key={mod.id}
                        className="learning-cat"
                      >
                        <button
                          className="learning-cat-btn tutorial-module-title"
                          type="button"
                          onClick={() =>
                            toggleModule(mod.id)
                          }
                          aria-expanded={open}
                        >
                          <ChevronDown
                            className={
                              open
                                ? ''
                                : 'collapsed-chevron'
                            }
                            size={15}
                          />

                          <span>{mod.title}</span>

                          <span className="hint">
                            {mod.lessons.length}
                          </span>
                        </button>

                        {open ? (
                          mod.id === 'cpp' ? (
                            renderCppBlocks(mod)
                          ) : (
                            <div className="learning-sec">
                              {mod.lessons.map(renderLesson)}
                            </div>
                          )
                        ) : null}
                      </section>
                    )
                  })}
                </div>
              ) : null}
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

            <RichMarkdown assetBase={lesson.asset_base}>
              {lesson.content}
            </RichMarkdown>

            <div className="tutorial-nav-buttons">
              {lesson.prev_lesson_id ? (
                <button
                  className="btn"
                  type="button"
                  onClick={() =>
                    setActiveLessonId(lesson.prev_lesson_id)
                  }
                >
                  <ChevronLeft size={15} />
                  Предыдущий урок
                </button>
              ) : (
                <span />
              )}

              {lesson.next_lesson_id ? (
                <button
                  className="btn"
                  type="button"
                  onClick={() =>
                    setActiveLessonId(lesson.next_lesson_id)
                  }
                >
                  Следующий урок
                  <ChevronRight size={15} />
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