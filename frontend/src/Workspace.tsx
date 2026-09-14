import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ArchitectureCanvas } from './components/canvas/ArchitectureCanvas'
import { LibraryRail } from './components/canvas/LibraryRail'
import { CommandPalette } from './components/CommandPalette'
import { ExportModal } from './components/ExportModal'
import { Inspector } from './components/Inspector'
import { LeftSidebar } from './components/layout/LeftSidebar'
import { TopBar } from './components/layout/TopBar'
import { useProjectStore } from './store/useProjectStore'
import { useUiStore } from './store/useUiStore'
import { AlgorithmsView } from './views/AlgorithmsView'
import { ComponentsView } from './views/ComponentsView'
import { DocumentsView } from './views/DocumentsView'
import { ExportView } from './views/ExportView'
import { ProtocolsView } from './views/ProtocolsView'
import { RequirementsView } from './views/RequirementsView'
import { SettingsView } from './views/SettingsView'
import type { LibraryPreset } from './types'

export function Workspace({ presets }: { presets: LibraryPreset[] }) {
  const { id } = useParams()
  const load = useProjectStore((s) => s.load)
  const project = useProjectStore((s) => s.project)
  const nav = useUiStore((s) => s.nav)
  const deleteSelected = useProjectStore((s) => s.deleteSelected)
  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const copy = useProjectStore((s) => s.copy)
  const paste = useProjectStore((s) => s.paste)
  const saveNow = useProjectStore((s) => s.saveNow)
  const setSearchOpen = useUiStore((s) => s.setSearchOpen)
  const setNav = useUiStore((s) => s.setNav)

  useEffect(() => {
    if (id) load(id).catch(() => undefined)
  }, [id, load])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault()
        saveNow()
      }
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
      if (meta && e.key.toLowerCase() === 'c' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        copy()
      }
      if (meta && e.key.toLowerCase() === 'v' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        paste()
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        deleteSelected()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [copy, deleteSelected, paste, redo, saveNow, setSearchOpen, undo])

  if (!project || project.id !== id) {
    return (
      <div className="empty">
        <h2>Loading project…</h2>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <TopBar />
      <div className={`workspace ${nav === 'architecture' ? '' : 'no-inspector'}`}>
        <LeftSidebar />
        {nav === 'architecture' ? (
          <>
            <div style={{ position: 'relative', minWidth: 0, minHeight: 0 }}>
              <LibraryRail presets={presets} />
              <ArchitectureCanvas />
            </div>
            <Inspector />
          </>
        ) : (
          <div style={{ minWidth: 0, minHeight: 0 }}>
            {nav === 'projects' ? (
              <div className="page">
                <h1>Projects</h1>
                <p className="lede">Use the top-right control to return to the project list.</p>
                <button className="btn" type="button" onClick={() => setNav('architecture')}>
                  Back to canvas
                </button>
              </div>
            ) : null}
            {nav === 'components' ? <ComponentsView /> : null}
            {nav === 'protocols' ? <ProtocolsView /> : null}
            {nav === 'algorithms' ? <AlgorithmsView /> : null}
            {nav === 'requirements' ? <RequirementsView /> : null}
            {nav === 'documents' ? <DocumentsView /> : null}
            {nav === 'export' ? <ExportView /> : null}
            {nav === 'settings' ? <SettingsView /> : null}
          </div>
        )}
      </div>
      <ExportModal />
      <CommandPalette />
    </div>
  )
}
