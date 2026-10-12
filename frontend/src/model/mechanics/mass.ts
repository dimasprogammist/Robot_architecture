import type { Component } from '../../types'
import type { MechanicsModel } from './types'

export function parseMassKg(raw: string | number | null | undefined): number | null {
  if (raw == null || raw === '') return null
  if (typeof raw === 'number') return Number.isFinite(raw) && raw >= 0 ? raw : null
  const n = Number.parseFloat(String(raw).trim().replace(',', '.').replace(/кг/i, ''))
  return Number.isFinite(n) && n >= 0 ? n : null
}

export function componentUnitMass(c: Component) {
  return parseMassKg(c.mechanical?.weight)
}

export function componentQty(c: Component) {
  const q = c.mechanical?.quantity
  return Number.isFinite(q) && (q as number) > 0 ? Number(q) : 1
}

export function architectureCandidates(components: Component[]) {
  return components.filter((c) => c.entity_kind !== 'table' && !c.extra_fields?.source_component_id)
}

export interface MassRow {
  id: string
  name: string
  qty: number
  unit: number | null
  total: number | null
  source: 'element' | 'architecture'
  included: boolean
}

export function massBreakdown(model: MechanicsModel, components: Component[]): {
  rows: MassRow[]
  known: number
  unknownCount: number
  incomplete: boolean
} {
  const ids = new Set(model.included_component_ids || [])
  const rows: MassRow[] = model.elements.map((el) => ({
    id: el.id,
    name: el.name,
    qty: 1,
    unit: el.mass,
    total: el.mass,
    source: 'element',
    included: true,
  }))
  for (const c of architectureCandidates(components)) {
    const included = ids.has(c.id) || model.elements.some((e) => e.catalog_component_id === c.id)
    if (!included) continue
    if (rows.some((r) => r.id === c.id)) continue
    const unit = componentUnitMass(c)
    const qty = componentQty(c)
    rows.push({
      id: c.id,
      name: c.name,
      qty,
      unit,
      total: unit == null ? null : unit * qty,
      source: 'architecture',
      included: true,
    })
  }
  const known = rows.reduce((s, r) => s + (r.total ?? 0), 0)
  const unknownCount = rows.filter((r) => r.total == null).length
  return { rows, known, unknownCount, incomplete: unknownCount > 0 || !rows.length }
}

export function minObstacleDistance(model: MechanicsModel, x: number, y: number) {
  let min = Infinity
  for (const o of model.obstacles) {
    if (o.kind === 'circle') {
      const d = Math.hypot(x - o.x, y - o.y) - o.width / 2
      min = Math.min(min, d)
      continue
    }
    if (o.kind === 'line') {
      const abx = o.x2 - o.x
      const aby = o.y2 - o.y
      const t = Math.max(0, Math.min(1, ((x - o.x) * abx + (y - o.y) * aby) / (abx * abx + aby * aby || 1)))
      min = Math.min(min, Math.hypot(x - (o.x + t * abx), y - (o.y + t * aby)) - o.thickness / 2)
      continue
    }
    const dx = Math.max(Math.abs(x - o.x) - o.width / 2, 0)
    const dy = Math.max(Math.abs(y - o.y) - o.height / 2, 0)
    min = Math.min(min, Math.hypot(dx, dy) || -Math.min(o.width / 2 - Math.abs(x - o.x), o.height / 2 - Math.abs(y - o.y)))
  }
  return Number.isFinite(min) ? min : null
}
