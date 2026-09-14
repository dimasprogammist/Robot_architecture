import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../../store/useProjectStore'
import { useUiStore } from '../../store/useUiStore'

export function TopBar() {
  const navigate = useNavigate()
  const project = useProjectStore((s) => s.project)
  const architectureId = useProjectStore((s) => s.architectureId)
  const goToArchitecture = useProjectStore((s) => s.goToArchitecture)
  const dirty = useProjectStore((s) => s.dirty)
  const saving = useProjectStore((s) => s.saving)
  const saveNow = useProjectStore((s) => s.saveNow)
  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const setSearchOpen = useUiStore((s) => s.setSearchOpen)
  const setExportOpen = useUiStore((s) => s.setExportOpen)
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const setSettings = useUiStore((s) => s.setSettings)
  const settings = useUiStore((s) => s.settings)

  const crumbs = (() => {
    if (!project || !architectureId) return []
    const path: { id: string; name: string }[] = []
    let current = project.architectures.find((a) => a.id === architectureId)
    while (current) {
      const arch = current
      path.unshift({ id: arch.id, name: arch.name })
      if (!arch.parent_component_id) break
      const parentComp = project.components.find((c) => c.id === arch.parent_component_id)
      const parentArch = parentComp
        ? project.architectures.find((a) => a.id === parentComp.architecture_id)
        : undefined
      current = parentArch
    }
    return path
  })()

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" />
        Architecture Canvas
        {project ? <span>{project.current_version_label}</span> : null}
      </div>
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 ? <span className="sep">/</span> : null}
            <button className={c.id === architectureId ? 'active' : ''} type="button" onClick={() => goToArchitecture(c.id)}>
              {c.name}
            </button>
          </span>
        ))}
      </div>
      <div className="top-actions">
        <span className="save-meta">{saving ? 'Saving…' : dirty ? 'Unsaved' : 'Saved'}</span>
        <button className="btn ghost" type="button" onClick={() => undo()}>
          Undo
        </button>
        <button className="btn ghost" type="button" onClick={() => redo()}>
          Redo
        </button>
        <button className="btn ghost" type="button" onClick={() => setSearchOpen(true)}>
          Search
        </button>
        <button
          className="btn ghost"
          type="button"
          onClick={() => {
            const next = theme === 'light' ? 'dark' : 'light'
            setTheme(next)
            setSettings({ ...settings, theme: next })
          }}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
        <button className="btn" type="button" onClick={() => saveNow()}>
          Save
        </button>
        <button className="btn primary" type="button" onClick={() => setExportOpen(true)}>
          Export for AI
        </button>
        <button className="btn ghost" type="button" onClick={() => navigate('/')}>
          Projects
        </button>
      </div>
    </header>
  )
}
