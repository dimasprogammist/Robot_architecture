import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { download } from '../lib/ids'
import { sortedVersions } from '../lib/versions'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'

export function ExportView() {
  const project = useProjectStore((s) => s.project)!
  const setProject = useProjectStore((s) => s.setProject)
  const versionPreviewId = useProjectStore((s) => s.versionPreviewId)
  const previewVersion = useProjectStore((s) => s.previewVersion)
  const exitVersionPreview = useProjectStore((s) => s.exitVersionPreview)
  const restoreVersion = useProjectStore((s) => s.restoreVersion)
  const setExportOpen = useUiStore((s) => s.setExportOpen)
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<{ title: string; filename: string; mime: string; text: string } | null>(null)
  const versions = sortedVersions(project.versions)

  const openPreview = async (kind: 'json' | 'md' | 'sql') => {
    if (kind === 'json') {
      const data = await api.exportJson(project.id)
      setPreview({
        title: 'JSON',
        filename: `${project.name}.json`,
        mime: 'application/json',
        text: JSON.stringify(data, null, 2),
      })
      return
    }
    if (kind === 'md') {
      setPreview({
        title: 'Markdown',
        filename: `${project.name}.md`,
        mime: 'text/markdown',
        text: await api.exportMd(project.id),
      })
      return
    }
    setPreview({
      title: 'SQL',
      filename: `${project.name}.sql`,
      mime: 'application/sql',
      text: await api.exportSql(project.id, 'postgresql'),
    })
  }

  return (
    <div className="page">
      <h1>Экспорт и импорт</h1>
      <p className="lede">Семантический JSON, технический Markdown и готовый промпт для нейросети. Импорт JSON восстанавливает проект целиком.</p>
      <div className="row" style={{ flexWrap: 'wrap', marginBottom: 24 }}>
        <button className="btn primary" type="button" onClick={() => setExportOpen(true)}>
          Экспорт для AI
        </button>
        <button className="btn" type="button" onClick={() => void openPreview('json')}>
          Просмотр JSON
        </button>
        <button className="btn" type="button" onClick={() => void openPreview('md')}>
          Просмотр Markdown
        </button>
        <button className="btn" type="button" onClick={() => void openPreview('sql')}>
          Просмотр SQL
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
      {preview ? (
        <div className="export-preview">
          <div className="export-preview-head">
            <h2>Содержимое файла · {preview.title}</h2>
            <button
              className="btn"
              type="button"
              onClick={() => download(preview.filename, preview.text, preview.mime)}
            >
              Скачать
            </button>
          </div>
          <pre className="export-preview-body">{preview.text}</pre>
        </div>
      ) : null}
      <h2 style={{ fontSize: 18 }}>Версии</h2>
      <p className="hint">Выберите версию в шапке или здесь. Просмотр не перезаписывает текущую рабочую копию.</p>
      {versionPreviewId ? (
        <p className="hint">Открыт просмотр сохранённой версии. Автосохранение отключено.</p>
      ) : null}
      <div className="row" style={{ margin: '12px 0 20px' }}>
        <button
          className="btn"
          type="button"
          disabled={Boolean(versionPreviewId)}
          onClick={async () => {
            const next = await api.saveVersion(project.id)
            setProject(next, false)
          }}
        >
          Сохранить снимок версии
        </button>
        {versionPreviewId ? (
          <button className="btn" type="button" onClick={() => exitVersionPreview()}>
            Вернуться к текущей
          </button>
        ) : null}
      </div>
      <ul className="version-list">
        {versions.map((v) => (
          <li key={v.id} className={versionPreviewId === v.id ? 'current' : ''}>
            <span>
              {v.label} · {new Date(v.created_at).toLocaleString('ru-RU')}
              {versionPreviewId === v.id ? ' ← просмотр' : ''}
            </span>
            <span className="row">
              <button className="btn ghost" type="button" onClick={() => previewVersion(v.id)}>
                Открыть
              </button>
              <button className="btn" type="button" onClick={() => void restoreVersion(v.id)}>
                Сделать текущей
              </button>
            </span>
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
