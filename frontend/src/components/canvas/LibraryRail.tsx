import { useMemo, useState } from 'react'
import { useUiStore } from '../../store/useUiStore'
import { useProjectStore as useP } from '../../store/useProjectStore'
import type { LibraryPreset } from '../../types'

export function LibraryRail({ presets, filter }: { presets: LibraryPreset[]; filter?: string }) {
  const collapsed = useUiStore((s) => s.libraryCollapsed)
  const [q, setQ] = useState('')
  const addFromPreset = useP((s) => s.addFromPreset)
  const filtered = useMemo(() => {
    const byCat = !filter
      ? presets
      : filter === 'table'
        ? presets.filter((p) => p.entity_kind === 'table' || p.type === 'Таблица')
        : presets.filter((p) => p.category === filter)
    return byCat.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.type.toLowerCase().includes(q.toLowerCase()))
  }, [presets, q, filter])
  if (collapsed) return null
  return (
    <aside className="library-rail">
      <h3>Библиотека</h3>
      <input className="lib-search" placeholder="Поиск компонентов" value={q} onChange={(e) => setQ(e.target.value)} />
      {filtered.map((p) => (
        <div
          key={p.name + p.type}
          className="lib-item"
          draggable
          onDragStart={(e) => e.dataTransfer.setData('application/architecture-preset', JSON.stringify(p))}
          onDoubleClick={() => addFromPreset(p, { x: 120 + Math.random() * 80, y: 120 + Math.random() * 80 })}
        >
          {p.name}
        </div>
      ))}
      <p className="hint">Перетащите на холст или дважды кликните, чтобы добавить.</p>
    </aside>
  )
}
