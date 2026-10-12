import { findDiffPlatform, findSerial2R } from './kinematics'
import { numParam, solvePoses } from './geometry'
import { pathCollisions, robotRadius } from './collision'
import { pathLength, travelTime } from './motion'
import type { KinStageId, KinStageStatus, MechanicsModel } from './types'

export interface KinStage {
  id: KinStageId
  title: string
  purpose: string
  result: string
  status: KinStageStatus
  detail: string
}

function chassisSize(model: MechanicsModel) {
  const ch = model.elements.find((e) => e.kind === 'chassis')
  if (!ch) return null
  return { L: numParam(ch, 'length', 0.24), W: numParam(ch, 'width', 0.16) }
}

export function robotInflate(model: MechanicsModel) {
  const size = chassisSize(model)
  return size ? robotRadius(size.L, size.W) : 0.08
}

export function flightParams(model: MechanicsModel): { airborne: boolean; altitude: number; bodyHeight: number } | null {
  if (model.task !== 'drone') return null
  const ch = model.elements.find((e) => e.kind === 'chassis')
  const altitude = model.motion.altitude ?? (ch ? numParam(ch, 'altitude', 1.2) : 1.2)
  const bodyHeight = ch ? numParam(ch, 'body_height', 0.12) : 0.12
  return { airborne: true, altitude, bodyHeight }
}

