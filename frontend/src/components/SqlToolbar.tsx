import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { download } from '../lib/ids'
import { useProjectStore } from '../store/useProjectStore'

export function SqlToolbar() {
  const project = useProjectStore((s) => s.project)!
  const [dialect, setDialect] = useState(project.databases[0]?.dialect || 'postgresql')
  const [sql, setSql] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    api.exportSql(project.id, dialect).then(setSql).catch(() => setSql('-- не удалось сгенерировать SQL'))
  }, [open, dialect, project.id, project.updated_at])

  return (
    <div className="sql-bar">
      <select value={dialect} onChange={(e) => setDialect(e.target.value)}>
        <option value="postgresql">PostgreSQL</option>
        <option value="mysql">MySQL</option>
        <option value="sqlite">SQLite</option>
      </select>
      <button className="btn" type="button" onClick={() => setOpen((v) => !v)}>
        {open ? 'Скрыть SQL' : 'Показать SQL'}
      </button>
      <button className="btn" type="button" onClick={() => navigator.clipboard.writeText(sql)}>
        Копировать
      </button>
      <button
        className="btn"
        type="button"
        onClick={async () => {
          const text = sql || (await api.exportSql(project.id, dialect))
          download(`${project.name}-${dialect}.sql`, text, 'application/sql')
        }}
      >
        Скачать .sql
      </button>
      {open ? <pre className="export-box" style={{ gridColumn: '1 / -1', maxHeight: 180 }}>{sql || 'Готовим…'}</pre> : null}
    </div>
  )
}
