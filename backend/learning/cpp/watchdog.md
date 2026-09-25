---
id: cpp-watchdog
title: Watchdog
category: cpp
section: RTOS
order: 55
description: Внешний и оконный WDT.
tags: [cpp, rtos]
technologies: [C++]
related: [cpp-safety, cpp-freertos, cpp-isr]
---

# Watchdog

WDT сбрасывает MCU, если tick умер. Кормить из idle — ошибка: зависший PID при живом idle.

## Зачем это в робототехнической системе

Кормите WDT только из контрольного task, который видит «PID жив». ESTOP не ждёт WDT.

## Синтаксис и контракт

```cpp
if (pid_alive) IWDG_refresh();
```

## Типичные ошибки

- refresh в ISR «на всякий»
- слишком длинный timeout для механизма

## В Architecture Canvas

Требование безопасности: независимый WDT. На холсте — часть MCU, явно в requirements.

## Связанные разделы
- cpp-safety
- cpp-freertos
- cpp-isr