export function stageList(model: MechanicsModel): KinStage[] {
  const task = model.task
  const { poses } = solvePoses(model)
  const plat = findDiffPlatform(model, poses)
  const arm = findSerial2R(model, poses)
  const start = model.waypoints.find((w) => w.role === 'start')
  const goal = model.waypoints.find((w) => w.role === 'goal')
  const hasMap = model.workspace.width > 0 && model.workspace.height > 0
  const inflate = robotInflate(model)
  const collision = model.path?.points.length
    ? pathCollisions(model.path.points, model.obstacles, inflate, flightParams(model))
    : null

  const robot: KinStage = {
    id: 'robot',
    title: 'Параметры робота',
    purpose: 'Задать кинематическую модель и геометрию, нужные выбранному расчёту.',
    result: 'Модель, пригодная для выбранных расчётов.',
    status: 'needs_data',
    detail: '',
  }
  if (task === 'drone') {
    if (plat?.motion.ok || model.elements.some((e) => e.kind === 'chassis')) {
      robot.status = 'done'
      robot.detail = 'Квадрокоптер: корпус и роторы. 2.5D модель высоты, не аэродинамика.'
    } else {
      robot.detail = 'Нужны корпус дрона и роторы. Это упрощённая модель, не полётная динамика.'
    }
  } else if (task === 'diff' || task === 'diff4') {
    if (plat?.motion.ok) {
      robot.status = 'done'
      robot.detail = 'Дифференциальная платформа: корпус и два ведущих колеса заданы.'
    } else {
      robot.detail = plat?.motion.reason || 'Нужны корпус и левое/правое колёса с положительным радиусом и колеёй.'
    }
  } else if (task === 'arm2r') {
    if (arm) {
      robot.status = 'done'
      robot.detail = 'Собрана цепочка двух вращательных шарниров.'
    } else robot.detail = 'Соберите основание → шарнир → звено → шарнир → звено.'
  } else if (task === 'linear') {
    const prism = model.joints.find((j) => j.kind === 'prismatic')
    if (prism) {
      robot.status = 'done'
      robot.detail = 'Есть поступательное соединение.'
    } else robot.detail = 'Добавьте линейную ось между основанием и кареткой.'
  } else {
    robot.status = model.elements.length ? 'done' : 'idle'
    robot.detail = model.elements.length ? 'Произвольная модель. Этапы карты доступны для мобильной платформы.' : 'Добавьте элементы или выберите заготовку.'
  }

  const map: KinStage = {
    id: 'map',
    title: 'Рабочая область и препятствия',
    purpose: 'Задать карту, стены, старт и цель.',
    result: 'Карта, относительно которой проверяется маршрут.',
    status: 'idle',
    detail: '',
  }
  if (task === 'arm2r') {
    map.status = 'idle'
    map.detail = 'Для манипулятора карта необязательна: рабочая область — плоскость механизма.'
  } else if (!hasMap) {
    map.status = 'needs_data'
    map.detail = 'Задайте размеры рабочей области.'
  } else {
    map.status = 'done'
    map.detail = model.obstacles.length
      ? `Область ${model.workspace.width}×${model.workspace.height} м, препятствий: ${model.obstacles.length}.`
      : `Область ${model.workspace.width}×${model.workspace.height} м. Препятствий нет — проверка пойдёт по пустой карте.`
  }

  const path: KinStage = {
    id: 'path',
    title: 'Траектория',
    purpose: 'Построить геометрический путь между точками.',
    result: 'Ломаная в координатах карты.',
    status: 'idle',
    detail: '',
  }
  if (task === 'arm2r') {
    path.status = arm ? 'done' : 'needs_data'
    path.detail = arm ? 'Путь рабочего органа задаётся углами шарниров, не сеткой карты.' : 'Нет двухзвенной модели.'
  } else if (map.status !== 'done') {
    path.status = 'needs_data'
    path.detail = map.detail
  } else if (!start || !goal) {
    path.status = 'needs_data'
    path.detail = 'Укажите начальную точку и цель.'
  } else if (!model.path || model.path.points.length < 2) {
    path.status = 'ready'
    path.detail = 'Можно построить ломаную по точкам или поиск A* с обходом препятствий.'
  } else if (model.path.stale) {
    path.status = 'stale'
    path.detail = 'Параметры робота или карта изменились. Пересчитайте траекторию.'
  } else if (collision) {
    path.status = 'error'
    path.detail =
      collision.reason === 'altitude'
        ? 'Недостаточная высота пролёта: нижняя точка дрона ниже вершины препятствия с учётом зазора.'
        : 'Путь пересекает препятствие с учётом габарита (окружность по диагонали корпуса).'
  } else {
    path.status = 'done'
    path.detail = `Длина ${((model.path.length ?? pathLength(model.path.points)) * 1000).toFixed(0)} мм. Источник: ${model.path.source === 'astar' ? 'A*' : 'точки маршрута'}.`
  }

  const motion: KinStage = {
    id: 'motion',
    title: 'Параметры движения',
    purpose: 'Задать скорости и ускорения для оценки времени.',
    result: 'Расчётный профиль движения, не физическая симуляция.',
    status: 'idle',
    detail: '',
  }
  const prism = model.joints.find((j) => j.kind === 'prismatic')
  const stroke = prism ? Math.abs((prism.q_max ?? 0) - (prism.q_min ?? 0)) : 0
  const len =
    task === 'linear'
      ? stroke
      : model.path && !model.path.stale && model.path.points.length > 1
        ? pathLength(model.path.points)
        : null
  const t = len != null ? travelTime(len, model.motion.v_max ?? model.motion.v, model.motion.acc, model.motion.dec) : null
  if (task === 'arm2r') {
    motion.status = 'idle'
    motion.detail = 'Для манипулятора используйте углы шарниров в режиме кинематики.'
  } else if (task === 'linear' && !prism) {
    motion.status = 'needs_data'
    motion.detail = 'Нет поступательного соединения для расчёта хода.'
  } else if (task !== 'linear' && path.status !== 'done') {
    motion.status = 'needs_data'
    motion.detail = path.detail
  } else if (!t || !t.ok) {
    motion.status = 'needs_data'
    motion.detail = t && !t.ok ? t.reason : 'Задайте допустимую линейную скорость.'
  } else if (model.motion.stale) {
    motion.status = 'stale'
    motion.detail = 'Оценка времени не подтверждена после изменения пути или скоростей.'
  } else {
    motion.status = 'done'
    motion.detail = `Профиль «${t.profile}», t = ${t.t.toFixed(2)} с.`
  }

  const check: KinStage = {
    id: 'check',
    title: 'Проверка',
    purpose: 'Свести столкновения, полноту данных и ограничения.',
    result: 'Отчёт: ошибки блокируют расчёт, предупреждения — нет.',
    status: 'idle',
    detail: '',
  }
  const blockers = (
    task === 'linear' ? [robot, motion] : task === 'arm2r' ? [robot] : [robot, map, path, motion]
  ).filter((s) => s.status === 'error' || s.status === 'needs_data')
  if (collision) {
    check.status = 'error'
    check.detail =
      collision.reason === 'altitude'
        ? 'Недостаточная высота пролёта над препятствием. Путь не считается выполнимым.'
        : 'Столкновение на маршруте. Путь не считается выполнимым.'
  } else if (blockers.length && task !== 'arm2r') {
    check.status = 'needs_data'
    check.detail = blockers[0].detail
  } else if ([path, motion].some((s) => s.status === 'stale')) {
    check.status = 'stale'
    check.detail = 'Есть устаревшие результаты. Пересчитайте путь или время.'
  } else if (task === 'arm2r' && arm) {
    check.status = 'done'
    check.detail = 'Модель двухзвенника согласована. Это кинематика, не динамика.'
  } else if (path.status === 'done') {
    check.status = 'done'
    check.detail = 'Столкновений на заявленной модели (окружность габарита) не найдено.'
  } else {
    check.status = 'idle'
    check.detail = 'Заполните предыдущие этапы.'
  }

  const mass: KinStage = {
    id: 'mass',
    title: 'Компоненты и масса',
    purpose: 'Указать массу узлов и связанных компонентов архитектуры.',
    result: 'Известная масса конструкции и список неучтённых частей.',
    status: model.elements.length ? 'done' : 'idle',
    detail: model.elements.length
      ? 'Масса элементов и включённых компонентов архитектуры. Незаданные массы не выдумываются.'
      : 'Сначала задайте конструкцию.',
  }

  if (task === 'arm2r') return [robot, mass, check]
  if (task === 'linear') return [robot, mass, motion, check]
  return [robot, mass, map, path, motion, check]
}

