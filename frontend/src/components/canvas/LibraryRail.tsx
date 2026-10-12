import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { SearchField } from '../SearchField'
import { useUiStore } from '../../store/useUiStore'
import { useProjectStore as useP } from '../../store/useProjectStore'
import { canListOnPowerLibrary } from '../../model/canvasSync'
import { PRESET_GROUPS } from '../../model/presetGroups'
import { clampStripeWidth } from '../../model/cardSize'
import { DEFAULT_STRIPE_WIDTH } from '../../model/library'
import type { LibraryPreset } from '../../types'

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
    motors: true,
    elec: true,
  })
  const addFromPreset = useP((s) => s.addFromPreset)
  const placeArchitectureOnPower = useP((s) => s.placeArchitectureOnPower)
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
      ? presets.filter((p) => p.category !== 'PROTOCOL' && p.category !== 'ELECTRICAL')
      : filter === 'table'
        ? presets.filter((p) => p.entity_kind === 'table' || p.type === 'Таблица')
        : filter === 'power'
          ? presets.filter(
              (p) =>
                p.category !== 'SOFTWARE' &&
                (p.category === 'ELECTRICAL' ||
                  (p.category === 'HARDWARE' &&
                    /датчик|двигател|дпт|ад|сд|шагов|серво|плк|mcu|аккумулятор|реле|hmi|gnss/i.test(`${p.name} ${p.type}`))),
            )
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
        <button className="lib-add" type="button" onClick={toggleLibrary} aria-label="Добавить компонент" title="Компоненты">
          +
        </button>
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
      </div>
      {collapsed ? null : (
        <aside className="library-rail">
          <h3>Компоненты</h3>
          <SearchField placeholder="Поиск компонентов" value={q} onChange={setQ} />
          {filter === 'power' && project ? (
            <section className="lib-group">
              <button className="lib-group-btn" type="button">
                <span>С архитектуры</span>
              </button>
              {(() => {
                const available = project.components.filter((c) => {
                  if (!canListOnPowerLibrary(c, project)) return false
                  if (!c.name.toLowerCase().includes(q.toLowerCase())) return false
                  return !project.components.some(
                    (x) => x.architecture_id === architectureId && x.extra_fields?.source_component_id === c.id,
                  )
                })
                if (!available.length) {
                  return (
                    <p className="hint">
                      Нет компонентов архитектуры с электрическими контактами, которые ещё не перенесены на схему питания.
                    </p>
                  )
                }
                return available.map((c) => (
                  <div
                    key={c.id}
                    className="lib-item"
                    title="Перетащите на схему или дважды щёлкните"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/architecture-source', c.id)
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    onDoubleClick={() => placeArchitectureOnPower(c.id)}
                  >
                    <span className="lib-item-mark" style={{ background: c.color || 'var(--line-strong)', width: clampStripeWidth(DEFAULT_STRIPE_WIDTH) }} />
                    {c.name}
                  </div>
                ))
              })()}
              <p className="hint">Перетащите компонент на схему или дважды щёлкните. Соединения не перезаписываются, повторно тот же узел не дублируется.</p>
            </section>
          ) : null}
          {grouped.map((group) => {
            const expanded = q ? true : open[group.id] !== false
            return (
              <section key={group.id} className="lib-group">
                <button
                  className="lib-group-btn"
                  type="button"
                  onClick={() => {
                    if (q) return
                    setOpen((prev) => ({ ...prev, [group.id]: !expanded }))
                  }}
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
          {rest.length ? (
            <section className="lib-group">
              <button className="lib-group-btn" type="button">
                <span>Прочее</span>
                <span className="hint">{rest.length}</span>
              </button>
              {rest.map((preset) => (
                <PresetRow
                  key={preset.name + preset.type}
                  preset={preset}
                  onAdd={() => addFromPreset(preset, { x: 120 + Math.random() * 80, y: 120 + Math.random() * 80 })}
                />
              ))}
            </section>
          ) : null}
          {filter === 'power' ? null : (
            <p className="hint">
              {filter === 'table'
                ? 'Зависимости между таблицами указаны на стрелке.'
                : 'Протокол задаётся на стрелке между компонентами.'}
            </p>
          )}
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
      <span
        className="lib-item-mark"
        style={{ background: preset.color || 'var(--line-strong)', width: clampStripeWidth(preset.stripe_width) }}
      />
      {preset.name}
    </div>
  )
}
