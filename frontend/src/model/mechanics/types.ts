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

export type KinTaskKind = 'diff' | 'diff4' | 'linear' | 'arm2r' | 'custom' | 'drone'

export type KinStageId = 'robot' | 'mass' | 'map' | 'path' | 'motion' | 'check'

export type KinStageStatus = 'idle' | 'needs_data' | 'ready' | 'done' | 'stale' | 'error'

export type MechCanvasTool = 'select' | 'line' | 'rect' | 'circle' | 'start' | 'goal' | 'via'

export interface MechObstacle {
  id: string
  kind: 'line' | 'rect' | 'circle'
  name: string
  x: number
  y: number
  x2: number
  y2: number
  width: number
  height: number
  theta: number
  thickness: number
  /** Vertical size of the obstacle, metres. Independent of 2D `height`. */
  z_height?: number
}

export interface MechWaypoint {
  id: string
  role: 'start' | 'goal' | 'via'
  x: number
  y: number
  theta: number
}

export interface MechPath {
  points: { x: number; y: number }[]
  source: 'waypoints' | 'astar'
  stale: boolean
  collision_obstacle_id: string | null
  collision_index: number | null
  length: number | null
}

export interface MechMotion {
  v: number | null
  w: number | null
  acc: number | null
  dec: number | null
  v_max: number | null
  w_max: number | null
  stale: boolean
  /** Cruise altitude for aerial models, metres above the map plane. */
  altitude: number | null
}

export interface MechWorkspace {
  width: number
  height: number
  grid: number
}

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
  task: KinTaskKind
  workspace: MechWorkspace
  obstacles: MechObstacle[]
  waypoints: MechWaypoint[]
  path: MechPath | null
  motion: MechMotion
  encoder_left: number | null
  encoder_right: number | null
  included_component_ids: string[]
}

export type MechIssueLevel = 'error' | 'warning'

export interface MechIssue {
  level: MechIssueLevel
  code: string
  message: string
  element_id?: string
  joint_id?: string
}
