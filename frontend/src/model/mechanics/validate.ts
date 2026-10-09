import { clampJoint, incomingJoint, solvePoses, wouldCreateCycle } from './geometry'
import { findDiffPlatform, findSerial2R, staticMoment } from './kinematics'
import type { MechIssue, MechanicsModel } from './types'

export function validateMechanics(model: MechanicsModel, catalogIds?: Set<string>): MechIssue[] {
  const issues: MechIssue[] = []
  const ids = new Set(model.elements.map((e) => e.id))
  const { error, poses } = solvePoses(model)
  if (error) issues.push({ level: 'error', code: 'cycle', message: error })

  for (const joint of model.joints) {
    if (joint.parent_id === joint.child_id) {
      issues.push({ level: 'error', code: 'self', message: 'Соединение элемента с самим собой запрещено.', joint_id: joint.id })
    }
    if (!ids.has(joint.parent_id) || !ids.has(joint.child_id)) {
      issues.push({
        level: 'error',
        code: 'dangling',
        message: 'Связь указывает на отсутствующий элемент.',
        joint_id: joint.id,
      })
    }
    if (joint.q_min != null && joint.q_max != null && joint.q_min > joint.q_max) {
      issues.push({ level: 'error', code: 'limits', message: 'Минимальный предел больше максимального.', joint_id: joint.id })
    }
    if (clampJoint(joint) !== joint.q) {
      issues.push({ level: 'warning', code: 'limit-hit', message: 'Текущее значение шарнира вне ограничений.', joint_id: joint.id })
    }
  }

  for (const el of model.elements) {
    if (el.kind === 'link') {
      const len = Number(el.params.length)
      if (!(len > 0)) issues.push({ level: 'error', code: 'length', message: `Невалидная длина звена «${el.name}».`, element_id: el.id })
    }
    if (el.kind === 'wheel' || el.kind === 'caster') {
      const r = Number(el.params.radius)
      if (!(r > 0)) issues.push({ level: 'error', code: 'radius', message: `Невалидный радиус «${el.name}».`, element_id: el.id })
    }
    if (!incomingJoint(model, el.id) && !model.joints.some((j) => j.parent_id === el.id) && el.kind !== 'base') {
      issues.push({
        level: 'warning',
        code: 'orphan',
        message: `«${el.name}» не имеет механических соединений.`,
        element_id: el.id,
      })
    }
    if (el.catalog_component_id && catalogIds && !catalogIds.has(el.catalog_component_id)) {
      issues.push({
        level: 'warning',
        code: 'catalog',
        message: `Компонент каталога для «${el.name}» больше не найден. Локальные параметры сохранены.`,
        element_id: el.id,
      })
    }
  }

  const arm = findSerial2R(model, poses)
  if (arm) {
    const r = Math.hypot(arm.local.x, arm.local.y)
    if (r > arm.l1 + arm.l2 + 1e-6) {
      issues.push({ level: 'error', code: 'reach', message: 'Рабочая точка вне достижимой области манипулятора.' })
    }
  }

  if (model.load_mass != null || model.load_lever != null) {
    const m = staticMoment(model.load_mass, model.load_lever)
    if (!m.ok) {
      issues.push({
        level: 'warning',
        code: 'moment',
        message: `Для оценки момента не указана ${m.missing}.`,
      })
    }
  }

  const plat = findDiffPlatform(model, poses)
  if (plat && !plat.motion.ok) {
    issues.push({ level: 'warning', code: 'drive', message: plat.motion.reason || 'Недостаточно данных для расчёта платформы.' })
  }

  return issues
}

export function createJointError(
  model: MechanicsModel,
  parentId: string,
  childId: string,
): string | null {
  if (parentId === childId) return 'Нельзя соединить элемент с самим собой.'
  const ids = new Set(model.elements.map((e) => e.id))
  if (!ids.has(parentId) || !ids.has(childId)) return 'Один из элементов больше не существует.'
  if (model.joints.some((j) => j.child_id === childId)) {
    return 'У дочернего элемента уже есть родительское соединение. Сначала удалите его.'
  }
  if (wouldCreateCycle(model, parentId, childId)) {
    return 'Это соединение создаст цикл, который решатель первой версии не умеет разбирать.'
  }
  return null
}
