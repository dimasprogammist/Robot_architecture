---
id: cpp-algorithms-stl
title: Алгоритмы STL
category: cpp
section: STL
order: 12
description: find_if, clamp, transform вместо ручных циклов.
tags: [cpp, stl]
technologies: [C++]
related: [cpp-const, cpp-pid, cpp-span]
---

# Алгоритмы STL

STL снижает ошибки off-by-one. На MCU с кастомной STL проверяйте, что тянете.

## Зачем это в робототехнической системе

Ограничение PWM: `std::clamp(duty, 0, 1000)`. Поиск живого привода — find_if.

## Синтаксис и контракт

```cpp
#include <algorithm>
duty = std::clamp(duty, 0, 1000);
```

## Типичные ошибки

- кастомные циклы, которые пропускают последний элемент кадра
- std::function в тике (аллокации)

## В Architecture Canvas

Ограничения актуатора — в mechanical notes и в коде clamp одни числа.

## Связанные разделы
- cpp-const
- cpp-pid
- cpp-span
