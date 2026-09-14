import { useState } from 'react'
import { api, type AiExportBody } from '../lib/api'
import { download } from '../lib/ids'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'

export function ExportModal() {
  const open = useUiStore((s) => s.exportOpen)
  const setOpen = useUiStore((s) => s.setExportOpen)
  const project = useProjectStore((s) => s.project)
  const architectureId = useProjectStore((s) => s.architectureId)
  const selectedIds = useProjectStore((s) => s.selectedIds)
  const [task, setTask] = useState('Реализуйте систему согласно этой архитектуре.')
  const [tab, setTab] = useState<'prompt' | 'md' | 'json' | 'sql'>('prompt')
  const [prompt, setPrompt] = useState('')
  const [md, setMd] = useState('')
  const [jsonText, setJsonText] = useState('')
  const [sql, setSql] = useState('')
  const [busy, setBusy] = useState(false)
  const [scope, setScope] = useState<string>('all')
  const [opts, setOpts] = useState({
    include_descriptions: true,
    include_algorithms: true,
    include_requirements: true,
    include_notes: false,
    include_doc_meta: true,
    include_full_docs: false,
    include_sql: false,
  })

  const body = (): AiExportBody => ({
    task,
    scope,
    component_ids: selectedIds,
    architecture_id: architectureId,
    ...opts,
    include_sql: opts.include_sql || scope === 'database',
  })

  const generate = () => {
    if (!project) return
    setBusy(true)
    Promise.all([
      api.exportAi(project.id, body()),
      api.exportMd(project.id),
      api.exportJson(project.id),
      api.exportSql(project.id, project.databases[0]?.dialect || 'postgresql').catch(() => ''),
    ])
      .then(([p, m, j, s]) => {
        setPrompt(p)
        setMd(m)
        setJsonText(JSON.stringify(j, null, 2))
        setSql(s)
      })
      .finally(() => setBusy(false))
  }

  if (!open || !project) return null
  const text = tab === 'prompt' ? prompt : tab === 'md' ? md : tab === 'json' ? jsonText : sql
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
        <div className="field">
          <label>Объём</label>
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="all">Весь проект</option>
            <option value="architecture">Текущая архитектура</option>
            <option value="selection">Выбранный компонент</option>
            <option value="database">Только база данных</option>
            <option value="mechanics">Только механика</option>
            <option value="algorithms">Только алгоритмы</option>
          </select>
        </div>
        <div className="export-opts">
          {(
            [
              ['include_descriptions', 'Описания компонентов'],
              ['include_algorithms', 'Алгоритмы'],
              ['include_requirements', 'Требования'],
              ['include_notes', 'Заметки'],
              ['include_doc_meta', 'Метаданные ссылок на документацию'],
              ['include_full_docs', 'Полный Markdown документации'],
              ['include_sql', 'SQL-схема'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="hint">
              <input
                type="checkbox"
                checked={opts[key]}
                onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.checked }))}
              />{' '}
              {label}
            </label>
          ))}
        </div>
        <button className="btn primary" type="button" onClick={generate} style={{ margin: '8px 0 12px' }}>
          Сформировать
        </button>
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
          <button className={`tab ${tab === 'sql' ? 'active' : ''}`} type="button" onClick={() => setTab('sql')}>
            SQL
          </button>
        </div>
        <pre className="export-box">{busy ? 'Готовим…' : text || 'Нажмите «Сформировать».'}</pre>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn primary" type="button" onClick={() => navigator.clipboard.writeText(text)}>
            Копировать
          </button>
          <button className="btn" type="button" onClick={() => download(`${project.name}-prompt.md`, prompt, 'text/markdown')}>
            Скачать промпт
          </button>
          <button className="btn" type="button" onClick={() => download(`${project.name}.md`, md, 'text/markdown')}>
            Скачать .md
          </button>
          <button className="btn" type="button" onClick={() => download(`${project.name}.json`, jsonText, 'application/json')}>
            Скачать .json
          </button>
          <button className="btn" type="button" onClick={() => download(`${project.name}.sql`, sql, 'application/sql')}>
            Скачать .sql
          </button>
        </div>
      </div>
    </div>
  )
}
