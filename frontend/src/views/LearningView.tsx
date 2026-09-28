
import { useEffect, useMemo, useState } from 'react'
import { RichMarkdown } from '../components/RichMarkdown'
import { api, type LearningArticle, type LearningCategory } from '../lib/api'

const CATEGORY_ORDER = [
  'guide-computer',
  'guide-os',
  'guide-terminal',
  'guide-linux',
  'guide-networks',
  'guide-git',
  'guide-programming',
  'guide-python',
  'guide-algorithms',
  'guide-sql',
  'guide-backend',
  'guide-fastapi',
  'guide-websocket',
  'guide-frontend',
  'guide-architecture',
  'guide-kafka',
  'guide-docker',
  'devices',
  'networking',
  'python',
  'cpp',
  'vision',
  'neural',
  'git',
  'linux',
  'bash',
  'sql',
  'docker',
  'databases',
  'protocols',
  'microcontrollers',
  'electronics',
  'robotics',
  'software-architecture',
  'app',
]

const CATEGORY_ORDER_MAP = new Map(
  CATEGORY_ORDER.map((id, index) => [id, index]),
)

export function LearningView() {
  const [cats, setCats] = useState<LearningCategory[]>([])
  const [article, setArticle] = useState<LearningArticle | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [openCat, setOpenCat] = useState<string | null>('guide-computer')
  const [index, setIndex] = useState<
    Record<string, { title: string; category: string }>
  >({})

  useEffect(() => {
    api
      .learning()
      .then((data) => {
        const ordered = sortCategories(data)

        setCats(ordered)

        const map: Record<
          string,
          { title: string; category: string }
        > = {}

        for (const c of ordered) {
          for (const a of c.articles) {
            map[a.id] = {
              title: a.title,
              category: c.name,
            }
          }
        }

        setIndex(map)

        if (ordered.length && !openCat) {
          setOpenCat(ordered[0].id)
        }
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!active) return

    api
      .learningArticle(active)
      .then(setArticle)
      .catch(() => undefined)
  }, [active])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()

    if (!s) return cats

    return cats
      .map((c) => ({
        ...c,
        articles: c.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(s) ||
            (a.description || '').toLowerCase().includes(s) ||
            (a.section || '').toLowerCase().includes(s),
        ),
      }))
      .filter((c) => c.articles.length)
  }, [cats, q])

  const openArticle = (id: string) => {
    setActive(id)

    const found = cats.find((c) =>
      c.articles.some((a) => a.id === id),
    )

    if (found) {
      setOpenCat(found.id)
    }
  }

  return (
    <div className="page learning-page">
      <aside className="learning-nav">
        <h1>Справочник</h1>

        <input
          className="lib-search"
          placeholder="Поиск по разделам"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {filtered.map((cat) => {
          const open = q ? true : openCat === cat.id
          const sections = groupSections(cat.articles)

          return (
            <section key={cat.id} className="learning-cat">
              <button
                className="learning-cat-btn"
                type="button"
                onClick={() =>
                  setOpenCat(
                    open && !q ? null : cat.id,
                  )
                }
              >
                <span>{cat.name}</span>
                <span className="hint">{cat.articles.length}</span>
              </button>

              {open
                ? sections.map((sec) => (
                    <div
                      key={sec.name}
                      className="learning-sec"
                    >
                      {sec.name ? (
                        <div className="learning-sec-title">
                          {sec.name}
                        </div>
                      ) : null}

                      {sec.articles.map((a) => (
                        <button
                          key={a.id}
                          className={`nav-item ${
                            active === a.id ? 'active' : ''
                          }`}
                          type="button"
                          onClick={() => openArticle(a.id)}
                        >
                          <span>{a.title}</span>
                        </button>
                      ))}
                    </div>
                  ))
                : null}
            </section>
          )
        })}
      </aside>

      <article className="learning-article md-preview">
        {article ? (
          <>
            <p className="hint">
              {index[article.id]?.category || article.category}
              {article.section
                ? ` · ${article.section}`
                : ''}
            </p>

            <RichMarkdown>{article.content}</RichMarkdown>

            {(article.related || []).length ? (
              <div className="learning-related">
                <h3>Связанные разделы</h3>

                {article.related.map((id) => (
                  <button
                    key={id}
                    className="btn"
                    type="button"
                    onClick={() => openArticle(id)}
                  >
                    {index[id]?.title || id}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p className="lede">
            Выберите тему слева. Здесь находятся справочные материалы
            по компьютерам, Linux, сетям, программированию, базам данных
            и робототехническим системам.
          </p>
        )}
      </article>
    </div>
  )
}

function sortCategories(
  categories: LearningCategory[],
): LearningCategory[] {
  return [...categories]
    .map((category) => ({
      ...category,
      articles: [...category.articles].sort(
        (a, b) =>
          (a.order || 0) - (b.order || 0) ||
          a.title.localeCompare(b.title, 'ru'),
      ),
    }))
    .sort((a, b) => {
      const ai = CATEGORY_ORDER_MAP.get(a.id)
      const bi = CATEGORY_ORDER_MAP.get(b.id)

      if (ai !== undefined && bi !== undefined) {
        return ai - bi
      }

      if (ai !== undefined) return -1
      if (bi !== undefined) return 1

      return a.name.localeCompare(b.name, 'ru')
    })
}

function groupSections(
  articles: LearningCategory['articles'],
) {
  const map = new Map<
    string,
    LearningCategory['articles']
  >()

  for (const article of articles) {
    const name = article.section || ''

    if (!map.has(name)) {
      map.set(name, [])
    }

    map.get(name)!.push(article)
  }

  return Array.from(map.entries()).map(
    ([name, sectionArticles]) => ({
      name,
      articles: sectionArticles,
    }),
  )
}