export function blockedReason(action: 'plan' | 'time' | 'check', stages: KinStage[]) {
  const by = Object.fromEntries(stages.map((s) => [s.id, s])) as Partial<Record<KinStageId, KinStage>>
  if (action === 'plan') {
    if (by.path && by.path.status === 'needs_data') return by.path.detail || 'Укажите начальную точку и цель.'
    return null
  }
  if (action === 'time') {
    if (by.path && by.path.status !== 'done') return by.path.detail || 'Сначала постройте траекторию.'
    if (by.motion && by.motion.status === 'needs_data') return by.motion.detail
    return null
  }
  return null
}

export function canEnterStep(id: KinStageId, stages: KinStage[]) {
  const ids = stages.map((s) => s.id)
  if (!ids.includes(id)) return 'Этот этап не нужен для выбранной модели.'
  const idx = ids.indexOf(id)
  for (let i = 0; i < idx; i++) {
    const s = stages[i]
    if (s.status === 'done' || s.status === 'stale') continue
    if (s.id === 'map' && s.status === 'idle') continue
    if (s.status === 'idle' && s.id !== 'robot') continue
    return s.detail || `Сначала завершите этап «${s.title}».`
  }
  return null
}

export function continueFrom(id: KinStageId, stages: KinStage[]) {
  const cur = stages.find((s) => s.id === id)
  const ids = stages.map((s) => s.id)
  const next = ids[ids.indexOf(id) + 1]
  if (!next) return { next: null as KinStageId | null, reason: null as string | null }
  if (id === 'map' || id === 'mass') return { next, reason: null as string | null }
  if (id === 'robot' && cur && (cur.status === 'done' || cur.status === 'ready')) return { next, reason: null }
  if (id === 'path' && cur?.status === 'done') return { next, reason: null }
  if (id === 'path' && cur?.status === 'error') {
    return { next: null, reason: 'Маршрут пересекает препятствие. Перестройте путь или измените карту.' }
  }
  if (id === 'path' && cur?.status === 'stale') {
    return { next: null, reason: 'Маршрут устарел. Постройте его заново.' }
  }
  if (id === 'motion' && cur && (cur.status === 'done' || cur.status === 'stale')) {
    return { next, reason: cur.status === 'stale' ? null : null }
  }
  if (id === 'motion' && cur?.status === 'needs_data') return { next: null, reason: cur.detail }
  if (cur?.status === 'needs_data' || cur?.status === 'idle' || cur?.status === 'error') {
    return { next: null, reason: cur.detail || 'Заполните данные этого шага.' }
  }
  return { next, reason: null as string | null }
}
