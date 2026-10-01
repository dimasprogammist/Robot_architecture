import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { download } from '../lib/ids'
import { useProjectStore } from '../store/useProjectStore'

export function SqlToolbar() {
  const project = useProjectStore((s) => s.project)!
  const [dialect, setDialect] = useState(
    project.databases[0]?.dialect || 'postgresql',
  )
  const [sql, setSql] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    api
      .exportSql(project.id, dialect)
      .then(setSql)
      .catch(() => setSql('-- не удалось сгенерировать SQL'))
  }, [open, dialect, project.id, project.updated_at])

  return (
    <div className="sql-bar">
      <div
        className="field"
        style={{
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <label>База данных</label>

        <select
          value={dialect}
          onChange={(e) => setDialect(e.target.value)}
          style={{ height: 30 }}
        >
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
          <option value="sqlite">SQLite</option>
        </select>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 20,
        }}
      >
        <button
          className="btn"
          type="button"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Скрыть SQL' : 'Показать SQL'}
        </button>

        <button
          className="btn"
          type="button"
          onClick={() => navigator.clipboard.writeText(sql)}
        >
          Копировать
        </button>

        <button
          className="btn"
          type="button"
          onClick={async () => {
            const text = sql || (await api.exportSql(project.id, dialect))

            download(
              `${project.name}-${dialect}.sql`,
              text,
              'application/sql',
            )
          }}
        >
          Скачать .sql
        </button>
      </div>

      {open ? (
        <pre
          className="export-box"
          style={{
            width: '100%',
            maxHeight: 180,
            margin: 0,
          }}
        >
          {sql || 'Готовим…'}
        </pre>
      ) : null}
    </div>
  )
}