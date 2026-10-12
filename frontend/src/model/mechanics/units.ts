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

export function fitWorkspaceView(ws: { width: number; height: number }, viewW: number, viewH: number) {
  const pad = 36
  const innerW = Math.max(80, viewW - pad * 2)
  const innerH = Math.max(80, viewH - pad * 2)
  const zoom = Math.min(8, Math.max(0.05, Math.min(innerW / (ws.width * PX_PER_M), innerH / (ws.height * PX_PER_M))))
  const scale = PX_PER_M * zoom
  return {
    zoom,
    pan: {
      x: pad + (innerW - ws.width * scale) / 2,
      y: pad + ws.height * scale + (innerH - ws.height * scale) / 2,
    },
  }
}

export function animateView(
  from: { pan: { x: number; y: number }; zoom: number },
  to: { pan: { x: number; y: number }; zoom: number },
  onFrame: (next: { pan: { x: number; y: number }; zoom: number }) => void,
  ms = 220,
  reduce = false,
) {
  if (reduce || ms <= 0) {
    onFrame(to)
    return () => undefined
  }
  let raf = 0
  let cancelled = false
  const t0 = performance.now()
  const tick = (now: number) => {
    if (cancelled) return
    const u = Math.min(1, (now - t0) / ms)
    const e = 1 - (1 - u) ** 3
    onFrame({
      pan: {
        x: from.pan.x + (to.pan.x - from.pan.x) * e,
        y: from.pan.y + (to.pan.y - from.pan.y) * e,
      },
      zoom: from.zoom + (to.zoom - from.zoom) * e,
    })
    if (u < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => {
    cancelled = true
    cancelAnimationFrame(raf)
  }
}

export function fitPointView(x: number, y: number, span: number, viewW: number, viewH: number) {
  const size = Math.max(span, 0.12) * 5
  const pad = 40
  const zoom = Math.min(8, Math.max(0.05, Math.min((viewW - pad * 2) / (size * PX_PER_M), (viewH - pad * 2) / (size * PX_PER_M))))
  const scale = PX_PER_M * zoom
  return { zoom, pan: { x: viewW / 2 - x * scale, y: viewH / 2 + y * scale } }
}
