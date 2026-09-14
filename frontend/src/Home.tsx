import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './lib/api'
import type { ProjectSummary, TemplateInfo } from './types'
import { useUiStore } from './store/useUiStore'

export function Home() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [name, setName] = useState('Робот')
  const [templateId, setTemplateId] = useState('robot')
  const [error, setError] = useState('')
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const setSettings = useUiStore((s) => s.setSettings)
  const settings = useUiStore((s) => s.settings)

  const refresh = () => api.projects().then(setProjects)

  useEffect(() => {
    refresh().catch((e) => setError(String(e)))
    api.templates().then(setTemplates).catch(() => undefined)
  }, [])

  return (
    <div className="home" style={{ minHeight: '100%' }}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" />
          Architecture Canvas
        </div>
        <div className="grow" />
        <button
          className="btn ghost"
          type="button"
          onClick={() => {
            const next = theme === 'light' ? 'dark' : 'light'
            setTheme(next)
            setSettings({ ...settings, theme: next })
          }}
        >
          {theme === 'light' ? 'Тёмная' : 'Светлая'}
        </button>
      </header>
      <div className="page" style={{ maxWidth: 980, margin: '0 auto' }}>
        <p className="hint" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Визуальная архитектура для разработки с нейросетями
        </p>
        <h1>Соберите систему. Затем отдайте её модели.</h1>
        <p className="lede">
          Соберите железо, ПО и протоколы на бесконечном холсте. Откройте любой блок и опишите внутренности,
          алгоритмы и требования — затем экспортируйте структурированный промпт для Cursor, Claude или ChatGPT.
        </p>
        {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
        <div className="create-bar">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название проекта" />
          <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            className="btn primary"
            type="button"
            onClick={async () => {
              const p = await api.createProject({ name: name || 'Без названия', template_id: templateId })
              navigate(`/p/${p.id}`)
            }}
          >
            Создать проект
          </button>
        </div>
        <h2 style={{ fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--faint)' }}>
          Шаблоны
        </h2>
        <div className="grid-cards" style={{ margin: '12px 0 32px' }}>
          {templates.map((t) => (
            <button
              key={t.id}
              className="card"
              type="button"
              onClick={() => setTemplateId(t.id)}
              style={{ outline: templateId === t.id ? '2px solid var(--accent)' : undefined }}
            >
              <h3>{t.name}</h3>
              <p>{t.description}</p>
            </button>
          ))}
        </div>
        <h2 style={{ fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--faint)' }}>
          Проекты
        </h2>
        <div className="grid-cards" style={{ marginTop: 12 }}>
          {projects.map((p) => (
            <div key={p.id} className="card">
              <h3>{p.name}</h3>
              <p>{p.description || `${p.component_count} компонентов`}</p>
              <div className="foot">
                <span>{p.current_version_label}</span>
                <span>
                  <button className="btn ghost" type="button" onClick={() => navigate(`/p/${p.id}`)}>
                    Открыть
                  </button>
                  <button
                    className="btn ghost danger"
                    type="button"
                    onClick={async () => {
                      await api.deleteProject(p.id)
                      refresh()
                    }}
                  >
                    Удалить
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <label className="btn">
            Импорт JSON
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const imported = await api.importJson(JSON.parse(await file.text()))
                navigate(`/p/${imported.id}`)
              }}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
