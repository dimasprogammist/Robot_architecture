import { createElement, syncLinkAnchors } from './catalog'
import { emptyMechanics, makeJoint, removeElement } from './factory'
import { rotate, solvePoses, worldPoint, wouldCreateCycle } from './geometry'
import { diffDrive, forward2R, inverse2R, staticMoment, wheelLinearSpeed } from './kinematics'
import { mmToM, mToMm, PX_PER_M, screenToModel, modelToScreen } from './units'
import { createJointError, validateMechanics } from './validate'

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message)
}

function almost(a: number, b: number, eps = 1e-6) {
  assert(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`)
}

export function runMechanicsChecks() {
  const p = rotate(1, 0, Math.PI / 2)
  almost(p.x, 0, 1e-8)
  almost(p.y, 1, 1e-8)
  const w = worldPoint({ x: 1, y: 2, theta: 0 }, 0.1, 0)
  almost(w.x, 1.1)
  almost(w.y, 2)

  const link = createElement('link', 0, 0)
  link.params.length = 0.3
  const synced = syncLinkAnchors(link)
  almost(synced.anchors[1].x, 0.3)
  almost(Number(synced.params.cm_x), 0.15)

  let model = emptyMechanics()
  const base = createElement('base', 0, 0)
  const a = createElement('link', 0, 0)
  const b = createElement('link', 0.2, 0)
  a.params.length = 0.2
  b.params.length = 0.15
  Object.assign(a, syncLinkAnchors(a))
  Object.assign(b, syncLinkAnchors(b))
  model.elements = [base, a, b]
  assert(createJointError(model, a.id, a.id), 'self join blocked')
  const j1 = makeJoint('revolute', base.id, a.id, 'a', 'a')
  model.joints = [j1]
  assert(!createJointError(model, a.id, b.id), 'second joint ok')
  model.joints.push(makeJoint('revolute', a.id, b.id, 'b', 'a'))
  assert(wouldCreateCycle(model, b.id, base.id), 'cycle detected')
  const solved = solvePoses(model)
  assert(!solved.error, 'no cycle in tree')
  j1.q = Math.PI / 2
  const after = solvePoses(model).poses.get(a.id)!
  almost(after.theta, Math.PI / 2)

  const dropped = removeElement(model, a.id)
  assert(!dropped.joints.some((j) => j.parent_id === a.id || j.child_id === a.id), 'joints cleaned')

  const fk = forward2R(0.2, 0.15, 0, 0)
  almost(fk.x, 0.35)
  almost(fk.y, 0)
  const ik = inverse2R(0.2, 0.15, fk.x, fk.y, 'up')
  assert(ik.ok, 'ik reachable')
  if (ik.ok) {
    const back = forward2R(0.2, 0.15, ik.t1, ik.t2)
    almost(back.x, fk.x, 1e-6)
    almost(back.y, fk.y, 1e-6)
  }
  const miss = inverse2R(0.2, 0.15, 2, 0)
  assert(!miss.ok, 'ik unreachable')

  const straight = diffDrive(0.05, 2, 2, 0.2)
  almost(straight.v, 0.1)
  almost(straight.w, 0)
  const back = diffDrive(0.05, -2, -2, 0.2)
  almost(back.v, -0.1)
  const spin = diffDrive(0.05, -2, 2, 0.2)
  almost(spin.v, 0)
  almost(spin.w, 1)

  almost(wheelLinearSpeed(0.05, 2), 0.1)
  almost(mmToM(200), 0.2)
  almost(mToMm(0.2), 200)

  const pan = { x: 10, y: 20 }
  const scr = modelToScreen(0.1, 0.2, pan, 1)
  const backM = screenToModel(scr.x + 5, scr.y + 8, { left: 5, top: 8 }, pan, 1)
  almost(backM.x, 0.1, 1e-8)
  almost(backM.y, 0.2, 1e-8)
  const zoomed = screenToModel(scr.x + 5, scr.y + 8, { left: 5, top: 8 }, pan, 2)
  assert(Math.abs(zoomed.x - 0.1) > 0.01, 'zoom changes screen mapping only')
  almost(PX_PER_M, 400)

  const mom = staticMoment(2, 0.3)
  assert(mom.ok && Math.abs(mom.M - 2 * 9.80665 * 0.3) < 1e-9, 'static moment')

  const issues = validateMechanics(model)
  assert(Array.isArray(issues), 'issues list')
}

runMechanicsChecks()
console.log('mechanicsChecks: ok')
