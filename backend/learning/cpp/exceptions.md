---
id: cpp-exceptions
title: Исключения: где да, где нет
category: cpp
section: Надёжность
order: 29
description: -fno-exceptions на MCU, ок на IPC.
tags: [cpp, надёжность]
technologies: [C++]
related: [cpp-expected, cpp-isr, cpp-testing]
---

# Исключения: где да, где нет

На Linux-шлюзе исключения возможны на границах. В control loop — коды ошибок. Смешение без политики — дыры.

## Зачем это в робототехнической системе

Разбор JSON конфига может кинуть. tick() — нет.

## Синтаксис и контракт

```cpp
#if __has_feature(cxx_exceptions)
throw std::runtime_error("cfg");
#endif
```

## Типичные ошибки

- throw из ISR
- catch(...) и продолжить ехать

## В Architecture Canvas

failure_modes: что неловим. Требование: «исключение конфигурации не стартует RUN».

## Связанные разделы
- cpp-expected
- cpp-isr
- cpp-testing
