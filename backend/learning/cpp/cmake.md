---
id: cpp-cmake
title: CMake
category: cpp
section: Инструменты
order: 28
description: Прошивки и Linux-ноды.
tags: [cpp, инструменты]
technologies: [C++]
related: [cpp-build-model, cpp-sanitizers, cpp-testing]
---

# CMake

CMake — карта таргетов = карта модулей. `firmware`, `gateway`, `tests`. Опции: BOARD, ENABLE_FOC.

## Зачем это в робототехнической системе

CI собирает firmware.elf и linux-gateway. Разные блоки — разные таргеты, не один mega-binary без нужды.

## Синтаксис и контракт

```cpp
add_executable(firmware src/main.cpp src/motor.cpp)
target_compile_features(firmware PRIVATE cxx_std_20)
```

## Типичные ошибки

- глобальные include на всё подряд
- отключённые предупреждения -w

## В Architecture Canvas

Сборочные таргеты упомяните в документации компонента MCU/C++ сервиса.

## Связанные разделы
- cpp-build-model
- cpp-sanitizers
- cpp-testing
