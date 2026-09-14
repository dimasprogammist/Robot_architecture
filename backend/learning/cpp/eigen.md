---
id: cpp-eigen
title: Eigen / линейная алгебра
category: cpp
section: Экосистема
order: 60
description: Кинематика на IPC, не обязательно на M0.
tags: [cpp, экосистема]
technologies: [C++]
related: [robotics-kinematics, cpp-alloc, python-numpy]
---

# Eigen / линейная алгебра

FK манипулятора — Eigen на IPC. На маленьком MCU — явные формулы 2D.

## Зачем это в робототехнической системе

Блок Kinematics. Связь JointState → Pose. Тесты на известные позы.

## Синтаксис и контракт

```cpp
// Eigen::Matrix4d T = ...
```

## Типичные ошибки

- аллокации Eigen в realtime без noalloc
- смешать frame без TF-дисциплины

## В Architecture Canvas

Mechanical chain на холсте должна совпасть с порядком преобразований в коде.

## Связанные разделы
- robotics-kinematics
- cpp-alloc
- python-numpy
