import {
  Box,
  FileText,
  FolderKanban,
  Layers3,
  Radio,
  ScrollText,
  Settings,
  Share2,
  Workflow,
} from 'lucide-react'
import { useUiStore } from '../../store/useUiStore'
import type { NavId } from '../../types'

const items: { id: NavId; label: string; icon: typeof Box }[] = [
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'architecture', label: 'Architecture', icon: Layers3 },
  { id: 'components', label: 'Components', icon: Box },
  { id: 'protocols', label: 'Protocols', icon: Radio },
  { id: 'algorithms', label: 'Algorithms', icon: Workflow },
  { id: 'requirements', label: 'Requirements', icon: ScrollText },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'export', label: 'Export', icon: Share2 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function LeftSidebar() {
  const nav = useUiStore((s) => s.nav)
  const setNav = useUiStore((s) => s.setNav)
  return (
    <nav className="left-nav">
      <div className="nav-section">
        <div className="nav-label">Workspace</div>
        {items.map((item) => {
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
