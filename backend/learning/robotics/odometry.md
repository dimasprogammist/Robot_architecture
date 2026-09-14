---
id: robotics-odometry
title: Одометрия
category: robotics
section: Локализация
order: 9
description: Интеграция колёс и IMU.
tags: [robotics, локализация]
technologies: [Robotics]
related: [python-math, cpp-pid, robotics-slam]
---

# Одометрия

Скольжение убивает. Fuse осторожно. Stamp и dt monotonic.

## Зачем это в робототехнической системе

Дифф. база лабораторная vs склад с пылью.

## Синтаксис и контракт

```text
x += v*cos(yaw)*dt
```

## Типичные ошибки

- интегрировать yaw гироскопа без bias
- смешать единицы ticks

## В Architecture Canvas

Алгоритм Localization. Входы энкодеры/IMU.

## Связанные разделы
- python-math
- cpp-pid
- robotics-slam
