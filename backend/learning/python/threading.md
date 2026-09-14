---
id: python-threading
title: Потоки
category: python
section: Параллельность
order: 50
description: I/O-bound, GIL, очереди.
tags: [python, параллельность]
technologies: [Python]
related: [python-copy, python-asyncio, python-queues]
---

# Потоки

Поток serial-reader + главный цикл через `queue.Queue`. Не делите dict без lock.

## Зачем это в робототехнической системе

Чтение UART блокирует — вынесите. PID на SBC можно в главном потоке, если dt стабилен.

## Синтаксис и контракт

```python
q: Queue[bytes] = Queue(maxsize=32)
Thread(target=reader, args=(q,), daemon=True).start()
```

## Типичные ошибки

- busy-spin без timeout
- daemon-поток с записью в GPIO при shutdown

## В Architecture Canvas

Каждый поток с железом = ответственность компонента. На холсте не прячьте «ещё поток» без блока.

## Связанные разделы
- python-copy
- python-asyncio
- python-queues
