---
id: cpp-timers
title: Аппаратные таймеры и PWM
category: cpp
section: MCU
order: 47
description: ШИМ, encoder input, tick 1 кГц.
tags: [cpp, mcu]
technologies: [C++]
related: [cpp-pid, electronics-motor, cpp-chrono]
---

# Аппаратные таймеры и PWM

Таймер — источник истины времени контура. ARR/PSC посчитайте и запишите в notes.

## Зачем это в робототехнической системе

PWM 20 кГц для драйвера, отдельный TIM на 1 кГц PID. Не один таймер «на всё», если конфликтуют.

## Синтаксис и контракт

```cpp
tim->CCR1 = duty;
```

## Типичные ошибки

- слишком низкий PWM — свист и нагрев
- менять PSC на лету без глушения

## В Architecture Canvas

Motor driver блок + MCU PWM связь. Частота PWM — в документации обоих.

## Связанные разделы
- cpp-pid
- electronics-motor
- cpp-chrono
