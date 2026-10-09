import { Position } from '@xyflow/react'
import type { Component } from '../types'

export type TerminalKind =
  | 'plus'
  | 'minus'
  | 'gnd'
  | 'pe'
  | 'neutral'
  | 'phase'
  | 'signal'
  | 'di'
  | 'do'
  | 'ai'
  | 'ao'
  | 'pwm'
  | 'tx'
  | 'rx'
  | 'sda'
  | 'scl'
  | 'mosi'
  | 'miso'
  | 'sck'
  | 'cs'
  | 'anode'
  | 'cathode'
  | 'base'
  | 'collector'
  | 'emitter'
  | 'coil'
  | 'com'
  | 'no'
  | 'nc'
  | 'in'
  | 'out'
  | 'vin'
  | 'vout'

export type TerminalDirection = 'in' | 'out' | 'bidirectional'
export type TerminalPolarity = 'plus' | 'minus' | 'none'

export interface TerminalDef {
  id: string
  label: string
  kind: TerminalKind
  position: Position
  role: string
  signal: string
  direction: TerminalDirection
  polarity: TerminalPolarity
  offset: number
}

function t(
  id: string,
  label: string,
  kind: TerminalKind,
  position: Position,
  extra?: Partial<Pick<TerminalDef, 'role' | 'signal' | 'direction' | 'polarity'>>,
): TerminalDef {
  const polarity: TerminalPolarity =
    extra?.polarity || (kind === 'plus' || kind === 'anode' ? 'plus' : kind === 'minus' || kind === 'cathode' ? 'minus' : 'none')
  const direction: TerminalDirection =
    extra?.direction ||
    (kind === 'di' || kind === 'ai' || kind === 'rx' || kind === 'in' || kind === 'vin' ? 'in' : kind === 'do' || kind === 'ao' || kind === 'tx' || kind === 'out' || kind === 'vout' ? 'out' : 'bidirectional')
  return {
    id,
    label,
    kind,
    position,
    role: extra?.role || label,
    signal: extra?.signal || kind.toUpperCase(),
    direction,
    polarity,
    offset: 50,
  }
}

export function defaultMotorPhases(component: Pick<Component, 'type' | 'name'>) {
  const key = `${component.type} ${component.name}`.toLowerCase()
  if (/шагов/.test(key)) return 2
  if (component.type === 'АД' || component.type === 'СД' || /\bад\b/.test(key) || /\bсд\b/.test(key)) return 3
  return 1
}

function motorTerminals(component: Pick<Component, 'type' | 'name'>, extra: Record<string, string>): TerminalDef[] {
  const key = `${component.type} ${component.name}`.toLowerCase()
  const phases = clampCount(extra.phases, defaultMotorPhases(component), 3)
  const pins: TerminalDef[] = []
  if (phases <= 1) {
    pins.push(t('plus', '+', 'plus', Position.Right, { role: 'плюс питания' }))
    pins.push(t('minus', '−', 'minus', Position.Left, { role: 'минус питания' }))
  } else {
    for (let i = 1; i <= phases; i += 1) {
      pins.push(t(`phase-${i}`, `L${i}`, 'phase', Position.Left, { role: `фаза ${i} питания`, signal: 'AC' }))
    }
    pins.push(t('neutral', 'N', 'neutral', Position.Bottom, { role: 'нейтраль', signal: 'AC' }))
  }
  pins.push(t('pe', 'PE', 'pe', Position.Bottom, { role: 'защитное заземление', signal: 'PE' }))
  pins.push(
    t('pwm', /серво|шагов/.test(key) ? 'STEP' : 'PWM', 'pwm', Position.Top, {
      role: /шагов/.test(key) ? 'шаг / направление' : 'управление ШИМ',
      direction: 'in',
    }),
  )
  return pins
}

export function distributeTerminals(terms: TerminalDef[]): TerminalDef[] {
  const sides: Position[] = [Position.Left, Position.Right, Position.Top, Position.Bottom]
  const next = terms.map((term) => ({ ...term }))
  for (const side of sides) {
    const idxs = next.map((term, i) => (term.position === side ? i : -1)).filter((i) => i >= 0)
    idxs.forEach((idx, i) => {
      next[idx].offset = ((i + 1) / (idxs.length + 1)) * 100
    })
  }
  return next
}

