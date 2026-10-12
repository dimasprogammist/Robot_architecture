import { planAStar } from './astar'
import { createElement, syncLinkAnchors } from './catalog'
import { fliesOverObstacle, obstacleHit, pathCollisions, robotRadius } from './collision'
import { applyTemplate, commitPath, emptyMechanics, ensureMechanics, makeJoint, orderedWaypoints, removeElement } from './factory'
import { rotate, solvePoses, worldPoint, wouldCreateCycle } from './geometry'
import { diffDrive, forward2R, inverse2R, staticMoment, wheelLinearSpeed } from './kinematics'
import { massBreakdown } from './mass'
import { accelTime, linearAxisSpeed, motionAt, odometry, pathLength, pointAlong, stoppingDistance, travelTime, turnRadius, wheelsFromBody } from './motion'
import { blockedReason, stageList } from './stages'
import type { MechanicsModel } from './types'
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

  const constT = travelTime(1, 0.5, null, null)
  assert(constT.ok && Math.abs(constT.t - 2) < 1e-9 && constT.profile === 'const', 'const profile')
  const trap = travelTime(2, 1, 2, 2)
  assert(trap.ok && trap.profile === 'trap', 'trap profile')
  if (trap.ok) almost(trap.t, 1 / 2 + 1 / 2 + (2 - 0.25 - 0.25) / 1)
  const tri = travelTime(0.2, 1, 2, 2)
  assert(tri.ok && tri.profile === 'tri', 'tri profile')
  const noV = travelTime(1, null, 1, 1)
  assert(!noV.ok, 'time needs speed')

  const odo = odometry(0.05, 0.2, 1, 1)
  assert(odo.ok, 'odo ok')
  if (odo.ok) {
    almost(odo.ds, 0.05)
    almost(odo.dtheta, 0)
  }
  const spinO = odometry(0.05, 0.2, -1, 1)
  assert(spinO.ok && Math.abs(spinO.ds) < 1e-12, 'spin ds')
  if (spinO.ok) almost(spinO.dtheta, 0.5)

  const wf = wheelsFromBody(0.1, 0, 0.05, 0.2)
  assert(wf.ok, 'wheels')
  if (wf.ok) {
    almost(wf.omegaL, 2)
    almost(wf.omegaR, 2)
  }
  const R = turnRadius(0.2, 0.5)
  almost(R.R, 0.4)
  const lin = linearAxisSpeed(2 * Math.PI, 0.005)
  assert(lin.ok && Math.abs(lin.v - 0.005) < 1e-9, 'lead screw v = pitch per rev')

  almost(robotRadius(0.3, 0.4), 0.25)
  const wall = {
    id: 'o1',
    kind: 'line' as const,
    name: 'wall',
    x: 0.5,
    y: 0,
    x2: 0.5,
    y2: 1,
    width: 0,
    height: 0,
    theta: 0,
    thickness: 0.02,
  }
  const hit = pathCollisions(
    [
      { x: 0, y: 0.5 },
      { x: 1, y: 0.5 },
    ],
    [wall],
    0.08,
  )
  assert(hit?.obstacleId === 'o1', 'path hits wall')
  const missPath = pathCollisions(
    [
      { x: 0, y: 0.9 },
      { x: 0.2, y: 0.9 },
    ],
    [wall],
    0.02,
  )
  assert(!missPath, 'short path misses wall')

  const ws = { width: 2, height: 1.5, grid: 0.05 }
  const box = {
    id: 'box',
    kind: 'rect' as const,
    name: 'box',
    x: 1,
    y: 0.75,
    x2: 1,
    y2: 0.75,
    width: 0.4,
    height: 1.2,
    theta: 0,
    thickness: 0.02,
  }
  const blocked = planAStar(ws, [box], { x: 0.2, y: 0.75 }, { x: 1.8, y: 0.75 }, 0.1, 0.05)
  assert(!blocked.ok, 'A* reports no path through wall')
  const open = planAStar(ws, [], { x: 0.2, y: 0.2 }, { x: 1.6, y: 1.1 }, 0.05, 0.05)
  assert(open.ok && open.points.length > 2, 'A* finds path in empty map')
  if (open.ok) {
    const straight = Math.hypot(1.4, 0.9)
    assert(pathLength(open.points) + 1e-6 >= straight, 'A* not shorter than straight')
  }

  const old = ensureMechanics({ id: 'old', name: 'Манипулятор' } as MechanicsModel)
  assert(old.workspace.width > 0 && old.task === 'custom' && old.obstacles.length === 0, 'legacy merge')

  const plat = applyTemplate('diff')
  assert(plat.elements.some((e) => e.kind === 'chassis'), 'diff chassis')
  assert(plat.joints.length >= 4, 'diff joints')
  const wps = orderedWaypoints(plat)
  assert(wps && wps[0].role === 'start' && wps[wps.length - 1].role === 'goal', 'waypoints')
  const committed = commitPath(plat, wps!.map((w) => ({ x: w.x, y: w.y })), 'waypoints')
  assert(committed.path && committed.path.collision_obstacle_id, 'example obstacle blocks straight line')
  const stages = stageList(committed)
  assert(stages.some((s) => s.id === 'path' && s.status === 'error'), 'collision stage error')
  assert(blockedReason('plan', stageList({ ...plat, waypoints: [] })), 'plan blocked without points')
  const emptyMap = stageList({ ...plat, waypoints: [] })
  assert(emptyMap.find((s) => s.id === 'map')?.status === 'done', 'map ok without start/goal')
  assert(emptyMap.find((s) => s.id === 'path')?.status === 'needs_data', 'path waits for points')

  const armT = applyTemplate('arm2r')
  assert(armT.joints.filter((j) => j.kind === 'revolute').length === 2, '2R joints')
  const linT = applyTemplate('linear')
  assert(linT.joints.some((j) => j.kind === 'prismatic'), 'linear prismatic')
  assert(linT.elements.some((e) => e.kind === 'gearbox' && Number(e.params.pitch) > 0), 'pitch')
  assert(linT.elements.some((e) => e.mass == null && e.name === 'Нагрузка'), 'unknown load mass')

  const stop = stoppingDistance(2, 2)
  assert(stop.ok && Math.abs(stop.s - 1) < 1e-9, 'stop v^2/2d')
  const atime = accelTime(2, 2)
  assert(atime.ok && Math.abs(atime.t - 1) < 1e-9, 'accel v/a')
  const at = motionAt(2, 0.5, 1, 2, 2)
  almost(at.v, 1)
  almost(at.s, 0.25)
  const along = pointAlong([{ x: 0, y: 0 }, { x: 2, y: 0 }], 0.5)
  almost(along.x, 0.5)
  almost(along.theta, 0)

  const circle = {
    id: 'c1',
    kind: 'circle' as const,
    name: 'c',
    x: 1,
    y: 1,
    x2: 1,
    y2: 1,
    width: 0.4,
    height: 0.4,
    theta: 0,
    thickness: 0.02,
    z_height: 1,
  }
  assert(obstacleHit(circle, 1.1, 1, 0), 'inside circle')
  assert(!obstacleHit(circle, 1.4, 1, 0), 'outside circle')

  const d4 = applyTemplate('diff4')
  assert(d4.elements.filter((e) => e.kind === 'wheel').length === 4, '4 wheels')
  assert(d4.workspace.width === 6, 'real-scale map')
  const ch = d4.elements.find((e) => e.kind === 'chassis')!
  const obs = d4.obstacles[0]
  assert(obs.width / Number(ch.params.length) > 10, 'obstacle much larger than chassis')
  const ids = stageList(d4).map((s) => s.id)
  assert(ids.includes('mass') && ids.includes('map'), 'mobile stages')
  assert(stageList(armT).map((s) => s.id).join(',') === 'robot,mass,check', 'arm skips map')

  const drone = applyTemplate('drone')
  assert(drone.task === 'drone', 'drone task')
  assert(drone.elements.filter((e) => e.kind === 'motor').length === 4, 'quadrotor rotors')
  assert(drone.motion.altitude === 1.4, 'drone cruise altitude')
  const low = drone.obstacles.find((o) => o.name === 'Низкое препятствие')!
  const highWall = drone.obstacles.find((o) => o.name === 'Высокая стена')!
  assert(fliesOverObstacle(low, 1.4, 0.1), 'drone clears low obstacle')
  assert(!fliesOverObstacle(highWall, 1.4, 0.1), 'drone cannot clear wall')
  const inflateD = robotRadius(0.28, 0.28)
  const across = [
    { x: 0.5, y: 2 },
    { x: 5.2, y: 2 },
  ]
  const fly = pathCollisions(across, drone.obstacles, inflateD, { airborne: true, altitude: 1.4, bodyHeight: 0.1 })
  assert(fly && fly.reason === 'altitude' && fly.obstacleId === highWall.id, 'drone hits wall by altitude')
  const overLow = pathCollisions(
    [
      { x: 0.5, y: 2 },
      { x: 3.2, y: 2 },
    ],
    [low],
    inflateD,
    { airborne: true, altitude: 1.4, bodyHeight: 0.1 },
  )
  assert(!overLow, 'drone flies over low box')
  const ground = pathCollisions(
    [
      { x: 0.5, y: 2 },
      { x: 3.2, y: 2 },
    ],
    [low],
    inflateD,
  )
  assert(ground && ground.reason === 'plan', 'ground robot cannot fly over')

  const mb = massBreakdown(plat, [])
  assert(mb.known > 0, 'template masses')
  const oldMass = ensureMechanics({ id: 'x', name: 'old' })
  assert(Array.isArray(oldMass.included_component_ids), 'legacy included ids')
}

runMechanicsChecks()
console.log('mechanicsChecks: ok')
