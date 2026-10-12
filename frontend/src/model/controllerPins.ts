import type { Component } from '../types'
import { extraMap, extraValue } from './extraFields'

export type PinBudget = {
  di: number
  do: number
  ai: number
  ao: number
  maxDi: number
  maxDo: number
  maxAi: number
  maxAo: number
  note: string
  configurable: boolean
}

function n(extra: Record<string, string> | undefined, key: string, fallback: number) {
  const v = Number.parseInt(String(extra?.[key] ?? ''), 10)
  return Number.isFinite(v) ? v : fallback
}

export function catalogPinBudget(name: string, type: string, model: string): PinBudget {
  const key = `${model} ${name} ${type}`.toLowerCase()
  if (/arduino mega/.test(key)) {
    return {
      di: 20,
      do: 20,
      ai: 16,
      ao: 0,
      maxDi: 54,
      maxDo: 54,
      maxAi: 16,
      maxAo: 0,
      note: 'Arduino Mega 2560: до 54 цифровых линий (D0–D53) и 16 аналоговых входов (A0–A15). Отдельных ЦАП нет.',
      configurable: true,
    }
  }
  if (/arduino/.test(key) || type === 'MCU' && /uno|nano|leonardo/.test(key)) {
    const leonardo = /leonardo/.test(key)
    return {
      di: 6,
      do: 6,
      ai: leonardo ? 6 : 6,
      ao: 0,
      maxDi: leonardo ? 20 : 14,
      maxDo: leonardo ? 20 : 14,
      maxAi: leonardo ? 12 : 6,
      maxAo: 0,
      note: leonardo
        ? 'Arduino Leonardo: до 20 цифровых линий и 12 аналоговых входов. Аппаратного ЦАП нет.'
        : 'Arduino Uno/Nano (ATmega328P): D0–D13 и A0–A5. Цифровые линии общие для DI/DO; аппаратного ЦАП нет.',
      configurable: true,
    }
  }
  if (/esp32-s3/.test(key)) {
    return {
      di: 8,
      do: 8,
      ai: 6,
      ao: 0,
      maxDi: 20,
      maxDo: 20,
      maxAi: 10,
      maxAo: 0,
      note: 'ESP32-S3: учебный набор GPIO. Полный pinout зависит от модуля; встроенного ЦАП у S3 нет.',
      configurable: true,
    }
  }
  if (/esp32/.test(key)) {
    return {
      di: 8,
      do: 8,
      ai: 6,
      ao: 2,
      maxDi: 20,
      maxDo: 20,
      maxAi: 8,
      maxAo: 2,
      note: 'ESP32 (WROOM): учебная обвязка. У оригинального ESP32 два канала ЦАП (GPIO25/26); не все GPIO годятся для ADC.',
      configurable: true,
    }
  }
  if (/stm32/.test(key)) {
    return {
      di: 8,
      do: 8,
      ai: 4,
      ao: 0,
      maxDi: 16,
      maxDo: 16,
      maxAi: 10,
      maxAo: 2,
      note: 'STM32: точный набор выводов зависит от корпуса. Конфигурация требует настройки под выбранную плату.',
      configurable: true,
    }
  }
  if (/плк/.test(key) || type === 'ПЛК') {
    return {
      di: 4,
      do: 4,
      ai: 2,
      ao: 1,
      maxDi: 32,
      maxDo: 32,
      maxAi: 16,
      maxAo: 8,
      note: 'Состав модулей ПЛК задаётся проектом. Укажите число каналов выбранной конфигурации, не выдумывая отсутствующие модули.',
      configurable: true,
    }
  }
  if (type === 'MCU' || /контроллер/.test(key)) {
    return {
      di: 4,
      do: 4,
      ai: 2,
      ao: 0,
      maxDi: 16,
      maxDo: 16,
      maxAi: 8,
      maxAo: 2,
      note: 'Модель не сопоставлена с каталогом. Задайте число контактов вручную.',
      configurable: true,
    }
  }
  return {
    di: 0,
    do: 0,
    ai: 0,
    ao: 0,
    maxDi: 0,
    maxDo: 0,
    maxAi: 0,
    maxAo: 0,
    note: '',
    configurable: false,
  }
}

export function resolvedPins(c: Pick<Component, 'name' | 'type' | 'extra_fields'>) {
  const extra = extraMap(c.extra_fields)
  const budget = catalogPinBudget(c.name || '', c.type || '', extraValue(extra, 'model'))
  if (!budget.configurable && !budget.maxDi) return budget
  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v))
  return {
    ...budget,
    di: clamp(n(extra, 'pin_di', budget.di), budget.maxDi),
    do: clamp(n(extra, 'pin_do', budget.do), budget.maxDo),
    ai: clamp(n(extra, 'pin_ai', budget.ai), budget.maxAi),
    ao: clamp(n(extra, 'pin_ao', budget.ao), budget.maxAo),
  }
}

export function pinFieldPatch(c: Pick<Component, 'name' | 'type' | 'extra_fields'>, model: string): Record<string, string> {
  const budget = catalogPinBudget(c.name, c.type, model)
  if (!budget.configurable) return {}
  return {
    pin_di: String(budget.di),
    pin_do: String(budget.do),
    pin_ai: String(budget.ai),
    pin_ao: String(budget.ao),
  }
}
