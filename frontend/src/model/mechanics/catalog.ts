import { uid } from '../../lib/ids'
import type { MechElement, MechKind } from './types'

export const MECH_GROUPS: { id: string; title: string; kinds: MechKind[] }[] = [
  { id: 'links', title: 'Звенья и конструкции', kinds: ['link', 'chassis'] },
  { id: 'joints', title: 'Шарниры и направляющие', kinds: [] },
  { id: 'drives', title: 'Приводы и передачи', kinds: ['motor', 'gearbox'] },
  { id: 'wheels', title: 'Колёса и мобильные платформы', kinds: ['wheel', 'caster'] },
  { id: 'tools', title: 'Рабочие органы', kinds: ['gripper'] },
  { id: 'extra', title: 'Дополнительные элементы', kinds: ['base'] },
]

export const JOINT_TOOLS = [
  { id: 'revolute', title: 'Вращательный шарнир', hint: 'Соединяет два элемента с вращением' },
  { id: 'prismatic', title: 'Линейная ось', hint: 'Поступательное соединение' },
  { id: 'fixed', title: 'Жёсткое соединение', hint: 'Без относительного движения' },
] as const

export const KIND_LABEL: Record<MechKind, string> = {
  base: 'Основание',
  link: 'Жёсткое звено',
  wheel: 'Колесо',
  caster: 'Опорное колесо',
  motor: 'Двигатель',
  gearbox: 'Редуктор',
  gripper: 'Захват',
  chassis: 'Корпус платформы',
}

export function defaultAnchors(kind: MechKind, length = 0.2): MechElement['anchors'] {
  if (kind === 'link') {
    return [
      { id: 'a', name: 'A', x: 0, y: 0 },
      { id: 'b', name: 'B', x: length, y: 0 },
    ]
  }
  if (kind === 'chassis') {
    const w = 0.18
    const h = 0.12
    return [
      { id: 'c', name: 'C', x: 0, y: 0 },
      { id: 'wl', name: 'L', x: 0, y: w / 2 },
      { id: 'wr', name: 'R', x: 0, y: -w / 2 },
      { id: 'rear', name: 'S', x: -h / 2, y: 0 },
    ]
  }
  return [
    { id: 'a', name: 'A', x: 0, y: 0 },
    { id: 'b', name: 'B', x: 0, y: 0 },
  ]
}

export function createElement(kind: MechKind, x: number, y: number): MechElement {
  const length = kind === 'link' ? 0.2 : kind === 'chassis' ? 0.24 : 0.08
  const params: MechElement['params'] = {}
  if (kind === 'link') {
    params.length = length
    params.width = 0.028
    params.cm_x = length / 2
    params.cm_y = 0
  }
  if (kind === 'chassis') {
    params.length = 0.24
    params.width = 0.16
    params.track = 0.18
  }
  if (kind === 'wheel' || kind === 'caster') {
    params.radius = 0.04
    params.width = 0.02
    params.omega = 0
    params.side = kind === 'caster' ? 'caster' : 'left'
  }
  if (kind === 'motor') {
    params.omega = 0
    params.omega_nom = null
    params.omega_max = null
    params.torque_nom = null
    params.torque_peak = null
    params.power_nom = null
  }
  if (kind === 'gearbox') {
    params.ratio = 10
    params.efficiency = 0.9
    params.torque_out_max = null
    params.rpm_max = null
  }
  if (kind === 'gripper') {
    params.opening = 0.04
    params.opening_min = 0.01
    params.opening_max = 0.08
    params.force = null
  }
  return {
    id: uid(),
    kind,
    name: KIND_LABEL[kind],
    x,
    y,
    theta: 0,
    mass: kind === 'link' ? 0.2 : kind === 'chassis' ? 1 : null,
    catalog_component_id: null,
    params,
    anchors: defaultAnchors(kind, length),
  }
}

export function syncLinkAnchors(element: MechElement) {
  if (element.kind !== 'link') return element
  const length = Number(element.params.length)
  if (!Number.isFinite(length) || length <= 0) return element
  return {
    ...element,
    params: { ...element.params, cm_x: length / 2 },
    anchors: [
      { id: 'a', name: 'A', x: 0, y: 0 },
      { id: 'b', name: 'B', x: length, y: 0 },
    ],
  }
}
