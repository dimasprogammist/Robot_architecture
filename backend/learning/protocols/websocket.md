---
id: protocols-websocket
title: WebSocket
category: protocols
section: Прикладные
order: 5
description: UI телеметрия.
tags: [protocols, прикладные]
technologies: [Protocols]
related: [python-asyncio, python-queues, protocols-http]
---

# WebSocket

Поток поз в браузер. Переподключение, backpressure, не control 1 кГц.

## Зачем это в робототехнической системе

Оператор видит pose 10 Гц.

## Синтаксис и контракт

```text
ws://gateway/stream/pose
```

## Типичные ошибки

- без ping/pong и тихие мертвецы
- очередь без drop-old

## В Architecture Canvas

Связь Frontend—Backend WebSocket.

## Связанные разделы
- python-asyncio
- python-queues
- protocols-http
