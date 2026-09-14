import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { download } from '../lib/ids'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'

export function ExportView() {
  const project = useProjectStore((s) => s.project)!
  const setProject = useProjectStore((s) => s.setProject)
  const setExportOpen = useUiStore((s) => s.setExportOpen)
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="page">
      <h1>Экспорт и импорт</h1>
      <p className="lede">Семантический JSON, технический Markdown и готовый промпт для нейросети. Импорт JSON восстанавливает проект целиком.</p>
      <div className="row" style={{ flexWrap: 'wrap', marginBottom: 24 }}>
        <button className="btn primary" type="button" onClick={() => setExportOpen(true)}>
          Экспорт для AI
        </button>
        <button
          className="btn"
          type="button"
          onClick={async () => download(`${project.name}.json`, JSON.stringify(await api.exportJson(project.id), null, 2), 'application/json')}
        >
          Скачать JSON
        </button>
        <button className="btn" type="button" onClick={async () => download(`${project.name}.md`, await api.exportMd(project.id), 'text/markdown')}>
          Скачать Markdown
        </button>
        <button
          className="btn"
          type="button"
          onClick={async () => download(`${project.name}.sql`, await api.exportSql(project.id, 'postgresql'), 'application/sql')}
        >
          Скачать SQL
        </button>
        <button className="btn" type="button" onClick={() => fileRef.current?.click()}>
          Импорт JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const payload = JSON.parse(await file.text())
            const imported = await api.importJson(payload)
            navigate(`/p/${imported.id}`)
          }}
        />
      </div>
      <h2 style={{ fontSize: 18 }}>Версии</h2>
      <p className="hint">Снимки всей архитектуры. Позже по этим меткам можно сравнивать изменения.</p>
      <div className="row" style={{ margin: '12px 0 20px' }}>
        <button
          className="btn"
          type="button"
          onClick={async () => {
            const next = await api.saveVersion(project.id)
            setProject(next, false)
          }}
        >
          Сохранить снимок версии
        </button>
      </div>
      <ul>
        {project.versions.map((v) => (
          <li key={v.id}>
            {v.label} · {new Date(v.created_at).toLocaleString('ru-RU')}
          </li>
        ))}
      </ul>
      <h2 style={{ fontSize: 18 }}>Сохранить как шаблон</h2>
      <button
        className="btn"
        type="button"
        onClick={async () => {
          const name = window.prompt('Название шаблона', project.name)
          if (!name) return
          await api.saveTemplate(project.id, name, project.description)
          alert('Шаблон сохранён')
        }}
      >
        Сохранить текущий проект как шаблон
      </button>
    </div>
  )
}
