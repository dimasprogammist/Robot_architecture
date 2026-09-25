---
id: python-fastapi
title: HTTP API на FastAPI
category: python
section: Сеть
order: 48
description: Команды оператора, OpenAPI, не control 1 кГц.
tags: [python, сеть]
technologies: [Python]
related: [python-pydantic, python-asyncio, python-json]
---

# HTTP API на FastAPI

FastAPI — внешний контур: миссия, карта, статус. Setpoint колёс — не REST 200 Гц.

## Зачем это в робототехнической системе

`POST /cmd/twist` пишет в очередь супервизора. Супервизор крутится своим циклом.

## Синтаксис и контракт

```python
@app.post('/cmd/twist')
def twist(body: Twist):
    q.put(body)
    return {'ok': True}
```

## Типичные ошибки

- считать HTTP realtime
- долгая калибровка внутри request без job id

## В Architecture Canvas

Блок API + связи HTTP к UI. Очередь — внутренний data_flow к Supervisor.

## Связанные разделы
- python-pydantic
- python-asyncio
- python-json