export function rfTerminalHandleIds(termId: string) {
  return { source: `${termId}-src`, target: `${termId}-tgt` }
}

function clampCount(raw: string | undefined, fallback: number, max = 16) {
  const n = Number.parseInt(raw || '', 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(1, n))
}

function keyOf(component: Pick<Component, 'type' | 'name' | 'category'>) {
  return `${component.type} ${component.name}`.toLowerCase()
}

export function terminalsFor(component: Pick<Component, 'type' | 'name' | 'category' | 'extra_fields'>): TerminalDef[] {
  return distributeTerminals(buildTerminals(component))
}

function buildTerminals(component: Pick<Component, 'type' | 'name' | 'category' | 'extra_fields'>): TerminalDef[] {
  const key = keyOf(component)
  const extra = component.extra_fields || {}

  if (/клеммник/.test(key)) {
    const inputs = clampCount(extra.terminal_inputs, 2)
    const outputs = clampCount(extra.terminal_outputs, 2)
    const ins = Array.from({ length: inputs }, (_, i) =>
      t(`in-${i + 1}`, `IN${i + 1}`, 'in', Position.Left, { role: 'вход', signal: 'PASS', direction: 'in' }),
    )
    const outs = Array.from({ length: outputs }, (_, i) =>
      t(`out-${i + 1}`, `OUT${i + 1}`, 'out', Position.Right, { role: 'выход', signal: 'PASS', direction: 'out' }),
    )
    return [...ins, ...outs]
  }

  if (/трансформатор/.test(key)) {
    return [
      t('pri-l', 'L', 'phase', Position.Left, { role: 'первичная', signal: 'AC' }),
      t('pri-n', 'N', 'neutral', Position.Left, { role: 'первичная', signal: 'AC' }),
      t('sec-plus', 'Sec+', 'plus', Position.Right, { role: 'вторичная' }),
      t('sec-minus', 'Sec−', 'minus', Position.Right, { role: 'вторичная' }),
      t('pe', 'PE', 'pe', Position.Bottom, { role: 'PE', signal: 'PE' }),
    ]
  }

  if (/светодиод/.test(key)) {
    return [t('anode', 'A', 'anode', Position.Left, { role: 'анод' }), t('cathode', 'K', 'cathode', Position.Right, { role: 'катод' })]
  }

  if (/^диод | диод$|^диод$/.test(` ${key} `) || component.type === 'Диод') {
    return [t('anode', 'A', 'anode', Position.Left), t('cathode', 'K', 'cathode', Position.Right)]
  }

  if (/резистор/.test(key)) {
    return [t('a', '1', 'in', Position.Left, { role: 'вывод', signal: 'PASS' }), t('b', '2', 'out', Position.Right, { role: 'вывод', signal: 'PASS' })]
  }

  if (/конденсатор/.test(key)) {
    return [t('plus', '+', 'plus', Position.Left), t('minus', '−', 'minus', Position.Right)]
  }

  if (/катушк|индуктивн/.test(key)) {
    return [t('a', '1', 'in', Position.Left, { signal: 'PASS' }), t('b', '2', 'out', Position.Right, { signal: 'PASS' })]
  }

  if (/транзистор/.test(key)) {
    return [
      t('b', 'B', 'base', Position.Left, { role: 'база', signal: 'BIAS', direction: 'in' }),
      t('c', 'C', 'collector', Position.Top, { role: 'коллектор' }),
      t('e', 'E', 'emitter', Position.Bottom, { role: 'эмиттер' }),
    ]
  }

  if (/операционн|оу\b|op-?amp/.test(key)) {
    return [
      t('inp', '+', 'ai', Position.Left, { role: 'неинв. вход', signal: 'AI' }),
      t('inn', '−', 'ai', Position.Left, { role: 'инв. вход', signal: 'AI' }),
      t('out', 'Out', 'ao', Position.Right, { role: 'выход', signal: 'AO' }),
      t('vcc', 'V+', 'plus', Position.Top),
      t('vee', 'V−', 'minus', Position.Bottom),
    ]
  }

  if (/кнопк/.test(key)) {
    return [t('com', 'COM', 'com', Position.Left), t('no', 'NO', 'no', Position.Right)]
  }

  if (/переключатель/.test(key)) {
    return [t('com', 'COM', 'com', Position.Left), t('no', 'NO', 'no', Position.Top), t('nc', 'NC', 'nc', Position.Bottom)]
  }

  if (/разъём|разъем|connector/.test(key)) {
    return [
      t('p1', '1', 'plus', Position.Left),
      t('p2', '2', 'minus', Position.Left),
      t('p3', '3', 'signal', Position.Right, { signal: 'SIG' }),
      t('pe', 'PE', 'pe', Position.Bottom),
    ]
  }

  if (/автомат|выключатель/.test(key) && !/концев/.test(key)) {
    return [t('in', 'In', 'phase', Position.Left), t('out', 'Out', 'phase', Position.Right)]
  }

  if (/ламп/.test(key)) {
    return [t('l', 'L', 'phase', Position.Left), t('n', 'N', 'neutral', Position.Right)]
  }

  if (/дпт|ад\b|сд\b|шагов|двигател|серво/.test(key) && component.category !== 'MECHANICS') {
    return motorTerminals(component, extra)
  }

  if (/плк/.test(key)) {
    return [
      t('lplus', 'L+', 'plus', Position.Top),
      t('m', 'M', 'minus', Position.Bottom),
      t('pe', 'PE', 'pe', Position.Bottom),
      t('di0', 'DI0', 'di', Position.Left),
      t('di1', 'DI1', 'di', Position.Left),
      t('do0', 'DO0', 'do', Position.Right),
      t('ai0', 'AI0', 'ai', Position.Left),
      t('ao0', 'AO0', 'ao', Position.Right),
    ]
  }

  if (component.category === 'ELECTRICAL' || /аккумулятор|батаре/.test(key)) {
    if (/аккумулятор|батаре/.test(key)) {
      return [t('plus', '+', 'plus', Position.Right), t('minus', '−', 'minus', Position.Left)]
    }
    if (/делитель/.test(key)) {
      return [t('vin', 'Vin', 'vin', Position.Top), t('gnd', 'GND', 'gnd', Position.Bottom), t('vout', 'Vout', 'vout', Position.Right)]
    }
    if (/блок питания|psu|источник/.test(key)) {
      return [
        t('l', 'L', 'phase', Position.Top),
        t('n', 'N', 'neutral', Position.Top),
        t('plus', '+', 'plus', Position.Right),
        t('minus', '−', 'minus', Position.Left),
        t('pe', 'PE', 'pe', Position.Bottom),
      ]
    }
    if (/реле/.test(key)) {
      return [
        t('coil-plus', 'A1', 'coil', Position.Top, { polarity: 'plus', direction: 'in' }),
        t('coil-minus', 'A2', 'coil', Position.Bottom, { polarity: 'minus', direction: 'in' }),
        t('com', 'COM', 'com', Position.Left),
        t('no', 'NO', 'no', Position.Right),
        t('nc', 'NC', 'nc', Position.Right),
      ]
    }
    if (/предохранитель/.test(key)) {
      return [t('in', 'In', 'in', Position.Left, { signal: 'PASS' }), t('out', 'Out', 'out', Position.Right, { signal: 'PASS' })]
    }
    return [t('plus', '+', 'plus', Position.Right), t('minus', '−', 'minus', Position.Left), t('pe', 'PE', 'pe', Position.Bottom)]
  }

  if (/arduino|stm32|esp32|mcu/.test(key) || component.type === 'MCU') {
    return [
      t('vcc', '5V', 'plus', Position.Top),
      t('gnd', 'GND', 'gnd', Position.Bottom),
      t('vin', 'VIN', 'vin', Position.Top),
      t('d2', 'D2', 'di', Position.Right, { role: 'DI/DO' }),
      t('d3', 'D3', 'do', Position.Right),
      t('a0', 'A0', 'ai', Position.Left),
      t('tx', 'TX', 'tx', Position.Right),
      t('rx', 'RX', 'rx', Position.Left),
      t('sda', 'SDA', 'sda', Position.Bottom),
      t('scl', 'SCL', 'scl', Position.Bottom),
    ]
  }

  if (/датчик|encoder|энкодер|imu|lidar|камер|gnss|дальномер|концев/.test(key)) {
    return [
      t('vcc', 'Vcc', 'plus', Position.Top),
      t('gnd', 'GND', 'gnd', Position.Bottom),
      t('sig', 'S', 'ao', Position.Right, { role: 'сигнал', signal: extra.signal_type === 'дискретный' ? 'DO' : extra.signal_type === 'ШИМ' ? 'PWM' : 'AI' }),
    ]
  }

  if (/sbc|raspberry|jetson|ipc|hmi/.test(key) || component.category === 'HARDWARE') {
    return [
      t('plus', '+', 'plus', Position.Top),
      t('minus', '−', 'minus', Position.Bottom),
      t('pe', 'PE', 'pe', Position.Left),
      t('io', 'I/O', 'signal', Position.Right),
    ]
  }

  return [t('plus', '+', 'plus', Position.Right), t('minus', '−', 'minus', Position.Left)]
}

