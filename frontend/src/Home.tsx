import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProfileMenu } from './components/layout/Layout'
import { api } from './lib/api'
import { useUiStore } from './store/useUiStore'
import type { ProjectSummary, TemplateInfo } from './types'

function formatUpdated(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function Home() {
  const navigate = useNavigate()
  const settings = useUiStore((s) => s.settings)
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null)
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [name, setName] = useState('Робот')
  const [templateId, setTemplateId] = useState(settings.default_template_id || 'robot')
  const [error, setError] = useState('')
  const refresh = () => api.projects().then(setProjects)

  useEffect(() => {
    refresh().catch((e) => {
      setError(String(e))
      setProjects([])
    })
    api.templates().then(setTemplates).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (settings.default_template_id) setTemplateId(settings.default_template_id)
  }, [settings.default_template_id])

  const create = async () => {
    const p = await api.createProject({
      name: name || 'Без названия',
      template_id: templateId,
    })
    navigate(`/p/${p.id}`)
  }

  const createBar = (
    <div className="create-bar">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название проекта" />
      <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <button className="btn primary" type="button" onClick={create}>
        + Создать проект
      </button>
    </div>
  )

  return (
    <div className="home" style={{ minHeight: '100%' }}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" />
          Architecture Canvas
        </div>
        <div className="grow" />
        <div className="top-actions">
          <ProfileMenu showSettings={false} />
        </div>
      </header>
      <div className="page" style={{ maxWidth: 980, margin: '0 auto' }}>
        <p className="hint" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Визуальная архитектура для разработки с нейросетями
        </p>
        <h1>Мои проекты</h1>
        {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}

        {projects === null ? (
          <p className="lede">Загрузка проектов…</p>
        ) : projects.length === 0 ? (
          <div className="empty home-empty">
            <h2>Проектов пока нет</h2>
            <p>Создайте первый проект</p>
            {createBar}
          </div>
        ) : (
          <>
            <div className="grid-cards" style={{ marginTop: 12 }}>
              {projects.map((p) => (
                <div key={p.id} className="card">
                  <h3>{p.name}</h3>
                  <p>Последнее изменение: {formatUpdated(p.updated_at)}</p>
                  <div className="foot">
                    <span>{p.current_version_label || 'черновик'}</span>
                    <span className="project-card-actions">
                      <button className="btn primary" type="button" onClick={() => navigate(`/p/${p.id}`)}>
                        Открыть
                      </button>
                      <button
                        className="btn danger"
                        type="button"
                        onClick={async () => {
                          if (
                            settings.confirm_delete_project &&
                            !window.confirm(`Удалить проект «${p.name}»?`)
                          ) {
                            return
                          }
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
            <h2 className="home-create-title">Новый проект</h2>
            {createBar}
          </>
        )}

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
