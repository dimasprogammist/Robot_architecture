---
id: microcontrollers-debug-mcu
title: SWD, RTT, fault
category: microcontrollers
section: Жизненный цикл
order: 11
description: Стенд.
tags: [microcontrollers, жизненный цикл]
technologies: [Microcontrollers]
related: [cpp-gdb, electronics-ground]
---

# SWD, RTT, fault

Разъём SWD доступен в корпусе сервиса. HardFault_Handler логирует stacked PC.

## Зачем это в робототехнической системе

Не отлаживайте ток на весу без колодок.

## Синтаксис и контракт

```c
OpenOCD, ST-Link
```

## Типичные ошибки

- оптимизация без символов в полевом расследовании
- питание отладчика и силовой земли

## В Architecture Canvas

Стенд lab на холсте.

## Связанные разделы
- cpp-gdb
- electronics-ground
