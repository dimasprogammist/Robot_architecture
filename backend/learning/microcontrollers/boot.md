---
id: microcontrollers-boot
title: Загрузчик и прошивка
category: microcontrollers
section: Жизненный цикл
order: 9
description: DFU, dual bank, откат.
tags: [microcontrollers, жизненный цикл]
technologies: [Microcontrollers]
related: [python-subprocess, git-tag, cpp-gdb]
---

# Загрузчик и прошивка

Brick — риск. Dual bank или ROM bootloader. Версия в телеметрии.

## Зачем это в робототехнической системе

OTA через шлюз — процедура, не «запилить из MQTT любой бинарь».

## Синтаксис и контракт

```c
boot0, SWD, app offset
```

## Типичные ошибки

- нет возможности прошить SWD после OTA-brick
- неподписанная прошивка из топика

## В Architecture Canvas

Блок Tooling flash. version MCU.

## Связанные разделы
- python-subprocess
- git-tag
- cpp-gdb
