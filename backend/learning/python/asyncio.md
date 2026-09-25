---
id: python-asyncio
title: asyncio
category: python
section: Параллельность
order: 52
description: Много сокетов, один поток, осторожно с блокирующим кодом.
tags: [python, параллельность]
technologies: [Python]
related: [python-fastapi, python-mqtt, python-threading]
---

# asyncio

MQTT+HTTP+websocket хорошо живут в asyncio. `time.sleep` и `serial.read` без to_thread заморозят всё.

## Зачем это в робототехнической системе

Шлюз: coroutine читает CAN через поток, публикует MQTT, принимает REST.

## Синтаксис и контракт

```python
async def run():
    await asyncio.gather(http.serve(), mqtt.loop(), bridge())
```

## Типичные ошибки

- вызвать blocking OpenCV в coroutine
- забытый timeout на wait

## В Architecture Canvas

Если шлюз async — укажите в технологии компонента. Алгоритм: gather задач = параллельные шаги.

## Связанные разделы
- python-fastapi
- python-mqtt
- python-threading
