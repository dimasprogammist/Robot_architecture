import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { download } from '../lib/ids'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'

export function ExportModal() {
  const open = useUiStore((s) => s.exportOpen)
  const setOpen = useUiStore((s) => s.setExportOpen)
  const project = useProjectStore((s) => s.project)
  const [task, setTask] = useState('Реализуйте систему согласно этой архитектуре.')
  const [tab, setTab] = useState<'prompt' | 'md' | 'json'>('prompt')
  const [prompt, setPrompt] = useState('')
  const [md, setMd] = useState('')
  const [jsonText, setJsonText] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open || !project) return
    let cancelled = false
    setBusy(true)
    Promise.all([api.exportAi(project.id, task), api.exportMd(project.id), api.exportJson(project.id)])
      .then(([p, m, j]) => {
        if (cancelled) return
        setPrompt(p)
        setMd(m)
        setJsonText(JSON.stringify(j, null, 2))
      })
      .finally(() => {
        if (!cancelled) setBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, project?.id, task])

  if (!open || !project) return null
  const body = tab === 'prompt' ? prompt : tab === 'md' ? md : jsonText
  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Экспорт для AI</h2>
          <button className="btn ghost" type="button" onClick={() => setOpen(false)}>
            Закрыть
          </button>
        </div>
        <div className="field">
          <label>Задача</label>
          <textarea value={task} onChange={(e) => setTask(e.target.value)} />
        </div>
        <div className="tabs">
          <button className={`tab ${tab === 'prompt' ? 'active' : ''}`} type="button" onClick={() => setTab('prompt')}>
            Промпт
          </button>
          <button className={`tab ${tab === 'md' ? 'active' : ''}`} type="button" onClick={() => setTab('md')}>
            Markdown
          </button>
          <button className={`tab ${tab === 'json' ? 'active' : ''}`} type="button" onClick={() => setTab('json')}>
            JSON
          </button>
        </div>
        <pre className="export-box">{busy ? 'Готовим…' : body}</pre>
        <div className="row" style={{ marginTop: 12 }}>
          <button
            className="btn primary"
            type="button"
            onClick={() => navigator.clipboard.writeText(body)}
          >
            Копировать
          </button>
          <button className="btn" type="button" onClick={() => download(`${project.name}-prompt.md`, prompt, 'text/markdown')}>
            Скачать промпт
          </button>
          <button className="btn" type="button" onClick={() => download(`${project.name}.md`, md, 'text/markdown')}>
            Скачать .md
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => download(`${project.name}.json`, jsonText, 'application/json')}
          >
            Скачать .json
          </button>
        </div>
      </div>
    </div>
  )
}
