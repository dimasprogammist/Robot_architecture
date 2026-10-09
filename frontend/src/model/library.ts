import { uid } from '../lib/ids'
import type { Component, LibraryPreset, Project } from '../types'

export const CATEGORY_COLORS: Record<string, string> = {
  SOFTWARE: '#2F9E78',
  HARDWARE: '#C46B2E',
  DATA: '#2B8FD4',
  PROTOCOL: '#6B5AD8',
  NETWORK: '#155E75',
  MECHANICS: '#A16207',
  ELECTRICAL: '#D9773A',
  OTHER: '#57534E',
}

export const CANVAS_CATEGORIES = ['HARDWARE', 'SOFTWARE', 'DATA', 'NETWORK', 'MECHANICS', 'ELECTRICAL', 'OTHER'] as const

export function presetColor(preset: Pick<LibraryPreset, 'category' | 'color'>) {
  return preset.color || CATEGORY_COLORS[preset.category] || CATEGORY_COLORS.OTHER
}

export function normalizePreset(preset: LibraryPreset): LibraryPreset {
  return {
    ...preset,
    id: preset.id || `lib-${uid()}`,
    icon: preset.icon || 'box',
    technology: preset.technology || '',
    entity_kind: preset.entity_kind || (preset.type === 'Таблица' ? 'table' : 'component'),
    color: presetColor(preset),
    built_in: preset.built_in !== false,
    stripe_width: preset.stripe_width && preset.stripe_width > 0 ? preset.stripe_width : 3,
    hardware_id: preset.hardware_id,
    protocol_id: preset.protocol_id,
  }
}

export function matchPreset(
  presets: LibraryPreset[],
  component: Pick<Component, 'name' | 'type' | 'category' | 'hardware_id' | 'library_preset_id'>,
) {
  if (component.library_preset_id) {
    const byId = presets.find((item) => item.id === component.library_preset_id)
    if (byId) return byId
  }
  if (component.hardware_id) {
    const byHardware = presets.find((item) => item.hardware_id === component.hardware_id)
    if (byHardware) return byHardware
  }
  const byName = presets.find((item) => item.name === component.name)
  if (byName) return byName
  const sameType = presets.filter((item) => item.type === component.type && item.category === component.category)
  if (sameType.length === 1) return sameType[0]
  return undefined
}

export function catalogLook(component: Component, presets: LibraryPreset[]): Component {
  const preset = matchPreset(presets, component)
  if (!preset) {
    return {
      ...component,
      color: component.color || CATEGORY_COLORS[component.category] || CATEGORY_COLORS.OTHER,
    }
  }
  return {
    ...component,
    type: preset.type,
    category: preset.category,
    icon: preset.icon,
    color: component.color || presetColor(preset),
    technology: preset.technology || component.technology,
    entity_kind: preset.entity_kind || component.entity_kind,
    hardware_id: preset.hardware_id || component.hardware_id,
    library_preset_id: preset.id || component.library_preset_id,
  }
}

export function applyPresetToInstances(project: Project, preset: LibraryPreset, previous?: LibraryPreset) {
  for (const component of project.components) {
    const matched = matchPreset(project.library_presets, component)
    const linked =
      matched?.id === preset.id ||
      Boolean(previous && (component.library_preset_id === previous.id || component.name === previous.name))
    if (!linked) continue
    const renamed = previous ? component.name !== previous.name && component.name !== preset.name : component.name !== preset.name
    component.library_preset_id = preset.id
    if (!renamed) component.name = preset.name
    component.type = preset.type
    component.category = preset.category
    component.icon = preset.icon
    component.color = presetColor(preset)
    component.technology = preset.technology || ''
    if (preset.entity_kind) component.entity_kind = preset.entity_kind
    if (preset.hardware_id) component.hardware_id = preset.hardware_id
  }
}

export function bindInstancesToCatalog(project: Project) {
  let changed = false
  for (const component of project.components) {
    const preset = matchPreset(project.library_presets, component)
    if (preset?.id && component.library_preset_id !== preset.id) {
      component.library_preset_id = preset.id
      changed = true
    }
  }
  return changed
}

export function seedLibraryPresets(project: Project, builtins: LibraryPreset[]) {
  if (!project.library_presets) project.library_presets = []
  let changed = false
  if (!project.library_presets.length) {
    project.library_presets = builtins.map((item) => normalizePreset({ ...item, built_in: true }))
    changed = true
  } else {
    const builtinByKey = new Map(builtins.map((item) => [`${item.category}::${item.name}`, item]))
    project.library_presets = project.library_presets.map((item) => {
      const next = normalizePreset(item)
      const fresh = builtinByKey.get(`${item.category}::${item.name}`)
      if (fresh && item.built_in !== false) {
        if (fresh.icon && next.icon !== fresh.icon && (next.icon === 'flash' || next.icon === 'box')) {
          next.icon = fresh.icon
          changed = true
        }
      }
      if (!item.id || !item.color || !item.stripe_width) changed = true
      return next
    })
    const have = new Set(project.library_presets.map((item) => `${item.category}::${item.name}`))
    for (const item of builtins) {
      const key = `${item.category}::${item.name}`
      if (have.has(key)) continue
      project.library_presets.push(normalizePreset({ ...item, built_in: true }))
      have.add(key)
      changed = true
    }
  }
  if (bindInstancesToCatalog(project)) changed = true
  return changed
}

export function emptyLibraryPreset(): LibraryPreset {
  return {
    id: uid(),
    name: 'Новый компонент',
    type: 'Свой компонент',
    category: 'HARDWARE',
    icon: 'box',
    technology: '',
    color: CATEGORY_COLORS.HARDWARE,
    built_in: false,
    entity_kind: 'component',
    stripe_width: 3,
  }
}
