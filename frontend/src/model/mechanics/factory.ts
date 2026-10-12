import { uid } from '../../lib/ids'
import { createElement } from './catalog'
import { pathCollisions } from './collision'
import { pathLength } from './motion'
import { flightParams, robotInflate } from './stages'
import type { KinTaskKind, MechanicsModel, MechJoint, MechJointKind, MechMotion, MechPath, MechWorkspace } from './types'

export function defaultWorkspace(): MechWorkspace {
  return { width: 2, height: 1.5, grid: 0.05 }
}

export function defaultMotion(): MechMotion {
  return { v: 0.2, w: 0, acc: 0.4, dec: 0.4, v_max: 0.3, w_max: 1.2, stale: false, altitude: null }
}

export function emptyMechanics(): MechanicsModel {
  return {
    id: uid(),
    name: 'Кинематика',
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
    task: 'custom',
    workspace: defaultWorkspace(),
    obstacles: [],
    waypoints: [],
    path: null,
    motion: defaultMotion(),
    encoder_left: null,
    encoder_right: null,
    included_component_ids: [],
  }
}

export function ensureMechanics(raw: unknown): MechanicsModel {
  const base = emptyMechanics()
  if (!raw || typeof raw !== 'object') return base
  const src = raw as Partial<MechanicsModel>
  return {
    ...base,
    ...src,
    id: src.id || base.id,
    name: src.name || base.name,
    elements: Array.isArray(src.elements) ? src.elements : [],
    joints: Array.isArray(src.joints) ? src.joints : [],
    trail: Array.isArray(src.trail) ? src.trail : [],
    task: src.task || 'custom',
    workspace: { ...base.workspace, ...(src.workspace || {}) },
    obstacles: Array.isArray(src.obstacles)
      ? src.obstacles.map((o) => ({
          ...o,
          z_height: typeof o.z_height === 'number' && o.z_height >= 0 ? o.z_height : 1,
        }))
      : [],
    waypoints: Array.isArray(src.waypoints) ? src.waypoints : [],
    path: src.path ?? null,
    motion: { ...base.motion, ...(src.motion || {}) },
    encoder_left: src.encoder_left ?? null,
    encoder_right: src.encoder_right ?? null,
    included_component_ids: Array.isArray(src.included_component_ids) ? src.included_component_ids : [],
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
    obstacles: model.obstacles.filter((o) => o.id !== id),
    waypoints: model.waypoints.filter((w) => w.id !== id),
    ee_id: model.ee_id === id ? null : model.ee_id,
    path: model.path ? { ...model.path, stale: true } : model.path,
  }
}

export function markPathStale(model: MechanicsModel): MechanicsModel {
  if (!model.path) return { ...model, motion: { ...model.motion, stale: true } }
  return { ...model, path: { ...model.path, stale: true }, motion: { ...model.motion, stale: true } }
}

export function orderedWaypoints(model: MechanicsModel) {
  const start = model.waypoints.find((w) => w.role === 'start')
  const goal = model.waypoints.find((w) => w.role === 'goal')
  const vias = model.waypoints.filter((w) => w.role === 'via')
  if (!start || !goal) return null
  return [start, ...vias, goal]
}

export function commitPath(
  model: MechanicsModel,
  points: { x: number; y: number }[],
  source: MechPath['source'],
): MechanicsModel {
  const hit = pathCollisions(points, model.obstacles, robotInflate(model), flightParams(model))
  return {
    ...model,
    path: {
      points,
      source,
      stale: false,
      collision_obstacle_id: hit?.obstacleId ?? null,
      collision_index: hit?.index ?? null,
      length: pathLength(points),
    },
    motion: { ...model.motion, stale: true },
  }
}

function fixed(parent: string, child: string, pa: string, ca: string) {
  return makeJoint('fixed', parent, child, pa, ca)
}

