import type { Component } from '../types'

export const CARD_MAX_WIDTH = 720
export const CARD_MAX_HEIGHT = 520

export function typeDefaultSize(component: Pick<Component, 'type' | 'name' | 'category'>): { width: number; height: number } {
  const key = `${component.type} ${component.name}`.toLowerCase()
  if (/клеммник/.test(key)) return { width: 176, height: 108 }
  if (/arduino|stm32|esp32/.test(key) || component.type === 'MCU') return { width: 228, height: 156 }
  if (/плк/.test(key)) return { width: 240, height: 168 }
  if (/трансформатор|операционн/.test(key)) return { width: 196, height: 128 }
  if (/резистор|диод|светодиод|конденсатор|катушк|ламп|предохран|кнопк/.test(key)) return { width: 152, height: 80 }
  if (/переключатель|реле|разъём|разъем|автомат/.test(key)) return { width: 168, height: 100 }
  if ((/двигател|серво|шагов/.test(key) || ['АД', 'СД', 'ДПТ'].includes(component.type)) && component.category !== 'MECHANICS') {
    return { width: 188, height: 116 }
  }
  if (component.category === 'ELECTRICAL') return { width: 172, height: 100 }
  if (component.category === 'HARDWARE') return { width: 188, height: 112 }
  return { width: 208, height: 96 }
}

export function parseCardDimension(raw: string | number | null | undefined, fallback: number): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : fallback
  const cleaned = String(raw ?? '')
    .trim()
    .replace(',', '.')
  if (!cleaned) return fallback
  const n = Number.parseFloat(cleaned)
  return Number.isFinite(n) ? n : fallback
}

export function clampCardSize(
  component: Pick<Component, 'type' | 'name' | 'category'>,
  width: number,
  height: number,
): { width: number; height: number } {
  const min = typeDefaultSize(component)
  const w = Number.isFinite(width) ? width : min.width
  const h = Number.isFinite(height) ? height : min.height
  return {
    width: Math.min(CARD_MAX_WIDTH, Math.max(min.width, Math.round(w))),
    height: Math.min(CARD_MAX_HEIGHT, Math.max(min.height, Math.round(h))),
  }
}

/** Apply typed/canvas size in model units. Never multiply by view zoom. */
export function applyCardSize(
  component: Pick<Component, 'type' | 'name' | 'category' | 'width' | 'height'>,
  width: number,
  height: number,
) {
  return clampCardSize(component, width, height)
}

export function resolvedCardSize(component: Pick<Component, 'type' | 'name' | 'category' | 'width' | 'height'>) {
  const min = typeDefaultSize(component)
  if (!component.width || !component.height) return min
  return clampCardSize(component, component.width, component.height)
}

export function clampStripeWidth(value: number | string | undefined) {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value || ''))
  if (!Number.isFinite(n)) return 3
  return Math.min(12, Math.max(2, Math.round(n)))
}
