import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { api, type LearningArticle, type LearningCategory } from '../lib/api'

export function LearningView() {
  const [cats, setCats] = useState<LearningCategory[]>([])
  const [article, setArticle] = useState<LearningArticle | null>(null)
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    api.learning().then(setCats).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!active) return
    api.learningArticle(active).then(setArticle).catch(() => undefined)
  }, [active])

  return (
    <div className="page learning-page">
      <div>
        <h1>Обучение</h1>
        <p className="lede">Справочник по технологиям и по работе с Architecture Canvas. Материалы лежат в Markdown-файлах и подхватываются без пересборки UI.</p>
        {cats.map((cat) => (
          <section key={cat.id} style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--faint)' }}>{cat.name}</h3>
            {cat.articles.map((a) => (
              <button
                key={a.id}
                className={`nav-item ${active === a.id ? 'active' : ''}`}
                type="button"
                onClick={() => setActive(a.id)}
                style={{ width: '100%', textAlign: 'left', marginBottom: 4 }}
              >
                <span>{a.title}</span>
              </button>
            ))}
          </section>
        ))}
      </div>
      <article className="learning-article md-preview">
        {article ? (
          <>
            <p className="hint">{article.category} · {(article.tags || []).join(', ')}</p>
            <Markdown>{article.content}</Markdown>
          </>
        ) : (
          <p className="lede">Выберите тему слева.</p>
        )}
      </article>
    </div>
  )
}
