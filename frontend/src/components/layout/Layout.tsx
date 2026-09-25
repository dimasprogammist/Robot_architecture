import { useNavigate } from 'react-router-dom'
import {
  Box,
  BookOpen,
  Database,
  FileText,
  FolderKanban,
  GraduationCap,
  Layers3,
  Radio,
  ScrollText,
  Settings,
  Share2,
  Cog,
  ListTree,
  Workflow,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUiStore } from '../../store/useUiStore'
import type { NavId } from '../../types'

// Both the left navigation rail and the top bar are small, always-rendered
// pieces of app "chrome" used together by Workspace — kept in one file so
// the overall layout doesn't need two separate tiny files to navigate.

const NAV_ITEMS: { id: NavId; label: string; icon: typeof Box }[] = [
  { id: 'projects', label: 'Проекты', icon: FolderKanban },
  { id: 'architecture', label: 'Архитектура', icon: Layers3 },
  { id: 'mechanics', label: 'Механика', icon: Cog },
  { id: 'database', label: 'База данных', icon: Database },
  { id: 'components', label: 'Компоненты', icon: Box },
  { id: 'protocols', label: 'Протоколы', icon: Radio },
  { id: 'algorithms', label: 'Алгоритмы', icon: Workflow },
  { id: 'requirements', label: 'Требования', icon: ScrollText },
  { id: 'documents', label: 'Документы', icon: FileText },
  { id: 'bom', label: 'BOM', icon: ListTree },
  { id: 'tutorial', label: 'Учебник', icon: GraduationCap },
  { id: 'learning', label: 'Справочник', icon: BookOpen },
  { id: 'export', label: 'Экспорт', icon: Share2 },
  { id: 'settings', label: 'Настройки', icon: Settings },
]

export function LeftSidebar() {
  const nav = useUiStore((s) => s.nav)
  const setNav = useUiStore((s) => s.setNav)
  return (
    <nav className="left-nav">
      <div className="nav-section">
        <div className="nav-label">Рабочая область</div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`nav-item ${nav === item.id ? 'active' : ''}`}
              onClick={() => setNav(item.id)}
              type="button"
            >
              <Icon />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

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
        <span className="save-meta">{saving ? 'Сохранение…' : dirty ? 'Не сохранено' : 'Сохранено'}</span>
        <button className="btn ghost" type="button" onClick={() => undo()}>
          Отменить
        </button>
        <button className="btn ghost" type="button" onClick={() => redo()}>
          Повторить
        </button>
        <button className="btn ghost" type="button" onClick={() => setSearchOpen(true)}>
          Поиск
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
          {theme === 'light' ? 'Тёмная' : 'Светлая'}
        </button>
        <button className="btn" type="button" onClick={() => saveNow()}>
          Сохранить
        </button>
        <button className="btn primary" type="button" onClick={() => setExportOpen(true)}>
          Экспорт для AI
        </button>
        <button className="btn ghost" type="button" onClick={() => navigate('/')}>
          Проекты
        </button>
      </div>
    </header>
  )
}
