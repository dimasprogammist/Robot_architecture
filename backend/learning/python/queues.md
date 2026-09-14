---
id: python-queues
title: Очереди сообщений в процессе
category: python
section: Параллельность
order: 51
description: queue.Queue, backpressure.
tags: [python, параллельность]
technologies: [Python]
related: [python-threading, python-asyncio, python-mqtt]
---

# Очереди сообщений в процессе

maxsize и drop-old vs block. Для телеметрии UI обычно drop-old. Для команд — не терять E-stop.

## Зачем это в робототехнической системе

Очередь команд: при переполнении — FAULT, не молчаливый drop последней команды «едь».

## Синтаксис и контракт

```python
q.put(cmd, timeout=0.05)
```

## Типичные ошибки

- безлимитная очередь → утечка при зависшем потребителе
- одна очередь для стопа и телеметрии

## В Architecture Canvas

data_flow на холсте пометьте частотой и политикой drop. Это семантика, не оформление.

## Связанные разделы
- python-threading
- python-asyncio
- python-mqtt