export function applyTemplate(kind: KinTaskKind): MechanicsModel {
  const model = emptyMechanics()
  model.task = kind
  model.name =
    kind === 'diff'
      ? 'Двухколёсный дифференциальный (пример)'
      : kind === 'diff4'
        ? 'Четырёхколёсная платформа (пример)'
        : kind === 'linear'
          ? 'Линейная ось (пример)'
          : kind === 'arm2r'
            ? 'Двухзвенник (пример)'
            : model.name
  if (kind === 'diff' || kind === 'diff4') {
    const chassis = createElement('chassis', 0.4, 0.4)
    chassis.params.length = 0.24
    chassis.params.width = 0.16
    chassis.params.track = kind === 'diff4' ? 0.22 : 0.18
    chassis.params.drive = kind === 'diff4' ? 'skid' : 'diff'
    chassis.mass = kind === 'diff4' ? 4 : 2
    model.workspace = { width: 6, height: 4, grid: 0.2 }
    const left = createElement('wheel', 0.4, 0.49)
    left.params.side = 'left'
    left.params.radius = 0.04
    left.params.omega = 2
    left.mass = 0.15
    left.name = 'Левое колесо'
    const right = createElement('wheel', 0.4, 0.31)
    right.params.side = 'right'
    right.params.radius = 0.04
    right.params.omega = 2
    right.mass = 0.15
    right.name = 'Правое колесо'
    const mL = createElement('motor', 0.4, 0.55)
    mL.name = 'Левый привод'
    mL.mass = 0.2
    const mR = createElement('motor', 0.4, 0.25)
    mR.name = 'Правый привод'
    mR.mass = 0.2
    if (kind === 'diff4') {
      chassis.params.length = 0.32
      chassis.params.width = 0.28
      chassis.mass = 4
      const rl = createElement('wheel', 0.28, 0.49)
      rl.params.side = 'left'
      rl.params.radius = 0.04
      rl.mass = 0.15
      rl.name = 'Левое заднее'
      const rr = createElement('wheel', 0.28, 0.31)
      rr.params.side = 'right'
      rr.params.radius = 0.04
      rr.mass = 0.15
      rr.name = 'Правое заднее'
      left.name = 'Левое переднее'
      right.name = 'Правое переднее'
      model.elements = [chassis, left, right, rl, rr, mL, mR]
      model.joints = [
        fixed(chassis.id, left.id, 'wl', 'a'),
        fixed(chassis.id, right.id, 'wr', 'a'),
        fixed(chassis.id, rl.id, 'rear', 'a'),
        fixed(chassis.id, rr.id, 'c', 'a'),
        fixed(left.id, mL.id, 'a', 'a'),
        fixed(right.id, mR.id, 'a', 'a'),
      ]
    } else {
      const caster = createElement('caster', 0.28, 0.4)
      caster.mass = 0.05
      model.elements = [chassis, left, right, caster, mL, mR]
      model.joints = [
        fixed(chassis.id, left.id, 'wl', 'a'),
        fixed(chassis.id, right.id, 'wr', 'a'),
        fixed(chassis.id, caster.id, 'rear', 'a'),
        fixed(left.id, mL.id, 'a', 'a'),
        fixed(right.id, mR.id, 'a', 'a'),
      ]
    }
    chassis.params.length = kind === 'diff4' ? 0.32 : 0.2
    chassis.params.width = kind === 'diff4' ? 0.28 : 0.16
    model.waypoints = [
      { id: uid(), role: 'start', x: 0.4, y: 0.5, theta: 0 },
      { id: uid(), role: 'goal', x: 5.4, y: 3.2, theta: 0 },
    ]
    model.obstacles = [
      {
        id: uid(),
        kind: 'rect',
        name: 'Препятствие 5 м',
        x: 3,
        y: 2,
        x2: 3,
        y2: 2,
        width: 5,
        height: 0.8,
        theta: 0,
        thickness: 0.02,
        z_height: 1,
      },
    ]
  }
  if (kind === 'linear') {
    const base = createElement('base', 0.2, 0.4)
    base.mass = 8
    const motor = createElement('motor', 0.12, 0.4)
    motor.mass = 1.2
    const gear = createElement('gearbox', 0.12, 0.32)
    gear.params.ratio = 10
    gear.params.pitch = 0.005
    gear.mass = 0.8
    const rail = createElement('link', 0.2, 0.4)
    rail.params.length = 0.4
    rail.name = 'Направляющая'
    rail.mass = 2
    const carriage = createElement('gripper', 0.35, 0.4)
    carriage.name = 'Каретка'
    carriage.mass = 0.5
    const load = createElement('base', 0.4, 0.4)
    load.name = 'Нагрузка'
    load.mass = null
    model.elements = [base, motor, gear, rail, carriage, load]
    model.joints = [
      fixed(base.id, rail.id, 'a', 'a'),
      fixed(base.id, motor.id, 'a', 'a'),
      fixed(motor.id, gear.id, 'a', 'a'),
      makeJoint('prismatic', rail.id, carriage.id, 'a', 'a'),
      fixed(carriage.id, load.id, 'a', 'a'),
    ]
  }
  if (kind === 'arm2r') {
    const base = createElement('base', 0.2, 0.2)
    base.mass = 1
    const l1 = createElement('link', 0.2, 0.2)
    l1.params.length = 0.25
    l1.name = 'Звено 1'
    l1.mass = 0.4
    const l2 = createElement('link', 0.45, 0.2)
    l2.params.length = 0.2
    l2.name = 'Звено 2'
    l2.mass = 0.3
    const tool = createElement('gripper', 0.65, 0.2)
    tool.name = 'Инструмент'
    tool.mass = null
    model.elements = [base, l1, l2, tool]
    model.joints = [
      makeJoint('revolute', base.id, l1.id, 'a', 'a'),
      makeJoint('revolute', l1.id, l2.id, 'b', 'a'),
      fixed(l2.id, tool.id, 'b', 'a'),
    ]
    model.ee_id = tool.id
  }
  if (kind === 'drone') {
    model.name = 'Дрон (квадрокоптер, упрощённо)'
    model.workspace = { width: 6, height: 4, grid: 0.2 }
    model.motion = { ...defaultMotion(), v_max: 0.8, acc: 0.6, dec: 0.6, altitude: 1.4 }
    const body = createElement('chassis', 0.5, 0.5)
    body.name = 'Рама дрона'
    body.params.length = 0.28
    body.params.width = 0.28
    body.params.airframe = 'quadrotor'
    body.params.altitude = 1.4
    body.params.body_height = 0.1
    body.mass = 0.9
    const rotors = [
      createElement('motor', 0.62, 0.62),
      createElement('motor', 0.38, 0.62),
      createElement('motor', 0.38, 0.38),
      createElement('motor', 0.62, 0.38),
    ]
    rotors.forEach((r, i) => {
      r.name = `Ротор ${i + 1}`
      r.mass = 0.05
      r.params.omega = 4
    })
    model.elements = [body, ...rotors]
    model.joints = [
      fixed(body.id, rotors[0].id, 'wr', 'a'),
      fixed(body.id, rotors[1].id, 'wl', 'a'),
      fixed(body.id, rotors[2].id, 'rear', 'a'),
      fixed(body.id, rotors[3].id, 'c', 'a'),
    ]
    model.waypoints = [
      { id: uid(), role: 'start', x: 0.5, y: 0.5, theta: 0 },
      { id: uid(), role: 'goal', x: 5.2, y: 3.2, theta: 0 },
    ]
    model.obstacles = [
      {
        id: uid(),
        kind: 'rect',
        name: 'Низкое препятствие',
        x: 2.4,
        y: 2,
        x2: 2.4,
        y2: 2,
        width: 0.8,
        height: 0.8,
        theta: 0,
        thickness: 0.02,
        z_height: 0.4,
      },
      {
        id: uid(),
        kind: 'rect',
        name: 'Высокая стена',
        x: 4,
        y: 2,
        x2: 4,
        y2: 2,
        width: 0.4,
        height: 2.4,
        theta: 0,
        thickness: 0.02,
        z_height: 2.2,
      },
    ]
  }
  return model
}
