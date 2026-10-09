import { uid } from '../../lib/ids'
import type { MechanicsModel, MechJoint, MechJointKind } from './types'

export function emptyMechanics(): MechanicsModel {
  return {
    id: uid(),
    name: 'Механизм',
    elements: [],
    joints: [],
    ee_id: null,
    elbow: 'up',
    trail: [],
    trail_on: false,
    load_mass: null,
    load_lever: null,
    show_axes: true,
    show_dims: true,
  }
}

export function ensureMechanics(raw: MechanicsModel | null | undefined): MechanicsModel {
  const base = emptyMechanics()
  if (!raw) return base
  return {
    ...base,
    ...raw,
    id: raw.id || base.id,
    name: raw.name || base.name,
    elements: Array.isArray(raw.elements) ? raw.elements : [],
    joints: Array.isArray(raw.joints) ? raw.joints : [],
    trail: Array.isArray(raw.trail) ? raw.trail : [],
  }
}

export function makeJoint(
  kind: MechJointKind,
  parentId: string,
  childId: string,
  parentAnchor: string,
  childAnchor: string,
): MechJoint {
  const revolute = kind === 'revolute'
  return {
    id: uid(),
    kind,
    parent_id: parentId,
    child_id: childId,
    parent_anchor: parentAnchor,
    child_anchor: childAnchor,
    q: 0,
    q_min: revolute ? -Math.PI : kind === 'prismatic' ? 0 : null,
    q_max: revolute ? Math.PI : kind === 'prismatic' ? 0.2 : null,
    driven: kind !== 'fixed',
    motor_id: null,
  }
}

export function removeElement(model: MechanicsModel, id: string): MechanicsModel {
  return {
    ...model,
    elements: model.elements.filter((e) => e.id !== id),
    joints: model.joints.filter((j) => j.parent_id !== id && j.child_id !== id && j.id !== id && j.motor_id !== id),
    ee_id: model.ee_id === id ? null : model.ee_id,
  }
}
