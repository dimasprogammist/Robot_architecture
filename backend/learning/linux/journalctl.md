---
id: linux-journalctl
title: journalctl и логи
category: linux
section: Наблюдаемость
order: 7
description: Как читать службу.
tags: [linux, наблюдаемость]
technologies: [Linux]
related: [linux-systemd, python-logging, cpp-logging]
---

# journalctl и логи

Логи службы: journalctl -u robot-svc -f. Уровни как в logging Python.

## Зачем это в робототехнической системе

После FAULT сначала журнал, потом осциллограф. Иначе потеряете последовательность.

## Синтаксис и контракт

```bash
journalctl -u robot-svc --since '10 min ago'
```

## Типичные ошибки

- логировать в файл в /tmp и терять после ребута без причины
- без RateLimit понимание флуда IMU

## В Architecture Canvas

Наблюдаемость: куда пишем. Документ компонента + связь с UI логов, если есть.

## Связанные разделы
- linux-systemd
- python-logging
- cpp-logging