export function handleOffsetStyle(term: TerminalDef): { top?: string; left?: string } {
  const value = `${term.offset}%`
  if (term.position === Position.Left || term.position === Position.Right) return { top: value }
  return { left: value }
}

export function terminalAnchor(term: TerminalDef, size: { width: number; height: number }) {
  const t = (term.offset ?? 50) / 100
  if (term.position === Position.Left) return { x: 0, y: size.height * t }
  if (term.position === Position.Right) return { x: size.width, y: size.height * t }
  if (term.position === Position.Top) return { x: size.width * t, y: 0 }
  return { x: size.width * t, y: size.height }
}

export function terminalTooltip(term: TerminalDef) {
  const kindHelp: Partial<Record<TerminalKind, string>> = {
    pe: 'защитное заземление',
    gnd: 'общий провод',
    plus: 'плюс питания',
    minus: 'минус питания',
    phase: 'фазный контакт питания',
    neutral: 'нейтраль',
    di: 'цифровой вход',
    do: 'цифровой выход',
    ai: 'аналоговый вход',
    ao: 'аналоговый выход',
    pwm: 'широтно-импульсное управление',
    tx: 'передача данных',
    rx: 'приём данных',
    sda: 'данные I²C',
    scl: 'такт I²C',
    mosi: 'SPI MOSI',
    miso: 'SPI MISO',
    sck: 'SPI SCK',
    cs: 'выбор кристалла SPI',
    anode: 'анод',
    cathode: 'катод',
    base: 'база',
    collector: 'коллектор',
    emitter: 'эмиттер',
    coil: 'катушка реле',
    com: 'общий контакт',
    no: 'нормально разомкнутый контакт',
    nc: 'нормально замкнутый контакт',
    in: 'вход',
    out: 'выход',
    vin: 'вход питания',
    vout: 'выход напряжения',
    signal: 'сигнальный контакт',
  }
  const meaning = term.role && term.role !== term.label ? term.role : kindHelp[term.kind] || term.kind
  const parts = [`${term.label} — ${meaning}`]
  if (term.signal && term.signal !== term.label && term.signal !== 'PASS') {
    parts.push(`сигнал ${term.signal}`)
  }
  if (term.direction === 'in') parts.push('вход')
  if (term.direction === 'out') parts.push('выход')
  if (term.polarity === 'plus') parts.push('полярность +')
  if (term.polarity === 'minus') parts.push('полярность −')
  return parts.join(', ')
}

