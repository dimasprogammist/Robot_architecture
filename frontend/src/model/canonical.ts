import type { Component, Project } from '../types'

export function canonicalComponentId(p: Project, id: string) {
  const c = p.components.find((x) => x.id === id)
  return c?.extra_fields?.source_component_id || id
}

export function canonicalComponent(p: Project, id: string): Component | undefined {
  const cid = canonicalComponentId(p, id)
  return p.components.find((x) => x.id === cid) || p.components.find((x) => x.id === id)
}

export function relatedComponentIds(p: Project, id: string) {
  const cid = canonicalComponentId(p, id)
  return p.components.filter((c) => c.id === cid || c.extra_fields?.source_component_id === cid).map((c) => c.id)
}
