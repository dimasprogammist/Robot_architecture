import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useUiStore } from '../../store/useUiStore'
import { useProjectStore as useP } from '../../store/useProjectStore'
import type { LibraryPreset } from '../../types'

interface PresetGroup {
  id: string
  title: string
  match: (preset: LibraryPreset) => boolean
}

const PRESET_GROUPS: PresetGroup[] = [
  { id: 'soft', title: 'Софт', match: (p) => p.category === 'SOFTWARE' },
  { id: 'boards', title: 'Платы', match: (p) => p.category === 'HARDWARE' },
  { id: 'mech', title: 'Механика', match: (p) => p.category === 'MECHANICS' },
  { id: 'data', title: 'Данные', match: (p) => p.category === 'DATA' },
  { id: 'proto', title: 'Протоколы', match: (p) => p.category === 'PROTOCOL' || p.category === 'NETWORK' },
]

export function LibraryRail({ presets, filter }: { presets: LibraryPreset[]; filter?: string }) {
  const collapsed = useUiStore((s) => s.libraryCollapsed)
  const toggleLibrary = useUiStore((s) => s.toggleLibrary)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>({
    soft: true,
    boards: true,
    mech: true,
    data: true,
    proto: true,
  })
  const addFromPreset = useP((s) => s.addFromPreset)
  const filtered = useMemo(() => {
    const byCat = !filter
      ? presets
      : filter === 'table'
        ? presets.filter((p) => p.entity_kind === 'table' || p.type === 'Таблица')
        : presets.filter((p) => p.category === filter)
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
      <button className="lib-add" type="button" onClick={toggleLibrary} aria-label="Добавить компонент" title="Компоненты">
        +
      </button>
      {collapsed ? null : (
        <aside className="library-rail">
          <h3>Компоненты</h3>
          <input className="lib-search" placeholder="Поиск компонентов" value={q} onChange={(e) => setQ(e.target.value)} />
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
          <p className="hint">Перетащите на холст или дважды кликните, чтобы добавить.</p>
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
      {preset.name}
    </div>
  )
}
