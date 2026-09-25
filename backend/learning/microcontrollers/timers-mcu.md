---
id: microcontrollers-timers-mcu
title: Таймеры
category: microcontrollers
section: Периферия
order: 6
description: Несколько ролей.
tags: [microcontrollers, периферия]
technologies: [Microcontrollers]
related: [cpp-timers, robotics-odometry]
---

# Таймеры

PWM, encoder quadrature, scheduler 1 кГц — разные таймеры предпочтительны.

## Зачем это в робототехнической системе

Энкодер на TIM в encoder mode.

## Синтаксис и контракт

```c
TIM2 encoder, TIM1 PWM, TIM6 tick
```

## Типичные ошибки

- один таймер на PWM и tick с конфликтом ARR
- не тот AF пин

## В Architecture Canvas

Вложенный холст MCU с блоками TIM.

## Связанные разделы
- cpp-timers
- robotics-odometry
