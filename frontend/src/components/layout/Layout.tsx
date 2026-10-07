import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutAndReload } from '../../AuthGate'
import { api, type AuthUser } from '../../lib/api'
import {
  BookOpen,
  Database,
  FileText,
  FolderKanban,
  GraduationCap,
  Layers3,
  ListChecks,
  Redo2,
  Save,
  Search,
  Settings,
  Share2,
  Undo2,
  User,
  Workflow,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUiStore } from '../../store/useUiStore'
import type { NavId } from '../../types'

// Both the left navigation rail and the top bar are small, always-rendered
// pieces of app "chrome" used together by Workspace — kept in one file so
// the overall layout doesn't need two separate tiny files to navigate.

const NAV_ITEMS: { id: NavId; label: string; icon: typeof Layers3 }[] = [
  { id: 'architecture', label: 'Архитектура', icon: Layers3 },
  { id: 'database', label: 'База данных', icon: Database },
  { id: 'algorithms', label: 'Алгоритмы', icon: Workflow },
  { id: 'documents', label: 'Документы', icon: FileText },
  { id: 'tutorial', label: 'Учебник', icon: GraduationCap },
  { id: 'exercises', label: 'Задачник', icon: ListChecks },
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
        {saving || dirty ? (
          <span className="save-meta">{saving ? 'Сохранение…' : 'Есть изменения'}</span>
        ) : null}
        <button className="icon-btn" type="button" title="Отменить" aria-label="Отменить" onClick={() => undo()}>
          <Undo2 size={16} />
        </button>
        <button className="icon-btn" type="button" title="Повторить" aria-label="Повторить" onClick={() => redo()}>
          <Redo2 size={16} />
        </button>
        <button className="icon-btn" type="button" title="Поиск" aria-label="Поиск" onClick={() => setSearchOpen(true)}>
          <Search size={16} />
        </button>
        <button className="icon-btn" type="button" title="Сохранить проект" aria-label="Сохранить проект" onClick={() => saveNow()}>
          <Save size={16} />
        </button>
        <button className="icon-btn primary" type="button" title="Экспорт для AI" aria-label="Экспорт для AI" onClick={() => setExportOpen(true)}>
          <Share2 size={16} />
        </button>
        <button className="icon-btn" type="button" title="К списку проектов" aria-label="К списку проектов" onClick={() => navigate('/')}>
          <FolderKanban size={16} />
        </button>
        <ProfileMenu />
      </div>
    </header>
  )
}

export function ProfileMenu({ showSettings = true }: { showSettings?: boolean }) {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const setNav = useUiStore((s) => s.setNav)
  useEffect(() => {
    api.me().then(setUser).catch(() => setUser(null))
  }, [])
  return (
    <div className="profile-wrap">
      <button className="icon-btn" type="button" title="Профиль" aria-label="Профиль" onClick={() => setOpen((value) => !value)}>
        <User size={16} />
      </button>
      {open ? (
        <div className="profile-menu">
          <div className="profile-name">{user?.display_name || 'Профиль'}</div>
          <div className="hint">{user?.email}</div>
          {showSettings ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setNav('settings')
              }}
            >
              Настройки
            </button>
          ) : null}
          <button type="button" onClick={logoutAndReload}>
            Выйти
          </button>
        </div>
      ) : null}
    </div>
  )
}
