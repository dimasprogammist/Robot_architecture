import { inWorkspace, obstacleHit, segmentHitsObstacle } from './collision'
import type { MechObstacle, MechWorkspace } from './types'

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

export function planAStar(
  ws: MechWorkspace,
  obstacles: MechObstacle[],
  start: { x: number; y: number },
  goal: { x: number; y: number },
  inflate: number,
  cell = 0.05,
): { ok: true; points: { x: number; y: number }[] } | { ok: false; reason: string } {
  if (!inWorkspace(ws, start.x, start.y, inflate) || !inWorkspace(ws, goal.x, goal.y, inflate)) {
    return { ok: false, reason: 'Старт или цель вне рабочей области с учётом габарита робота.' }
  }
  const nx = Math.max(4, Math.ceil(ws.width / cell))
  const ny = Math.max(4, Math.ceil(ws.height / cell))
  const cellPos = (ix: number, iy: number, fx = 0.5, fy = 0.5) => ({ x: (ix + fx) * cell, y: (iy + fy) * cell })
  const blocked = new Uint8Array(nx * ny)
  const samples: [number, number][] = [
    [0.2, 0.2],
    [0.5, 0.5],
    [0.8, 0.2],
    [0.2, 0.8],
    [0.8, 0.8],
  ]
  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      let busy = false
      for (const [fx, fy] of samples) {
        const p = cellPos(ix, iy, fx, fy)
        if (!inWorkspace(ws, p.x, p.y, inflate) || obstacles.some((o) => obstacleHit(o, p.x, p.y, inflate))) {
          busy = true
          break
        }
      }
      if (busy) blocked[iy * nx + ix] = 1
    }
  }
  const si = Math.min(nx - 1, Math.max(0, Math.floor(start.x / cell)))
  const sj = Math.min(ny - 1, Math.max(0, Math.floor(start.y / cell)))
  const gi = Math.min(nx - 1, Math.max(0, Math.floor(goal.x / cell)))
  const gj = Math.min(ny - 1, Math.max(0, Math.floor(goal.y / cell)))
  if (blocked[sj * nx + si] || blocked[gj * nx + gi]) {
    return { ok: false, reason: 'Старт или цель пересекаются с препятствием с учётом габарита робота.' }
  }
  const key = (i: number, j: number) => j * nx + i
  const open: { i: number; j: number; f: number }[] = [{ i: si, j: sj, f: 0 }]
  const came = new Int32Array(nx * ny).fill(-1)
  const gScore = new Float64Array(nx * ny).fill(Infinity)
  gScore[key(si, sj)] = 0
  const heur = (i: number, j: number) => Math.hypot(i - gi, j - gj)
  const seen = new Uint8Array(nx * ny)
  while (open.length) {
    open.sort((a, b) => a.f - b.f)
    const cur = open.shift()!
    const ck = key(cur.i, cur.j)
    if (seen[ck]) continue
    seen[ck] = 1
    if (cur.i === gi && cur.j === gj) {
      const pts: { x: number; y: number }[] = []
      let k = ck
      while (k >= 0) {
        const j = Math.floor(k / nx)
        const i = k - j * nx
        pts.push({ x: (i + 0.5) * cell, y: (j + 0.5) * cell })
        k = came[k]
      }
      pts.reverse()
      const snapped = [{ x: start.x, y: start.y }, ...pts.slice(1, -1), { x: goal.x, y: goal.y }]
      const mid = snapped.length > 1 ? snapped : pts
      for (let i = 1; i < mid.length; i++) {
        if (obstacles.some((o) => segmentHitsObstacle(o, mid[i - 1], mid[i], inflate))) {
          return { ok: false, reason: 'Путь на сетке найден, но соединение со стартом или целью пересекает препятствие.' }
        }
      }
      return { ok: true, points: mid }
    }
    for (const [di, dj] of DIRS) {
      const ni = cur.i + di
      const nj = cur.j + dj
      if (ni < 0 || nj < 0 || ni >= nx || nj >= ny) continue
      const nk = key(ni, nj)
      if (blocked[nk]) continue
      const a = cellPos(cur.i, cur.j)
      const b = cellPos(ni, nj)
      if (obstacles.some((o) => segmentHitsObstacle(o, a, b, inflate))) continue
      const step = di && dj ? Math.SQRT2 : 1
      const ng = gScore[ck] + step
      if (ng < gScore[nk]) {
        came[nk] = ck
        gScore[nk] = ng
        open.push({ i: ni, j: nj, f: ng + heur(ni, nj) })
      }
    }
  }
  return { ok: false, reason: 'Путь не найден: цель отделена препятствиями на сеточной карте.' }
}
