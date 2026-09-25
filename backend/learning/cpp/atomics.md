---
id: cpp-atomics
title: std::atomic
category: cpp
section: Параллельность
order: 33
description: Флаги стопа, seqlock для телеметрии.
tags: [cpp, параллельность]
technologies: [C++]
related: [cpp-isr, cpp-watchdog, cpp-safety]
---

# std::atomic

`atomic<bool> estop`. Не atomic большой struct без схемы. Для телеметрии часто двойной буфер.

## Зачем это в робототехнической системе

Кнопка ESTOP пин → EXTI → atomic flag → tick видит и снимает PWM в том же кГц.

## Синтаксис и контракт

```cpp
std::atomic<bool> estop{false};
```

## Типичные ошибки

- atomic без указания order «потом разберёмся» в lock-free
- считать volatile заменой atomic

## В Architecture Canvas

Требование безопасности: ESTOP независим от MQTT. На холсте отдельная связь GPIO, не через брокер.

## Связанные разделы
- cpp-isr
- cpp-watchdog
- cpp-safety
