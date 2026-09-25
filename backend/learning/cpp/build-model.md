---
id: cpp-build-model
title: Компиляция, объектники, линковка
category: cpp
section: Основы
order: 2
description: Как из .cpp получается прошивка.
tags: [cpp, основы]
technologies: [C++]
related: [cpp-headers, cpp-cmake, cpp-ub]
---

# Компиляция, объектники, линковка

Препроцессор → компиляция TU → линковка. Ошибка «undefined reference» — это линкер, не «C++ сломался».

## Зачем это в робототехнической системе

Прошивка STM32: startup + .cpp драйверы + app. Карта памяти — linker script, его тоже версионируйте.

## Синтаксис и контракт

```cpp
arm-none-eabi-g++ -c motor.cpp -o motor.o
arm-none-eabi-g++ motor.o -T stm32.ld -o app.elf
```

## Типичные ошибки

- править только код и игнорировать .map/.ld
- разные флаги оптимизации на соседних библиотеках без причины

## В Architecture Canvas

Документ MCU: toolchain, MCU part number, linker constraints (RAM/flash).

## Связанные разделы
- cpp-headers
- cpp-cmake
- cpp-ub
