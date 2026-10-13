import { useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import { MarkdownField } from '../components/MarkdownField'
import { SearchField } from '../components/SearchField'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'

const PRIORITY: Record<string, string> = {
  must: 'обязательно',
  should: 'желательно',
  could: 'можно',
}

export function RequirementsView({ embedded = false }: { embedded?: boolean }) {
  const project = useProjectStore((s) => s.project)!
  const addRequirement = useProjectStore((s) => s.addRequirement)
  const updateRequirement = useProjectStore((s) => s.updateRequirement)
  const deleteRequirement = useProjectStore((s) => s.deleteRequirement)
  const select = useProjectStore((s) => s.select)
  const goToArchitecture = useProjectStore((s) => s.goToArchitecture)
  const setNav = useUiStore((s) => s.setNav)
  const settings = useUiStore((s) => s.settings)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'starred' | 'code' | 'priority'>('starred')

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = project.requirements.filter(
      (r) =>
        !needle ||
        r.code.toLowerCase().includes(needle) ||
        r.text.toLowerCase().includes(needle) ||
        r.notes.toLowerCase().includes(needle),
    )
    const rank = { must: 0, should: 1, could: 2 } as Record<string, number>
    return list.slice().sort((a, b) => {
      if (sort === 'starred' || sort === 'code') {
        const star = Number(Boolean(b.starred)) - Number(Boolean(a.starred))
        if (star) return star
        if (sort === 'starred') return a.code.localeCompare(b.code, 'ru')
      }
      if (sort === 'priority') return (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9) || a.code.localeCompare(b.code, 'ru')
      return a.code.localeCompare(b.code, 'ru')
    })
  }, [project.requirements, q, sort])

  return (
    <div className={embedded ? 'embedded-section' : 'page'}>
      {embedded ? null : <h1>Требования</h1>}
      <p className="lede">Ограничения, которые можно связать с компонентами и соединениями.</p>
      <div className="create-bar">
        <button className="btn primary" type="button" onClick={() => addRequirement('Новое требование')}>
          Добавить
        </button>
      </div>
      <div className="req-toolbar">
        <SearchField placeholder="Поиск требований" value={q} onChange={setQ} />
        <select value={sort} aria-label="Сортировка" onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="starred">Избранные сверху</option>
          <option value="code">По коду</option>
          <option value="priority">По приоритету</option>
        </select>
      </div>
      <div className="notes-grid">
        {items.map((r) => (
          <article className="card" key={r.id}>
            <div className="note-card-head">
              <input
                value={r.code}
                aria-label={`${r.code} код`}
                onChange={(e) => updateRequirement(r.id, { code: e.target.value })}
                style={{ fontWeight: 600, fontSize: 16, border: 'none', background: 'transparent', width: '100%' }}
              />
              <select value={r.priority} aria-label={`${r.code} приоритет`} onChange={(e) => updateRequirement(r.id, { priority: e.target.value })}>
                {Object.entries(PRIORITY).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                className={`icon-btn note-star ${r.starred ? 'on' : ''}`}
                type="button"
                title={r.starred ? 'Убрать из избранного' : 'Добавить в избранное'}
                aria-label={r.starred ? 'Убрать из избранного' : 'Добавить в избранное'}
                onClick={() => updateRequirement(r.id, { starred: !r.starred })}
              >
                <Star size={16} fill={r.starred ? 'currentColor' : 'none'} />
              </button>
            </div>
            <MarkdownField label="Текст" value={r.text} onChange={(v) => updateRequirement(r.id, { text: v })} />
            <MarkdownField
              label="Заметки"
              value={r.notes}
              onChange={(v) => updateRequirement(r.id, { notes: v })}
              extraActions={
                <button
                  className="tab tab-danger"
                  type="button"
                  onClick={() => {
                    if (settings.confirm_delete && !window.confirm(`Удалить требование «${r.code}»?`)) return
                    deleteRequirement(r.id)
                  }}
                >
                  Удалить
                </button>
              }
            />
            <div className="req-links-cell">
              {r.component_ids.map((id) => {
                const c = project.components.find((x) => x.id === id)
                return (
                  <button
                    key={id}
                    className="tag"
                    type="button"
                    onClick={() => {
                      if (!c) return
                      goToArchitecture(c.architecture_id)
                      select([c.id])
                      setNav('architecture')
                    }}
                  >
                    {c?.name || id}
                  </button>
                )
              })}
              <select
                value=""
                onChange={(e) => {
                  const id = e.target.value
                  if (!id) return
                  updateRequirement(r.id, { component_ids: Array.from(new Set([...r.component_ids, id])) })
                }}
              >
                <option value="">Связать компонент…</option>
                {project.components.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}