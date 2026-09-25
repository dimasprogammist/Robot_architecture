---
id: robotics-kinematics
title: Кинематика
category: robotics
section: Движение
order: 3
description: Позы и скорости без сил.
tags: [robotics, движение]
technologies: [Robotics]
related: [cpp-eigen, python-math, robotics-frames]
---

# Кинематика

Дифф. база: vx, wz → omega колёс. Манипулятор: FK/IK. Совпадение с механической цепью холста.

## Зачем это в робототехнической системе

Drive System / Left Wheel — те же имена в коде.

## Синтаксис и контракт

```text
omega_l = (vx - wz*L/2)/r
```

## Типичные ошибки

- перепутать радиус и диаметр
- frame без имени

## В Architecture Canvas

Mechanical nested canvas = цепь преобразований.

## Связанные разделы
- cpp-eigen
- python-math
- robotics-frames
