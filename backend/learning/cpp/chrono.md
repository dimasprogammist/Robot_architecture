---
id: cpp-chrono
title: chrono и таймеры
category: cpp
section: Время
order: 34
description: steady_clock vs system_clock, аппаратные таймеры.
tags: [cpp, время]
technologies: [C++]
related: [cpp-pid, cpp-timers, python-datetime]
---

# chrono и таймеры

На Linux dt — steady_clock. На MCU — таймер аппаратный, не «надежда на цикл».

## Зачем это в робототехнической системе

PID на MCU завязан на TIM interrupt 1 кГц. Не на while+delay.

## Синтаксис и контракт

```cpp
using clk = std::chrono::steady_clock;
auto dt = clk::now() - t0;
```

## Типичные ошибки

- sleep_for как регулятор ШИМ
- system_clock для dt

## В Architecture Canvas

Частота контура — в алгоритме и в notes MCU. Это системное требование, не деталь реализации.

## Связанные разделы
- cpp-pid
- cpp-timers
- python-datetime
