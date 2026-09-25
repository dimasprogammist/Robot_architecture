---
id: cpp-gdb
title: Отладка: gdb, OpenOCD, RTT
category: cpp
section: Качество
order: 41
description: Стенд прошивки.
tags: [cpp, качество]
technologies: [C++]
related: [cpp-isr, electronics-psu, cpp-watchdog]
---

# Отладка: gdb, OpenOCD, RTT

HardFault: смотрите stacked PC. Не гадайте. Логи RTT не заменяют fault analyzer.

## Зачем это в робототехнической системе

Точка на `can_send` при потере крутящего момента. Сравнивайте с логикой Python-шлюза.

## Синтаксис и контракт

```cpp
monitor reset halt
break Fault_Handler
```

## Типичные ошибки

- оптимизация -O2 и «переменные исчезли» без volatile/debug build
- отладка ESTOP с включёнными моторами без колодок

## В Architecture Canvas

Стенд отладки — вложенный холст lab: SWD, питание, нагрузка.

## Связанные разделы
- cpp-isr
- electronics-psu
- cpp-watchdog
