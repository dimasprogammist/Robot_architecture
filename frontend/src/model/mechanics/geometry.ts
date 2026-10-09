import type { MechAnchor, MechElement, MechJoint, MechPose, MechanicsModel } from './types'

export function rotate(x: number, y: number, theta: number) {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  return { x: c * x - s * y, y: s * x + c * y }
}

export function worldPoint(pose: MechPose, lx: number, ly: number): { x: number; y: number } {
  const r = rotate(lx, ly, pose.theta)
  return { x: pose.x + r.x, y: pose.y + r.y }
}

export function distance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(bx - ax, by - ay)
}

export function clampJoint(joint: MechJoint, q = joint.q) {
  let next = q
  if (joint.q_min != null && next < joint.q_min) next = joint.q_min
  if (joint.q_max != null && next > joint.q_max) next = joint.q_max
  return next
}

export function findAnchor(element: MechElement, id: string): MechAnchor | undefined {
  return element.anchors.find((a) => a.id === id) || element.anchors[0]
}

export function wouldCreateCycle(model: MechanicsModel, parentId: string, childId: string) {
  if (parentId === childId) return true
  const children = new Map<string, string[]>()
  for (const joint of model.joints) {
    const list = children.get(joint.parent_id) || []
    list.push(joint.child_id)
    children.set(joint.parent_id, list)
  }
  const pending = [...(children.get(childId) || [])]
  const seen = new Set<string>()
  while (pending.length) {
    const id = pending.pop()!
    if (id === parentId) return true
    if (seen.has(id)) continue
    seen.add(id)
    pending.push(...(children.get(id) || []))
  }
  return false
}

export function incomingJoint(model: MechanicsModel, elementId: string) {
  return model.joints.find((j) => j.child_id === elementId)
}

export function solvePoses(model: MechanicsModel): { poses: Map<string, MechPose>; error?: string } {
  const byId = new Map(model.elements.map((el) => [el.id, el]))
  const poses = new Map<string, MechPose>()
  const children = new Map<string, MechJoint[]>()
  const incoming = new Set<string>()
  for (const joint of model.joints) {
    if (!byId.has(joint.parent_id) || !byId.has(joint.child_id)) continue
    incoming.add(joint.child_id)
    const list = children.get(joint.parent_id) || []
    list.push(joint)
    children.set(joint.parent_id, list)
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()
  let cycle = false

  const placeChild = (parent: MechPose, joint: MechJoint, child: MechElement): MechPose => {
    const pe = byId.get(joint.parent_id)!
    const pa = findAnchor(pe, joint.parent_anchor) || { id: 'a', name: 'A', x: 0, y: 0 }
    const ca = findAnchor(child, joint.child_anchor) || { id: 'a', name: 'A', x: 0, y: 0 }
    const origin = worldPoint(parent, pa.x, pa.y)
    const q = clampJoint(joint)
    let theta = parent.theta
    let px = origin.x
    let py = origin.y
    if (joint.kind === 'revolute') {
      theta = parent.theta + q
    } else if (joint.kind === 'prismatic') {
      const axis = rotate(1, 0, parent.theta)
      px += axis.x * q
      py += axis.y * q
    }
    const offset = rotate(ca.x, ca.y, theta)
    return { x: px - offset.x, y: py - offset.y, theta }
  }

  const visit = (id: string, pose: MechPose) => {
    if (visiting.has(id)) {
      cycle = true
      return
    }
    visiting.add(id)
    poses.set(id, pose)
    for (const joint of children.get(id) || []) {
      const child = byId.get(joint.child_id)
      if (!child) continue
      visit(joint.child_id, placeChild(pose, joint, child))
    }
    visiting.delete(id)
    visited.add(id)
  }

  for (const el of model.elements) {
    if (!incoming.has(el.id)) visit(el.id, { x: el.x, y: el.y, theta: el.theta })
  }
  for (const el of model.elements) {
    if (!poses.has(el.id)) visit(el.id, { x: el.x, y: el.y, theta: el.theta })
  }

  if (cycle) return { poses, error: 'Модель содержит цикл, который решатель первой версии не поддерживает.' }
  return { poses }
}

export function distalPoint(element: MechElement, pose: MechPose) {
  const b = element.anchors.find((a) => a.id === 'b') || element.anchors[element.anchors.length - 1]
  if (!b) return { x: pose.x, y: pose.y }
  return worldPoint(pose, b.x, b.y)
}

export function linkLength(element: MechElement) {
  const n = Number(element.params.length)
  if (Number.isFinite(n) && n > 0) return n
  if (element.anchors.length >= 2) {
    const a = element.anchors[0]
    const b = element.anchors[1]
    return Math.hypot(b.x - a.x, b.y - a.y)
  }
  return 0
}

export function numParam(element: MechElement, key: string, fallback = 0) {
  const n = Number(element.params[key])
  return Number.isFinite(n) ? n : fallback
}
