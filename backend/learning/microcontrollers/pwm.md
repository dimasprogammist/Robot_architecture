---
id: microcontrollers-pwm
title: PWM и драйверы
category: microcontrollers
section: Периферия
order: 4
description: Частота, dead-time.
tags: [microcontrollers, периферия]
technologies: [Microcontrollers]
related: [cpp-timers, electronics-motor, robotics-actuators]
---

# PWM и драйверы

Частота выше слышимого или как просит драйвер. Dead-time чтобы не прострелить полумост.

## Зачем это в робототехнической системе

Колесо BLDC/DC. Документ драйвера.

## Синтаксис и контракт

```c
ARR, PSC, CCRx
```

## Типичные ошибки

- слишком низкий PWM
- нет dead-time на полумосте

## В Architecture Canvas

Связь MCU—Motor Controller: PWM/CAN. Частота в docs.

## Связанные разделы
- cpp-timers
- electronics-motor
- robotics-actuators
