---
id: robotics-frames
title: Системы координат
category: robotics
section: Ощущение
order: 8
description: Имена кадров обязательны.
tags: [robotics, ощущение]
technologies: [Robotics]
related: [robotics-kinematics, python-numpy, robotics-calibration]
---

# Системы координат

base_link, wheel_left, lidar, camera. Без TF каша облаков.

## Зачем это в робототехнической системе

Документ frames = механическая иерархия.

## Синтаксис и контракт

```text
T_base_lidar
```

## Типичные ошибки

- два «вперёд» у камеры и базы
- калибровка в голове

## В Architecture Canvas

Имена блоков механики = имена кадров.

## Связанные разделы
- robotics-kinematics
- python-numpy
- robotics-calibration
