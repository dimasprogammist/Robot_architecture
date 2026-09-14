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
      <h1>Export & import</h1>
      <p className="lede">Semantic JSON, technical markdown, and an AI-ready prompt. JSON import recreates a full project.</p>
      <div className="row" style={{ flexWrap: 'wrap', marginBottom: 24 }}>
        <button className="btn primary" type="button" onClick={() => setExportOpen(true)}>
          Export for AI
        </button>
        <button
          className="btn"
          type="button"
          onClick={async () => download(`${project.name}.json`, JSON.stringify(await api.exportJson(project.id), null, 2), 'application/json')}
        >
          Download JSON
        </button>
        <button className="btn" type="button" onClick={async () => download(`${project.name}.md`, await api.exportMd(project.id), 'text/markdown')}>
          Download Markdown
        </button>
        <button className="btn" type="button" onClick={() => fileRef.current?.click()}>
          Import JSON
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
      <h2 style={{ fontSize: 18 }}>Versions</h2>
      <p className="hint">Snapshots of the whole architecture. Future diffs can compare these labels.</p>
      <div className="row" style={{ margin: '12px 0 20px' }}>
        <button
          className="btn"
          type="button"
          onClick={async () => {
            const next = await api.saveVersion(project.id)
            setProject(next, false)
          }}
        >
          Save version snapshot
        </button>
      </div>
      <ul>
        {project.versions.map((v) => (
          <li key={v.id}>
            {v.label} · {new Date(v.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
      <h2 style={{ fontSize: 18 }}>Save as template</h2>
      <button
        className="btn"
        type="button"
        onClick={async () => {
          const name = window.prompt('Template name', project.name)
          if (!name) return
          await api.saveTemplate(project.id, name, project.description)
          alert('Template saved')
        }}
      >
        Save current project as template
      </button>
    </div>
  )
}
