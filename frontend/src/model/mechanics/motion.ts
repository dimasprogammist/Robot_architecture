/** Trapezoidal / triangular speed profile. Distances in m, speeds m/s, acc m/s². */

export function travelTime(
  distance: number,
  vMax: number | null,
  acc: number | null,
  dec: number | null,
): { ok: true; t: number; profile: 'const' | 'trap' | 'tri' } | { ok: false; reason: string } {
  if (!(distance >= 0) || !Number.isFinite(distance)) return { ok: false, reason: 'Не задана длина пути.' }
  if (distance === 0) return { ok: true, t: 0, profile: 'const' }
  if (vMax == null || !(vMax > 0)) return { ok: false, reason: 'Невозможно рассчитать время: не задана допустимая скорость.' }
  const a = acc != null && acc > 0 ? acc : null
  const d = dec != null && dec > 0 ? dec : a
  if (!a || !d) return { ok: true, t: distance / vMax, profile: 'const' }
  const sAcc = (vMax * vMax) / (2 * a)
  const sDec = (vMax * vMax) / (2 * d)
  if (sAcc + sDec >= distance) {
    const vPeak = Math.sqrt((2 * distance * a * d) / (a + d))
    return { ok: true, t: vPeak / a + vPeak / d, profile: 'tri' }
  }
  return { ok: true, t: vMax / a + vMax / d + (distance - sAcc - sDec) / vMax, profile: 'trap' }
}

export function turnRadius(v: number, w: number) {
  if (!(Math.abs(w) > 1e-9)) return { ok: true as const, R: Infinity, inPlace: Math.abs(v) < 1e-9 }
  return { ok: true as const, R: v / w, inPlace: Math.abs(v) < 1e-9 }
}

export function wheelsFromBody(v: number, w: number, r: number, track: number) {
  if (!(r > 0) || !(track > 0)) return { ok: false as const, reason: 'Нужны радиус колеса и колея.' }
  return {
    ok: true as const,
    omegaL: (v - (w * track) / 2) / r,
    omegaR: (v + (w * track) / 2) / r,
  }
}

/** Kinematic odometry from wheel angle increments (rad). Slip is not modelled. */
export function odometry(r: number, track: number, dThetaL: number, dThetaR: number) {
  if (!(r > 0) || !(track > 0)) return { ok: false as const, reason: 'Нужны радиус колеса и колея.' }
  return {
    ok: true as const,
    ds: (r / 2) * (dThetaR + dThetaL),
    dtheta: (r / track) * (dThetaR - dThetaL),
  }
}

export function pathLength(points: { x: number; y: number }[]) {
  let s = 0
  for (let i = 1; i < points.length; i++) s += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  return s
}

/** Linear axis: v = ω · pitch / 2π when pitch is lead per revolution. */
export function linearAxisSpeed(omega: number, pitch: number) {
  if (!(pitch > 0)) return { ok: false as const, reason: 'Укажите шаг передачи (ход за оборот).' }
  return { ok: true as const, v: (omega * pitch) / (2 * Math.PI) }
}

export function polylineFromWaypoints(points: { x: number; y: number }[]) {
  return points.map((p) => ({ x: p.x, y: p.y }))
}

export function stoppingDistance(v: number, dec: number | null) {
  if (!(v > 0)) return { ok: true as const, s: 0 }
  if (dec == null || !(dec > 0)) return { ok: false as const, reason: 'Для остановочного пути нужно торможение.' }
  return { ok: true as const, s: (v * v) / (2 * dec) }
}

export function accelTime(v: number, acc: number | null) {
  if (!(v > 0)) return { ok: true as const, t: 0 }
  if (acc == null || !(acc > 0)) return { ok: false as const, reason: 'Для времени разгона нужно ускорение.' }
  return { ok: true as const, t: v / acc }
}

/** Distance and speed at time t along a 1D trapezoid of length `distance`. */
export function motionAt(
  distance: number,
  t: number,
  vMax: number | null,
  acc: number | null,
  dec: number | null,
): { s: number; v: number; done: boolean } {
  const total = travelTime(distance, vMax, acc, dec)
  if (!total.ok || distance <= 0) return { s: 0, v: 0, done: true }
  if (t <= 0) return { s: 0, v: 0, done: false }
  if (t >= total.t) return { s: distance, v: 0, done: true }
  const vmax = vMax!
  const a = acc != null && acc > 0 ? acc : null
  const d = dec != null && dec > 0 ? dec : a
  if (!a || !d) {
    const s = Math.min(distance, vmax * t)
    return { s, v: vmax, done: s >= distance }
  }
  const sAcc = (vmax * vmax) / (2 * a)
  const sDec = (vmax * vmax) / (2 * d)
  if (sAcc + sDec >= distance) {
    const vPeak = Math.sqrt((2 * distance * a * d) / (a + d))
    const tAcc = vPeak / a
    if (t <= tAcc) return { s: 0.5 * a * t * t, v: a * t, done: false }
    const td = t - tAcc
    const s1 = 0.5 * a * tAcc * tAcc
    return { s: Math.min(distance, s1 + vPeak * td - 0.5 * d * td * td), v: Math.max(0, vPeak - d * td), done: false }
  }
  const tAcc = vmax / a
  const tDec = vmax / d
  const tCruise = total.t - tAcc - tDec
  if (t <= tAcc) return { s: 0.5 * a * t * t, v: a * t, done: false }
  if (t <= tAcc + tCruise) {
    const tc = t - tAcc
    return { s: sAcc + vmax * tc, v: vmax, done: false }
  }
  const td = t - tAcc - tCruise
  return { s: Math.min(distance, sAcc + vmax * tCruise + vmax * td - 0.5 * d * td * td), v: Math.max(0, vmax - d * td), done: false }
}

export function pointAlong(points: { x: number; y: number }[], s: number) {
  if (!points.length) return { x: 0, y: 0, theta: 0, i: 0 }
  if (points.length === 1) return { x: points[0].x, y: points[0].y, theta: 0, i: 0 }
  let left = Math.max(0, s)
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    const seg = Math.hypot(dx, dy)
    if (left <= seg || i === points.length - 1) {
      const u = seg > 0 ? Math.min(1, left / seg) : 0
      return { x: points[i - 1].x + dx * u, y: points[i - 1].y + dy * u, theta: Math.atan2(dy, dx), i: i - 1 }
    }
    left -= seg
  }
  const last = points[points.length - 1]
  const prev = points[points.length - 2]
  return { x: last.x, y: last.y, theta: Math.atan2(last.y - prev.y, last.x - prev.x), i: points.length - 2 }
}
