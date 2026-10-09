import type { LibraryPreset } from '../types'

export interface PresetGroup {
  id: string
  title: string
  match: (preset: LibraryPreset) => boolean
}

export function isMotorPreset(p: LibraryPreset) {
  if (p.category === 'MECHANICS') return false
  const text = `${p.name} ${p.type}`
  return (
    ['ДПТ', 'АД', 'СД', 'Шаговый', 'Сервопривод'].includes(p.type) ||
    p.name === 'Двигатель' ||
    p.name === 'Шаговый двигатель' ||
    p.name === 'Сервопривод' ||
    /шагов/i.test(text)
  )
}

export const PRESET_GROUPS: PresetGroup[] = [
  { id: 'custom', title: 'Свои', match: (p) => p.built_in === false },
  { id: 'soft', title: 'Софт', match: (p) => p.category === 'SOFTWARE' && p.built_in !== false },
  {
    id: 'ctrl',
    title: 'Контроллеры',
    match: (p) =>
      p.category === 'HARDWARE' &&
      ['MCU', 'SBC', 'ПЛК', 'CPU', 'IPC', 'GPU', 'Контроллер двигателя', 'Контроллер'].includes(p.type),
  },
  {
    id: 'sense',
    title: 'Датчики',
    match: (p) =>
      p.category === 'HARDWARE' &&
      /камера|lidar|imu|энкодер|датчик|дальномер|концевой|gnss/i.test(`${p.name} ${p.type}`),
  },
  {
    id: 'motors',
    title: 'Двигатели',
    match: isMotorPreset,
  },
  { id: 'elec', title: 'Электрика', match: (p) => p.category === 'ELECTRICAL' },
  { id: 'mech', title: 'Механика', match: (p) => p.category === 'MECHANICS' },
  { id: 'data', title: 'Данные', match: (p) => p.category === 'DATA' },
  { id: 'net', title: 'Сеть', match: (p) => p.category === 'NETWORK' },
]
