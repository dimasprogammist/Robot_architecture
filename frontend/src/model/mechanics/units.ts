export const PX_PER_M = 400
export const G = 9.80665

export function mmToM(mm: number) {
  return mm / 1000
}

export function mToMm(m: number) {
  return m * 1000
}

export function degToRad(deg: number) {
  return (deg * Math.PI) / 180
}

export function radToDeg(rad: number) {
  return (rad * 180) / Math.PI
}

export function rpmToRadS(rpm: number) {
  return (rpm * 2 * Math.PI) / 60
}

export function radSToRpm(w: number) {
  return (w * 60) / (2 * Math.PI)
}

export function parseFinite(raw: string | number | null | undefined, fallback: number) {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : fallback
  const n = Number.parseFloat(String(raw ?? '').trim().replace(',', '.'))
  return Number.isFinite(n) ? n : fallback
}

export function screenToModel(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number },
  pan: { x: number; y: number },
  zoom: number,
) {
  const scale = PX_PER_M * zoom
  return {
    x: (clientX - rect.left - pan.x) / scale,
    y: -(clientY - rect.top - pan.y) / scale,
  }
}

export function modelToScreen(x: number, y: number, pan: { x: number; y: number }, zoom: number) {
  const scale = PX_PER_M * zoom
  return { x: pan.x + x * scale, y: pan.y - y * scale }
}
