---
id: cpp-enums-class
title: enum class
category: cpp
section: Данные
order: 25
description: Режимы прошивки, не «магические 3».
tags: [cpp, данные]
technologies: [C++]
related: [cpp-state-machine, python-enums, cpp-struct]
---

# enum class

Те же имена, что Python StrEnum и Canvas states: IDLE, RUN, FAULT.

## Зачем это в робототехнической системе

Байт режима в телеметрии. Несовпадение таблиц Python/C++ — ложный FAULT или хуже — ложный RUN.

## Синтаксис и контракт

```cpp
enum class Mode : uint8_t { Idle=0, Run=1, Fault=2 };
```

## Типичные ошибки

- неявное приведение к int в протоколе без таблицы
- разные порядки enumerator

## В Architecture Canvas

States в алгоритме MCU = enum class. Экспорт AI должен увидеть те же имена.

## Связанные разделы
- cpp-state-machine
- python-enums
- cpp-struct
