---
id: cpp-optional
title: optional и коды ошибок
category: cpp
section: STL
order: 13
description: Нет значения vs ошибка железа.
tags: [cpp, stl]
technologies: [C++]
related: [cpp-exceptions, cpp-expected, cpp-watchdog]
---

# optional и коды ошибок

`optional<Pose>` — нет фикса. Ошибка I²C — отдельный тип/код, не «пустой optional», если нужно чинить кабель.

## Зачем это в робототехнической системе

IMU: optional пуст — нет нового сэмпла (норма). CRC fail — счётчик ошибок, затем FAULT.

## Синтаксис и контракт

```cpp
std::optional<ImuSample> imu.poll();
```

## Типичные ошибки

- optional для всего, включая критичный estop
- игнор пустого в цикле без watchdog

## В Architecture Canvas

failure_modes компонента: CRC, timeout, no-sample — разные ветки алгоритма.

## Связанные разделы
- cpp-exceptions
- cpp-expected
- cpp-watchdog
