export const CANVAS_FIT_MS = 220

let fitGeneration = 0

export function beginCanvasFit() {
  fitGeneration += 1
  return fitGeneration
}

export function cancelCanvasFit() {
  fitGeneration += 1
}

export function isCanvasFitCurrent(token: number) {
  return token === fitGeneration
}

export function shouldReduceMotion(setting?: boolean) {
  if (setting) return true
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
