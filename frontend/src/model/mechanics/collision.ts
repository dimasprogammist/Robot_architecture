import type { MechObstacle, MechWorkspace } from './types'

export function robotRadius(length: number, width: number) {
  return Math.hypot(length, width) / 2
}

function pointSegDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const abx = bx - ax
  const aby = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby || 1)))
  return Math.hypot(px - (ax + t * abx), py - (ay + t * aby))
}

function segsIntersect(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, d: { x: number; y: number }) {
  const den = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x)
  if (Math.abs(den) < 1e-12) return false
  const t = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / den
  const u = ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / den
  return t >= 0 && t <= 1 && u >= 0 && u <= 1
}

export function obstacleHit(obs: MechObstacle, px: number, py: number, inflate: number) {
  if (obs.kind === 'circle') {
    return Math.hypot(px - obs.x, py - obs.y) <= obs.width / 2 + inflate
  }
  if (obs.kind === 'line') {
    return pointSegDist(px, py, obs.x, obs.y, obs.x2, obs.y2) <= obs.thickness / 2 + inflate
  }
  const hx = obs.width / 2 + inflate
  const hy = obs.height / 2 + inflate
  return px >= obs.x - hx && px <= obs.x + hx && py >= obs.y - hy && py <= obs.y + hy
}

export function segmentHitsObstacle(obs: MechObstacle, a: { x: number; y: number }, b: { x: number; y: number }, inflate: number) {
  if (obstacleHit(obs, a.x, a.y, inflate) || obstacleHit(obs, b.x, b.y, inflate)) return true
  if (obs.kind === 'circle') {
    return pointSegDist(obs.x, obs.y, a.x, a.y, b.x, b.y) <= obs.width / 2 + inflate
  }
  if (obs.kind === 'line') {
    const pad = obs.thickness / 2 + inflate
    if (segsIntersect(a, b, { x: obs.x, y: obs.y }, { x: obs.x2, y: obs.y2 })) return true
    return pointSegDist(obs.x, obs.y, a.x, a.y, b.x, b.y) <= pad || pointSegDist(obs.x2, obs.y2, a.x, a.y, b.x, b.y) <= pad
  }
  const hx = obs.width / 2 + inflate
  const hy = obs.height / 2 + inflate
  const corners = [
    { x: obs.x - hx, y: obs.y - hy },
    { x: obs.x + hx, y: obs.y - hy },
    { x: obs.x + hx, y: obs.y + hy },
    { x: obs.x - hx, y: obs.y + hy },
  ]
  for (let i = 0; i < 4; i++) {
    if (segsIntersect(a, b, corners[i], corners[(i + 1) % 4])) return true
  }
  return false
}

export function obstacleElevation(obs: MechObstacle) {
  return typeof obs.z_height === 'number' && Number.isFinite(obs.z_height) && obs.z_height >= 0 ? obs.z_height : 1
}

export function fliesOverObstacle(obs: MechObstacle, altitude: number, bodyHeight: number, clearance = 0.02) {
  const bottom = altitude - Math.max(0, bodyHeight) / 2
  return bottom >= obstacleElevation(obs) + clearance
}

export function pathCollisions(
  points: { x: number; y: number }[],
  obstacles: MechObstacle[],
  inflate: number,
  flight?: { airborne: boolean; altitude: number; bodyHeight: number } | null,
): { index: number; obstacleId: string; reason: 'plan' | 'altitude' } | null {
  for (let i = 1; i < points.length; i++) {
    for (const obs of obstacles) {
      if (flight?.airborne && fliesOverObstacle(obs, flight.altitude, flight.bodyHeight)) continue
      if (segmentHitsObstacle(obs, points[i - 1], points[i], inflate)) {
        const reason =
          flight?.airborne && !fliesOverObstacle(obs, flight.altitude, flight.bodyHeight) ? 'altitude' : 'plan'
        return { index: i, obstacleId: obs.id, reason }
      }
    }
  }
  return null
}

export function inWorkspace(ws: MechWorkspace, x: number, y: number, pad = 0) {
  return x >= pad && y >= pad && x <= ws.width - pad && y <= ws.height - pad
}
