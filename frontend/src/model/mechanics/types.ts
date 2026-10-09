export type MechKind =
  | 'base'
  | 'link'
  | 'wheel'
  | 'caster'
  | 'motor'
  | 'gearbox'
  | 'gripper'
  | 'chassis'

export type MechJointKind = 'fixed' | 'revolute' | 'prismatic'

export type MechMode = 'constructor' | 'kinematics' | 'calc'

export interface MechAnchor {
  id: string
  name: string
  x: number
  y: number
}

export interface MechPose {
  x: number
  y: number
  theta: number
}

export interface MechElement {
  id: string
  kind: MechKind
  name: string
  x: number
  y: number
  theta: number
  mass: number | null
  catalog_component_id: string | null
  params: Record<string, number | string | boolean | null>
  anchors: MechAnchor[]
}

export interface MechJoint {
  id: string
  kind: MechJointKind
  parent_id: string
  child_id: string
  parent_anchor: string
  child_anchor: string
  q: number
  q_min: number | null
  q_max: number | null
  driven: boolean
  motor_id: string | null
}

export interface MechTrailPoint {
  x: number
  y: number
}

export interface MechanicsModel {
  id: string
  name: string
  elements: MechElement[]
  joints: MechJoint[]
  ee_id: string | null
  elbow: 'up' | 'down'
  trail: MechTrailPoint[]
  trail_on: boolean
  load_mass: number | null
  load_lever: number | null
  show_axes: boolean
  show_dims: boolean
}

export type MechIssueLevel = 'error' | 'warning'

export interface MechIssue {
  level: MechIssueLevel
  code: string
  message: string
  element_id?: string
  joint_id?: string
}
