---
id: robotics-actuators
title: Приводы
category: robotics
section: Действие
order: 7
description: Мотор, редуктор, драйвер — три сущности.
tags: [robotics, действие]
technologies: [Robotics]
related: [electronics-motor, app-mech, robotics-kinematics]
---

# Приводы

Механика редуктора влияет на inertia и backlash. В Canvas: Motor, Gearbox, Wheel.

## Зачем это в робототехнической системе

Дифф. база: два сборки колеса.

## Синтаксис и контракт

```text
tau, reduction, backlash
```

## Типичные ошибки

- модель без люфта, а люфт есть
- драйвер без nFAULT в архитектуре

## В Architecture Canvas

Вложенный mechanical canvas. BOM part numbers.

## Связанные разделы
- electronics-motor
- app-mech
- robotics-kinematics
