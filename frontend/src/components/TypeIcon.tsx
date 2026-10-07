import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Camera,
  CircuitBoard,
  Cloud,
  Cog,
  Cpu,
  Database,
  Factory,
  Folder,
  Globe,
  Layout,
  Layers,
  Puzzle,
  Radar,
  Radio,
  Server,
  User,
  Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const map: Record<string, LucideIcon> = {
  box: Box,
  app: Layers,
  service: Workflow,
  server: Server,
  layout: Layout,
  book: Folder,
  puzzle: Puzzle,
  api: Radio,
  chip: CircuitBoard,
  cpu: Cpu,
  board: CircuitBoard,
  factory: Factory,
  sensor: Radar,
  motor: Workflow,
  camera: Camera,
  radar: Radar,
  network: Globe,
  db: Database,
  cache: Database,
  folder: Folder,
  queue: Layers,
  protocol: Radio,
  cloud: Cloud,
  globe: Globe,
  user: User,
  gear: Cog,
  part: Cog,
}

export const TYPE_ICON_NAMES = Object.keys(map)

export const TYPE_ICON_LABELS: Record<string, string> = {
  box: 'Компонент',
  app: 'Приложение',
  service: 'Сервис',
  server: 'Сервер',
  layout: 'Макет',
  book: 'Документы',
  puzzle: 'Модуль',
  api: 'API',
  chip: 'Плата',
  cpu: 'Процессор',
  board: 'Плата',
  factory: 'Производство',
  sensor: 'Датчик',
  motor: 'Двигатель',
  camera: 'Камера',
  radar: 'Радар',
  network: 'Сеть',
  db: 'База данных',
  cache: 'Кэш',
  folder: 'Папка',
  queue: 'Очередь',
  protocol: 'Протокол',
  cloud: 'Облако',
  globe: 'Глобус',
  user: 'Пользователь',
  gear: 'Шестерня',
  part: 'Деталь',
}

export function typeIconLabel(name: string) {
  return TYPE_ICON_LABELS[name] || name
}

export function TypeIcon({ name, size = 14 }: { name: string; size?: number }) {
  const Icon = map[name] || Box
  return <Icon size={size} />
}

export function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="icon-picker" ref={root}>
      <button
        className="icon-picker-btn"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <TypeIcon name={value} size={16} />
        <span>{typeIconLabel(value)}</span>
      </button>
      {open ? (
        <div className="icon-picker-menu" role="listbox">
          {TYPE_ICON_NAMES.map((name) => (
            <button
              key={name}
              className={`icon-picker-option ${name === value ? 'on' : ''}`}
              type="button"
              role="option"
              aria-selected={name === value}
              onClick={() => {
                onChange(name)
                setOpen(false)
              }}
            >
              <TypeIcon name={name} size={16} />
              <span>{typeIconLabel(name)}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
