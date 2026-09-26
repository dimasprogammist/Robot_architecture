import { useEffect, useState } from 'react'
import { PanelRightOpen } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { ArchitectureCanvas } from './components/canvas/ArchitectureCanvas'
import { LibraryRail } from './components/canvas/LibraryRail'
import { CommandPalette } from './components/CommandPalette'
import { ExportModal } from './components/ExportModal'
import { Inspector } from './components/Inspector'
import { LeftSidebar, TopBar } from './components/layout/Layout'
import { SqlToolbar } from './components/SqlToolbar'
import { useProjectStore } from './store/useProjectStore'
import { useUiStore } from './store/useUiStore'
import { AlgorithmsView } from './views/AlgorithmsView'
import { DocumentsView } from './views/DocumentsView'
import { ExportView } from './views/ExportView'
import { LearningView } from './views/LearningView'
import { TutorialView } from './views/TutorialView'
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
  const ensureKindArchitecture = useProjectStore((s) => s.ensureKindArchitecture)
  const goToArchitecture = useProjectStore((s) => s.goToArchitecture)
  const architectureId = useProjectStore((s) => s.architectureId)
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [inspectorWidth, setInspectorWidth] = useState(432)

  useEffect(() => {
    if (id) load(id).catch(() => undefined)
  }, [id, load])

  useEffect(() => {
    if (!project) return
    if (nav === 'database') ensureKindArchitecture('database', 'База данных')
    if (nav === 'architecture') {
      const current = project.architectures.find((a) => a.id === architectureId)
      if (current?.kind === 'database' && !current.parent_component_id) {
        goToArchitecture(project.root_architecture_id)
      }
    }
  }, [nav, project?.id, ensureKindArchitecture, goToArchitecture])

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
        <h2>Загрузка проекта…</h2>
      </div>
    )
  }

  const canvasNav = nav === 'architecture' || nav === 'database'
  const libFilter = nav === 'database' ? 'table' : undefined
  const startResize = (event: React.PointerEvent) => {
    const startX = event.clientX
    const startWidth = inspectorWidth
    const move = (e: PointerEvent) => setInspectorWidth(Math.min(620, Math.max(300, startWidth + startX - e.clientX)))
    const end = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
  }

  return (
    <div className="app-shell">
      <TopBar />
      <div className={`workspace ${canvasNav && inspectorOpen ? '' : 'no-inspector'}`} style={canvasNav && inspectorOpen ? { '--inspector': `${inspectorWidth}px` } as React.CSSProperties : undefined}>
        <LeftSidebar />
        {canvasNav ? (
          <>
            <div className="canvas-stage">
              {nav === 'database' ? <SqlToolbar /> : null}
              <LibraryRail presets={presets} filter={libFilter} />
              <ArchitectureCanvas />
            </div>
            {inspectorOpen ? <div className="inspector-shell"><div className="inspector-resizer" onPointerDown={startResize} aria-label="Изменить ширину панели свойств" /><Inspector onClose={() => setInspectorOpen(false)} /></div> : (
              <button className="inspector-show" type="button" title="Показать свойства" aria-label="Показать свойства" onClick={() => setInspectorOpen(true)}><PanelRightOpen size={17} /></button>
            )}
          </>
        ) : (
          <div style={{ minWidth: 0, minHeight: 0 }}>
            {nav === 'algorithms' ? <AlgorithmsView /> : null}
            {nav === 'documents' ? <DocumentsView /> : null}
            {nav === 'learning' ? <LearningView /> : null}
            {nav === 'tutorial' ? <TutorialView /> : null}
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
