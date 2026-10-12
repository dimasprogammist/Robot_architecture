import { uid } from '../lib/ids'
import type { Component, Project } from '../types'
import { resolvedCardSize } from './cardSize'
import { emptyMechanical, withComponentDefaults } from './defaults'
import { terminalsFor } from './terminals'

const SHARED: (keyof Component)[] = ['name', 'type', 'category', 'description', 'icon', 'technology', 'color']

export function isPowerClone(c: Component) {
  return Boolean(c.extra_fields?.source_component_id)
}

export function hasElectricalPorts(
  c: Pick<Component, 'category' | 'type' | 'name' | 'extra_fields'> & { entity_kind?: Component['entity_kind'] },
) {
  if (c.entity_kind === 'table') return false
  return terminalsFor(c).length > 0
}

export function canListOnPowerLibrary(c: Component, p: Project) {
  if (c.extra_fields?.source_component_id) return false
  const arch = p.architectures.find((a) => a.id === c.architecture_id)
  if (!arch || arch.kind === 'power' || arch.kind === 'database') return false
  return hasElectricalPorts(c)
}

export function hasElectricalAspect(
  c: Pick<Component, 'category' | 'type' | 'name' | 'extra_fields'> & { entity_kind?: Component['entity_kind'] },
) {
  if (c.extra_fields?.source_component_id) return false
  if (c.extra_fields?.omit_power_view === '1') return false
  return hasElectricalPorts(c)
}

export function powerArchitectureId(p: Project) {
  const existing = p.architectures.find((a) => a.kind === 'power' && !a.parent_component_id)
  if (existing) return existing.id
  const id = uid()
  p.architectures.push({
    id,
    project_id: p.id,
    name: 'Схема питания',
    parent_component_id: null,
    description: 'Схема питания',
    kind: 'power',
  })
  return id
}

export function findPowerView(p: Project, sourceId: string) {
  const powerId = p.architectures.find((a) => a.kind === 'power' && !a.parent_component_id)?.id
  if (!powerId) return undefined
  return p.components.find((c) => c.architecture_id === powerId && c.extra_fields?.source_component_id === sourceId)
}

function freeSlot(p: Project, powerId: string) {
  const others = p.components.filter((c) => c.architecture_id === powerId)
  const taken = new Set(others.map((c) => `${Math.round(c.position.x / 20)}_${Math.round(c.position.y / 20)}`))
  for (let i = 0; i < 100; i++) {
    const x = 72 + (i % 5) * 188
    const y = 72 + Math.floor(i / 5) * 136
    if (!taken.has(`${Math.round(x / 20)}_${Math.round(y / 20)}`)) return { x, y }
  }
  return { x: 72, y: 72 + others.length * 24 }
}

export function rootSystemId(p: Project) {
  return p.root_architecture_id
}

export function ensureArchitectureSource(p: Project, viewId: string) {
  const view = p.components.find((c) => c.id === viewId)
  if (!view) return null
  if (view.extra_fields?.source_component_id) return view.extra_fields.source_component_id
  const arch = p.architectures.find((a) => a.id === view.architecture_id)
  if (arch?.kind !== 'power') return null
  if (!hasElectricalPorts(view)) return null
  const sourceId = uid()
  const size = resolvedCardSize(view)
  const extra = freshCopyFields(view.extra_fields)
  p.components.push(
    withComponentDefaults({
      id: sourceId,
      architecture_id: rootSystemId(p),
      name: view.name,
      type: view.type,
      category: view.category,
      description: view.description,
      icon: view.icon,
      technology: view.technology,
      color: view.color,
      extra_fields: extra,
      mechanical: view.mechanical || emptyMechanical(),
      width: size.width,
      height: size.height,
      position: freeSlot(p, rootSystemId(p)),
    }),
  )
  view.extra_fields = { ...(view.extra_fields || {}), source_component_id: sourceId }
  return sourceId
}

export function syncArchitectureFromPower(p: Project) {
  const powerId = p.architectures.find((a) => a.kind === 'power' && !a.parent_component_id)?.id
  if (!powerId) return
  for (const c of [...p.components]) {
    if (c.architecture_id !== powerId) continue
    if (c.extra_fields?.source_component_id) continue
    ensureArchitectureSource(p, c.id)
  }
}

export function ensurePowerView(p: Project, sourceId: string, position?: { x: number; y: number }) {
  const src = p.components.find((c) => c.id === sourceId)
  if (!src || !hasElectricalAspect(src)) return null
  const existing = findPowerView(p, sourceId)
  if (existing) {
    if (position) existing.position = position
    return existing.id
  }
  const powerId = powerArchitectureId(p)
  const size = resolvedCardSize(src)
  const id = uid()
  p.components.push(
    withComponentDefaults({
      id,
      architecture_id: powerId,
      name: src.name,
      type: src.type,
      category: src.category,
      description: src.description,
      icon: src.icon,
      technology: src.technology,
      color: src.color,
      extra_fields: { ...(src.extra_fields || {}), source_component_id: sourceId },
      mechanical: src.mechanical || emptyMechanical(),
      width: size.width,
      height: size.height,
      position: position || freeSlot(p, powerId),
      files: src.files || [],
      docs: src.docs || [],
    }),
  )
  return id
}

