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
  { id: 'projects', label: 'Проекты', icon: FolderKanban },
  { id: 'architecture', label: 'Архитектура', icon: Layers3 },
  { id: 'components', label: 'Компоненты', icon: Box },
  { id: 'protocols', label: 'Протоколы', icon: Radio },
  { id: 'algorithms', label: 'Алгоритмы', icon: Workflow },
  { id: 'requirements', label: 'Требования', icon: ScrollText },
  { id: 'documents', label: 'Документы', icon: FileText },
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
