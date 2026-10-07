import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { SearchField } from '../SearchField'
import { useUiStore } from '../../store/useUiStore'
import { useProjectStore as useP } from '../../store/useProjectStore'
import type { LibraryPreset } from '../../types'

interface PresetGroup {
  id: string
  title: string
  match: (preset: LibraryPreset) => boolean
}

const PRESET_GROUPS: PresetGroup[] = [
  { id: 'custom', title: 'Свои', match: (p) => p.built_in === false },
  { id: 'soft', title: 'Софт', match: (p) => p.category === 'SOFTWARE' && p.built_in !== false },
  {
    id: 'ctrl',
    title: 'Контроллеры',
    match: (p) =>
      p.category === 'HARDWARE' &&
      ['MCU', 'SBC', 'ПЛК', 'CPU', 'IPC', 'GPU', 'Контроллер двигателя', 'Контроллер'].includes(p.type),
  },
  {
    id: 'sense',
    title: 'Датчики',
    match: (p) =>
      p.category === 'HARDWARE' &&
      /камера|lidar|imu|энкодер|датчик|дальномер|концевой/i.test(`${p.name} ${p.type}`),
  },
  {
    id: 'act',
    title: 'Приводы',
    match: (p) =>
      p.category === 'HARDWARE' &&
      /двигатель|серво|привод|манипулятор|робот/i.test(`${p.name} ${p.type}`) &&
      p.type !== 'Контроллер двигателя',
  },
  { id: 'mech', title: 'Механика', match: (p) => p.category === 'MECHANICS' },
  { id: 'data', title: 'Данные', match: (p) => p.category === 'DATA' },
  { id: 'net', title: 'Сеть', match: (p) => p.category === 'NETWORK' },
]

export function LibraryRail({ presets, filter }: { presets: LibraryPreset[]; filter?: string }) {
  const collapsed = useUiStore((s) => s.libraryCollapsed)
  const toggleLibrary = useUiStore((s) => s.toggleLibrary)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>({
    custom: true,
    soft: true,
    ctrl: true,
    sense: true,
    act: true,
    mech: true,
    data: true,
    net: true,
    proto: true,
  })
  const addFromPreset = useP((s) => s.addFromPreset)
  const project = useP((s) => s.project)
  const architectureId = useP((s) => s.architectureId)
  const goToArchitecture = useP((s) => s.goToArchitecture)
  const parentArchitectureId = useMemo(() => {
    if (!project || !architectureId) return null
    const current = project.architectures.find((a) => a.id === architectureId)
    if (!current?.parent_component_id) return null
    const parentComp = project.components.find((c) => c.id === current.parent_component_id)
    return parentComp?.architecture_id || null
  }, [project, architectureId])
  const filtered = useMemo(() => {
    const byCat = !filter
      ? presets.filter((p) => p.category !== 'PROTOCOL')
      : filter === 'table'
        ? presets.filter((p) => p.entity_kind === 'table' || p.type === 'Таблица')
        : presets.filter((p) => p.category === filter && p.category !== 'PROTOCOL')
    return byCat.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.type.toLowerCase().includes(q.toLowerCase()))
  }, [presets, q, filter])
  const grouped = PRESET_GROUPS.map((group) => ({
    ...group,
    items: filtered.filter(group.match),
  })).filter((group) => group.items.length > 0)
  const claimed = new Set(grouped.flatMap((group) => group.items))
  const rest = filtered.filter((preset) => !claimed.has(preset))
  return (
    <>
      <div className="lib-tools">
        {parentArchitectureId ? (
          <button
            className="lib-add"
            type="button"
            title="Вернуться к предыдущему уровню архитектуры"
            aria-label="Назад"
            onClick={() => goToArchitecture(parentArchitectureId)}
          >
            <ArrowLeft size={16} />
          </button>
        ) : null}
        <button className="lib-add" type="button" onClick={toggleLibrary} aria-label="Добавить компонент" title="Компоненты">
          +
        </button>
      </div>
      {collapsed ? null : (
        <aside className="library-rail">
          <h3>Компоненты</h3>
          <SearchField placeholder="Поиск компонентов" value={q} onChange={setQ} />
          {grouped.map((group) => {
            const expanded = q ? true : open[group.id] !== false
            return (
              <section key={group.id} className="lib-group">
                <button
                  className="lib-group-btn"
                  type="button"
                  onClick={() => setOpen((prev) => ({ ...prev, [group.id]: !expanded }))}
                >
                  {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span>{group.title}</span>
                  <span className="hint">{group.items.length}</span>
                </button>
                {expanded
                  ? group.items.map((preset) => (
                      <PresetRow key={preset.name + preset.type} preset={preset} onAdd={() => addFromPreset(preset, { x: 120 + Math.random() * 80, y: 120 + Math.random() * 80 })} />
                    ))
                  : null}
              </section>
            )
          })}
          {rest.map((preset) => (
            <PresetRow key={preset.name + preset.type} preset={preset} onAdd={() => addFromPreset(preset, { x: 120 + Math.random() * 80, y: 120 + Math.random() * 80 })} />
          ))}
          <p className="hint">Протокол задаётся на стрелке между компонентами.</p>
        </aside>
      )}
    </>
  )
}

function PresetRow({ preset, onAdd }: { preset: LibraryPreset; onAdd: () => void }) {
  return (
    <div
      className="lib-item"
      draggable
      onDragStart={(e) => e.dataTransfer.setData('application/architecture-preset', JSON.stringify(preset))}
      onDoubleClick={onAdd}
    >
      <span className="lib-item-mark" style={{ background: preset.color || 'var(--line-strong)' }} />
      {preset.name}
    </div>
  )
}
