---
id: cpp-vector
title: std::vector
category: cpp
section: STL
order: 10
description: Динамический массив на Linux/SBC.
tags: [cpp, stl]
technologies: [C++]
related: [cpp-span, cpp-alloc, cpp-move]
---

# std::vector

Вектор облака точек на IPC ок. Следите за аллокациями в realtime-потоке: reserve заранее.

## Зачем это в робототехнической системе

ROS2 callback кладёт точки в заранее reserved vector, control берёт снимок.

## Синтаксис и контракт

```cpp
std::vector<float> ranges;
ranges.reserve(2048);
```

## Типичные ошибки

- растёт каждый кадр без reserve
- передача vector по значению в горячем пути

## В Architecture Canvas

Поток Lidar → Perception: формат массива ranges + stamp.

## Связанные разделы
- cpp-span
- cpp-alloc
- cpp-move
