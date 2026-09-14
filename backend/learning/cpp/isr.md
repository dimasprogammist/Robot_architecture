---
id: cpp-isr
title: Прерывания
category: cpp
section: MCU
order: 45
description: Коротко, флаги, никаких протоколов целиком.
tags: [cpp, mcu]
technologies: [C++]
related: [cpp-atomics, cpp-dma, cpp-safety]
---

# Прерывания

ISR: снять флаг, положить байт/событие, выйти. Разбор Modbus — в task.

## Зачем это в робототехнической системе

USART RXNE → ring. EXTI ESTOP → atomic + снять PWM сразу, если политика «hardware first».

## Синтаксис и контракт

```cpp
extern "C" void USART1_IRQHandler() {
  ring_push(USART1->RDR);
}
```

## Типичные ошибки

- malloc в ISR
- лог/printf в ISR
- долгое float в EXTI

## В Architecture Canvas

Алгоритм MCU: ветка ISR vs task. Требование латентности ESTOP — отдельное.

## Связанные разделы
- cpp-atomics
- cpp-dma
- cpp-safety
