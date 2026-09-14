---
id: python-pid
title: ПИД на Python
category: python
section: Управление
order: 55
description: Дискретный PID, anti-windup, не магия.
tags: [python, управление]
technologies: [Python]
related: [python-datetime, python-math, robotics-pid]
---

# ПИД на Python

На SBC PID ок для медленных контуров (позиция камеры, температура). Для тока мотора — MCU/C++.

## Зачем это в робототехнической системе

Формула: `u = Kp e + Ki ∫e + Kd de`. Интегратор ограничивайте. dt — monotonic.

## Синтаксис и контракт

```python
e = sp - x
integ = clamp(integ + e * dt, -ilim, ilim)
u = kp*e + ki*integ + kd*(e-e_prev)/dt
```

## Типичные ошибки

- интегратор без насыщения
- dt=0 при повторном вызове

## В Architecture Canvas

Алгоритм блока контроллера: шаги PID. Коэффициенты — конфиг и mechanical/notes привода.

## Связанные разделы
- python-datetime
- python-math
- robotics-pid
