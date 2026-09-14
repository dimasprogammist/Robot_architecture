---
id: cpp-mutex
title: Мьютексы и lock-free
category: cpp
section: Параллельность
order: 32
description: Когда lock, когда ringbuffer.
tags: [cpp, параллельность]
technologies: [C++]
related: [cpp-atomics, cpp-isr, cpp-raii]
---

# Мьютексы и lock-free

Данные 1 кГц в UI 10 Гц — lock-free spsc очередь. Конфиг во время RUN — mutex, редкий путь.

## Зачем это в робототехнической системе

ISR кладёт байт в ring, task забирает. На Cortex — правила memory barrier/volatile не вместо атомиков.

## Синтаксис и контракт

```cpp
std::mutex m;
std::lock_guard n(m);
```

## Типичные ошибки

- лок в ISR
- инверсия приоритетов без RTOS-aware lock

## В Architecture Canvas

Граница ISR/task — в алгоритме MCU отдельными шагами.

## Связанные разделы
- cpp-atomics
- cpp-isr
- cpp-raii
