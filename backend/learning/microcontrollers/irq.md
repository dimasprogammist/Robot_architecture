---
id: microcontrollers-irq
title: Прерывания на MCU
category: microcontrollers
section: Архитектура MCU
order: 7
description: Приоритеты NVIC.
tags: [microcontrollers, архитектура mcu]
technologies: [Microcontrollers]
related: [cpp-isr, cpp-safety]
---

# Прерывания на MCU

ESTOP выше UART. Не маскировать глобально надолго.

## Зачем это в робототехнической системе

См. C++ ISR.

## Синтаксис и контракт

```c
NVIC_SetPriority
```

## Типичные ошибки

- низкий приоритет ESTOP
- всё в одном IRQ

## В Architecture Canvas

Требование латентности.

## Связанные разделы
- cpp-isr
- cpp-safety
