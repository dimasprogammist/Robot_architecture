---
id: python-while
title: Цикл while
category: python
section: Поток управления
order: 16
description: Циклы с условием, watchdog.
tags: [python, поток управления]
technologies: [Python]
related: [python-for, python-threading, python-asyncio]
---

# Цикл while

`while True` в сервисе допустим, если есть выход по shutdown-event и backoff на ошибках железа.

## Зачем это в робототехнической системе

Главный цикл SBC: читать очередь команд, слать setpoint на MCU, публиковать телеметрию.

## Синтаксис и контракт

```python
while not shutdown.is_set():
    cmd = q.get(timeout=0.05)
    apply(cmd)
```

## Типичные ошибки

- while без таймаута на сокете
- глотание исключений внутри вечного цикла

## Связанные разделы
- python-for
- python-threading
- python-asyncio