export function terminalClass(kind: TerminalKind) {
  if (kind === 'plus' || kind === 'anode') return 'term-plus'
  if (kind === 'minus' || kind === 'cathode') return 'term-minus'
  if (kind === 'gnd') return 'term-gnd'
  if (kind === 'pe') return 'term-pe'
  return 'term-signal'
}

export function matchTerminal(handle: string | null | undefined, term: TerminalDef) {
  const id = handle || ''
  return id === term.id || id.startsWith(`${term.id}-`)
}

export function findTerminal(component: Pick<Component, 'type' | 'name' | 'category' | 'extra_fields'>, handle?: string | null) {
  return terminalsFor(component).find((term) => matchTerminal(handle, term))
}

const POWER = new Set<TerminalKind>(['plus', 'minus', 'gnd', 'pe', 'neutral', 'phase', 'vin', 'vout'])
const DIGITAL = new Set<TerminalKind>(['di', 'do', 'pwm', 'tx', 'rx', 'cs'])
const ANALOG = new Set<TerminalKind>(['ai', 'ao'])
const I2C = new Set<TerminalKind>(['sda', 'scl'])
const SPI = new Set<TerminalKind>(['mosi', 'miso', 'sck', 'cs'])

export function terminalCompatibility(a: TerminalDef, b: TerminalDef): { allowed: boolean; warning?: string } {
  if (a.kind === 'pe' && b.kind === 'gnd') {
    return { allowed: true, warning: 'GND и PE не взаимозаменяемы: защитное заземление и рабочий общий провод — разные цепи.' }
  }
  if (a.kind === 'gnd' && b.kind === 'pe') {
    return { allowed: true, warning: 'GND и PE не взаимозаменяемы: защитное заземление и рабочий общий провод — разные цепи.' }
  }
  if ((a.polarity === 'plus' && b.polarity === 'minus') || (a.polarity === 'minus' && b.polarity === 'plus')) {
    if (a.kind === 'anode' || b.kind === 'anode' || a.kind === 'cathode' || b.kind === 'cathode') {
      return { allowed: true }
    }
    if (POWER.has(a.kind) && POWER.has(b.kind)) {
      return { allowed: true, warning: 'Соединяются выводы разной полярности. Убедитесь, что это задумано.' }
    }
  }
  if (a.kind === 'plus' && b.kind === 'plus') return { allowed: true }
  if (a.kind === 'minus' && b.kind === 'minus') return { allowed: true }
  if (a.kind === 'do' && b.kind === 'di') return { allowed: true }
  if (a.kind === 'di' && b.kind === 'do') return { allowed: true }
  if (a.kind === 'ao' && b.kind === 'ai') return { allowed: true }
  if (a.kind === 'ai' && b.kind === 'ao') return { allowed: true }
  if (a.kind === 'tx' && b.kind === 'rx') return { allowed: true }
  if (a.kind === 'rx' && b.kind === 'tx') return { allowed: true }
  if (I2C.has(a.kind) && I2C.has(b.kind) && a.kind === b.kind) return { allowed: true }
  if (SPI.has(a.kind) && SPI.has(b.kind) && a.kind === b.kind) return { allowed: true }
  if (a.kind === 'do' && b.kind === 'do') {
    return { allowed: true, warning: 'Соединяются два цифровых выхода. Это может вызвать конфликт.' }
  }
  if (DIGITAL.has(a.kind) && POWER.has(b.kind)) {
    return { allowed: false, warning: `Цифровой вывод ${a.label} не следует напрямую соединять с силовым ${b.label}.` }
  }
  if (POWER.has(a.kind) && DIGITAL.has(b.kind)) {
    return { allowed: false, warning: `Силовой вывод ${a.label} не следует напрямую соединять с цифровым ${b.label}.` }
  }
  if (ANALOG.has(a.kind) && DIGITAL.has(b.kind)) {
    return { allowed: true, warning: 'Аналоговый и цифровой выводы имеют разное назначение.' }
  }
  if (a.kind === 'in' || b.kind === 'out' || a.kind === 'out' || b.kind === 'in' || a.kind === 'com' || b.kind === 'no' || a.kind === 'signal' || b.kind === 'signal') {
    return { allowed: true }
  }
  if (a.kind === b.kind) return { allowed: true }
  return { allowed: true, warning: `Совместимость ${a.label} (${a.role}) и ${b.label} (${b.role}) не однозначна. Проверьте назначение выводов.` }
}

export function powerCompatible(a: TerminalKind, b: TerminalKind) {
  const dummy = (kind: TerminalKind): TerminalDef => ({
    id: kind,
    label: kind,
    kind,
    position: Position.Top,
    role: kind,
    signal: kind,
    direction: 'bidirectional',
    polarity: 'none',
    offset: 50,
  })
  return terminalCompatibility(dummy(a), dummy(b)).allowed
}
