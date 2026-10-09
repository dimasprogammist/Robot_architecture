import { distalPoint, linkLength, numParam } from './geometry'
import { G, rpmToRadS } from './units'
import type { MechElement, MechIssue, MechanicsModel, MechPose } from './types'

export function forward2R(l1: number, l2: number, t1: number, t2: number) {
  return {
    x: l1 * Math.cos(t1) + l2 * Math.cos(t1 + t2),
    y: l1 * Math.sin(t1) + l2 * Math.sin(t1 + t2),
  }
}

export function inverse2R(
  l1: number,
  l2: number,
  x: number,
  y: number,
  elbow: 'up' | 'down' = 'up',
): { ok: true; t1: number; t2: number } | { ok: false; reason: string } {
  const r2 = x * x + y * y
  const r = Math.sqrt(r2)
  const reach = l1 + l2
  const min = Math.abs(l1 - l2)
  if (r > reach + 1e-9) return { ok: false, reason: 'Точка вне достижимой области (слишком далеко).' }
  if (r < min - 1e-9) return { ok: false, reason: 'Точка вне достижимой области (слишком близко).' }
  let c2 = (r2 - l1 * l1 - l2 * l2) / (2 * l1 * l2)
  c2 = Math.min(1, Math.max(-1, c2))
  const s2 = Math.sqrt(Math.max(0, 1 - c2 * c2)) * (elbow === 'up' ? 1 : -1)
  const t2 = Math.atan2(s2, c2)
  const k1 = l1 + l2 * c2
  const k2 = l2 * s2
  const t1 = Math.atan2(y, x) - Math.atan2(k2, k1)
  return { ok: true, t1, t2 }
}

export function diffDrive(r: number, omegaL: number, omegaR: number, track: number) {
  if (!(track > 0) || !(r > 0)) {
    return { v: 0, w: 0, ok: false as const, reason: 'Нужны положительные радиус колеса и колея.' }
  }
  return {
    v: (r * (omegaR + omegaL)) / 2,
    w: (r * (omegaR - omegaL)) / track,
    ok: true as const,
  }
}

export function wheelLinearSpeed(radius: number, omega: number) {
  return radius * omega
}

export function gearboxOutput(omegaIn: number, ratio: number, efficiency = 1) {
  const outW = ratio === 0 ? 0 : omegaIn / ratio
  return { omega: outW, note: 'Момент на выходе при идеальной передаче равен входу·i·η. КПД учитывается только как оговорка, без динамики.' , efficiency }
}

export function staticMoment(mass: number | null, lever: number | null) {
  if (mass == null || !Number.isFinite(mass) || mass < 0) {
    return { ok: false as const, missing: 'масса груза' }
  }
  if (lever == null || !Number.isFinite(lever) || lever < 0) {
    return { ok: false as const, missing: 'плечо силы' }
  }
  return { ok: true as const, M: mass * G * lever, g: G }
}

export function findSerial2R(model: MechanicsModel, poses: Map<string, MechPose>) {
  const revolute = model.joints.filter((j) => j.kind === 'revolute')
  for (const j1 of revolute) {
    const j2 = revolute.find((j) => j.parent_id === j1.child_id)
    if (!j2) continue
    const link1 = model.elements.find((e) => e.id === j1.child_id)
    const link2 = model.elements.find((e) => e.id === j2.child_id)
    if (!link1 || !link2) continue
    const l1 = linkLength(link1)
    const l2 = linkLength(link2)
    if (!(l1 > 0 && l2 > 0)) continue
    const base = poses.get(j1.parent_id)
    const p1 = poses.get(link1.id)
    const p2 = poses.get(link2.id)
    if (!base || !p1 || !p2) continue
    const ee = distalPoint(link2, p2)
    const local = {
      x: (ee.x - base.x) * Math.cos(-base.theta) - (ee.y - base.y) * Math.sin(-base.theta),
      y: (ee.x - base.x) * Math.sin(-base.theta) + (ee.y - base.y) * Math.cos(-base.theta),
    }
    return { j1, j2, link1, link2, l1, l2, base, ee, local, t1: j1.q, t2: j2.q }
  }
  return null
}

export function findDiffPlatform(model: MechanicsModel, poses: Map<string, MechPose>) {
  const chassis = model.elements.find((e) => e.kind === 'chassis')
  const wheels = model.elements.filter((e) => e.kind === 'wheel')
  if (!chassis || wheels.length < 2) return null
  const left = wheels.find((w) => w.params.side === 'left') || wheels[0]
  const right = wheels.find((w) => w.params.side === 'right') || wheels[1]
  const r = (numParam(left, 'radius', 0.04) + numParam(right, 'radius', 0.04)) / 2
  const lp = poses.get(left.id)
  const rp = poses.get(right.id)
  const track =
    numParam(chassis, 'track', 0) ||
    (lp && rp ? Math.hypot(rp.x - lp.x, rp.y - lp.y) : 0.18)
  const wL = numParam(left, 'omega')
  const wR = numParam(right, 'omega')
  const motion = diffDrive(r, wL, wR, track)
  return { chassis, left, right, r, track, wL, wR, motion, pose: poses.get(chassis.id) }
}

export function applyCatalogHints(element: MechElement, extra: Record<string, string>, weight?: string) {
  const next = { ...element, params: { ...element.params } }
  const mass = Number.parseFloat(String(weight || '').replace(',', '.'))
  if (Number.isFinite(mass) && mass > 0) next.mass = mass
  const rpm = Number.parseFloat(String(extra.rpm || extra.rated_rpm || '').replace(',', '.'))
  if (element.kind === 'motor' && Number.isFinite(rpm)) next.params.omega_nom = rpmToRadS(rpm)
  const ratio = Number.parseFloat(String(extra.ratio || extra.gear_ratio || '').replace(',', '.'))
  if (element.kind === 'gearbox' && Number.isFinite(ratio) && ratio !== 0) next.params.ratio = ratio
  return next
}

export function workspaceReach(l1: number, l2: number) {
  return { max: l1 + l2, min: Math.abs(l1 - l2) }
}

export function issuesToCalc(issues: MechIssue[]) {
  return issues.filter((i) => i.level === 'error')
}
