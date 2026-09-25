---
id: cpp-pid
title: PID на C++
category: cpp
section: Управление
order: 56
description: Фиксированная точка vs float, saturations.
tags: [cpp, управление]
technologies: [C++]
related: [python-pid, cpp-timers, robotics-pid]
---

# PID на C++

На M4F float ок. На M0 — Q-формат. Anti-windup обязателен у интегратора рядом с PWM sat.

## Зачем это в робототехнической системе

Контур скорости колеса 1 кГц. Коэффициенты из конфига Flash, те же имена, что в Python-симе.

## Синтаксис и контракт

```cpp
u = kp*e + ki*integ + kd*de;
u = clamp(u, -UMAX, UMAX);
```

## Типичные ошибки

- разный dt «примерно 1 мс»
- коэффициенты только в голове инженера

## В Architecture Canvas

Алгоритм PID в инспекторе MCU. Коэффициенты — конфиг + notes. Сравните с python-pid симом.

## Связанные разделы
- python-pid
- cpp-timers
- robotics-pid