export function syncPowerViewsFromArchitecture(p: Project) {
  const ids = p.components.filter((c) => hasElectricalAspect(c)).map((c) => c.id)
  for (const id of ids) ensurePowerView(p, id)
}

function copyShared(target: Component, source: Component) {
  for (const key of SHARED) {
    ;(target as unknown as Record<string, unknown>)[key] = source[key]
  }
  target.mechanical = source.mechanical
  target.files = source.files
  target.docs = source.docs
  target.requirement_ids = source.requirement_ids
}

export function syncLinkedComponent(p: Project, id: string) {
  const c = p.components.find((x) => x.id === id)
  if (!c) return
  const sourceId = c.extra_fields?.source_component_id
  if (sourceId) {
    const src = p.components.find((x) => x.id === sourceId)
    if (!src) return
    copyShared(src, c)
    const extra = { ...(c.extra_fields || {}) }
    delete extra.source_component_id
    src.extra_fields = { ...(src.extra_fields || {}), ...extra }
    return
  }
  const view = findPowerView(p, id)
  if (!view) return
  copyShared(view, c)
  view.extra_fields = { ...(c.extra_fields || {}), source_component_id: id }
}

export function markOmitPowerView(p: Project, sourceId: string) {
  const src = p.components.find((c) => c.id === sourceId)
  if (!src) return
  src.extra_fields = { ...(src.extra_fields || {}), omit_power_view: '1' }
}

export function clearOmitPowerView(p: Project, sourceId: string) {
  const src = p.components.find((c) => c.id === sourceId)
  if (!src?.extra_fields) return
  const next = { ...src.extra_fields }
  delete next.omit_power_view
  src.extra_fields = next
}

export function collectOwnedIds(p: Project, seed: Iterable<string>) {
  const drop = new Set(seed)
  let grew = true
  while (grew) {
    grew = false
    for (const arch of p.architectures) {
      if (!arch.parent_component_id || !drop.has(arch.parent_component_id)) continue
      for (const c of p.components) {
        if (c.architecture_id === arch.id && !drop.has(c.id)) {
          drop.add(c.id)
          grew = true
        }
      }
    }
    for (const c of p.components) {
      const src = c.extra_fields?.source_component_id
      if (src && drop.has(src) && !drop.has(c.id)) {
        drop.add(c.id)
        grew = true
      }
    }
  }
  return drop
}

export function removeComponentsAndDependents(p: Project, seed: Iterable<string>) {
  const drop = collectOwnedIds(p, seed)
  p.components = p.components.filter((c) => !drop.has(c.id))
  p.connections = p.connections.filter((c) => !drop.has(c.source) && !drop.has(c.target) && !drop.has(c.id))
  p.algorithms = p.algorithms.filter((a) => !drop.has(a.component_id))
  p.architectures = p.architectures.filter((a) => !a.parent_component_id || !drop.has(a.parent_component_id))
  const liveConn = new Set(p.connections.map((c) => c.id))
  for (const r of p.requirements) {
    r.component_ids = r.component_ids.filter((id) => !drop.has(id))
    r.connection_ids = r.connection_ids.filter((id) => liveConn.has(id))
  }
  if (p.mechanics) {
    p.mechanics.elements = p.mechanics.elements.filter((e) => !drop.has(e.id))
    p.mechanics.joints = p.mechanics.joints.filter(
      (j) => !drop.has(j.id) && !drop.has(j.parent_id) && !drop.has(j.child_id),
    )
    if (p.mechanics.ee_id && drop.has(p.mechanics.ee_id)) p.mechanics.ee_id = null
  }
  return drop
}

export function pruneOrphanAlgorithms(p: Project) {
  const ids = new Set(p.components.map((c) => c.id))
  const before = p.algorithms.length
  p.algorithms = p.algorithms.filter((a) => ids.has(a.component_id))
  return p.algorithms.length !== before
}

export function pruneDanglingGraph(p: Project) {
  let removedComps = 0
  let grew = true
  while (grew) {
    grew = false
    const live = new Set(p.components.map((c) => c.id))
    const dropArch = new Set(
      p.architectures.filter((a) => a.parent_component_id && !live.has(a.parent_component_id)).map((a) => a.id),
    )
    if (!dropArch.size) break
    const before = p.components.length
    p.components = p.components.filter((c) => !dropArch.has(c.architecture_id))
    removedComps += before - p.components.length
    p.architectures = p.architectures.filter((a) => !dropArch.has(a.id))
    grew = true
  }
  const beforeAlgs = p.algorithms.length
  pruneOrphanAlgorithms(p)
  return { removedComps, removedAlgs: beforeAlgs - p.algorithms.length }
}

export function freshCopyFields(extra: Record<string, string> | undefined) {
  const next = { ...(extra || {}) }
  delete next.source_component_id
  delete next.omit_power_view
  return next
}
