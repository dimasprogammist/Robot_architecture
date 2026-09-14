import { useEffect, useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import { api, type LearningArticle, type LearningCategory } from '../lib/api'

export function LearningView() {
  const [cats, setCats] = useState<LearningCategory[]>([])
  const [article, setArticle] = useState<LearningArticle | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [openCat, setOpenCat] = useState<string | null>('python')
  const [index, setIndex] = useState<Record<string, { title: string; category: string }>>({})

  useEffect(() => {
    api.learning().then((data) => {
      setCats(data)
      const map: Record<string, { title: string; category: string }> = {}
      for (const c of data) {
        for (const a of c.articles) map[a.id] = { title: a.title, category: c.name }
      }
      setIndex(map)
    }).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!active) return
    api.learningArticle(active).then(setArticle).catch(() => undefined)
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
    const found = cats.find((c) => c.articles.some((a) => a.id === id))
    if (found) setOpenCat(found.id)
  }

  return (
    <div className="page learning-page">
      <aside className="learning-nav">
        <h1>Справочник</h1>
        <p className="lede">Инженерный учебник: языки, Linux, протоколы, электроника и робототехника — рядом с проектированием системы.</p>
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
              <button className="learning-cat-btn" type="button" onClick={() => setOpenCat(open && !q ? null : cat.id)}>
                <span>{cat.name}</span>
                <span className="hint">{cat.articles.length}</span>
              </button>
              {open
                ? sections.map((sec) => (
                    <div key={sec.name} className="learning-sec">
                      {sec.name ? <div className="learning-sec-title">{sec.name}</div> : null}
                      {sec.articles.map((a) => (
                        <button
                          key={a.id}
                          className={`nav-item ${active === a.id ? 'active' : ''}`}
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
              {article.section ? ` · ${article.section}` : ''}
            </p>
            <Markdown>{article.content}</Markdown>
            {(article.related || []).length ? (
              <div className="learning-related">
                <h3>Связанные разделы</h3>
                {article.related.map((id) => (
                  <button key={id} className="btn" type="button" onClick={() => openArticle(id)}>
                    {index[id]?.title || id}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p className="lede">Выберите тему слева. Python и C++ — полные курсы, остальные разделы — прикладной справочник для робототехнических систем.</p>
        )}
      </article>
    </div>
  )
}

function groupSections(articles: LearningCategory['articles']) {
  const order: string[] = []
  const map = new Map<string, LearningCategory['articles']>()
  for (const a of articles) {
    const name = a.section || ''
    if (!map.has(name)) {
      map.set(name, [])
      order.push(name)
    }
    map.get(name)!.push(a)
  }
  return order.map((name) => ({ name, articles: map.get(name)! }))
}
