---
id: cpp-const
title: const, constexpr, consteval
category: cpp
section: Основы
order: 6
description: Неизменяемость и вычисления на этапе компиляции.
tags: [cpp, основы]
technologies: [C++]
related: [cpp-macros, cpp-pid, cpp-embedded]
---

# const, constexpr, consteval

Магические коэффициенты PID — `constexpr`. Буфер DMA — не const, но указатель на него в API может быть const-корректным.

## Зачем это в робототехнической системе

Таблица синуса для FOC — constexpr/flash. Не считайте sinf в каждом тике, если нет FPU-политики.

## Синтаксис и контракт

```cpp
constexpr float kWheelRadiusM = 0.03f;
```

## Типичные ошибки

- #define PI вместо constexpr
- const метод, который кастует const_cast и пишет в железо

## В Architecture Canvas

Константы геометрии дублируйте в Mechanical Data колеса: радиус, масса.

## Связанные разделы
- cpp-macros
- cpp-pid
- cpp-embedded
