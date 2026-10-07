---
id: ws-fastapi
title: WebSocket в FastAPI
module_id: websocket
module_title: WebSocket
module_order: 15
order: 9
---

# WebSocket в FastAPI

## Цель

Собрать минимальный рабочий WS-эндпоинт на FastAPI.

## Что уже нужно знать

Broadcast.

## Объяснение с нуля

FastAPI: websocket: WebSocket в аргументах, путь /ws/tasks. accept, цикл, менеджер. Авторизацию сделайте до/сразу после accept (отклоните и закройте).

Ниже — рабочий каркас echo+broadcast для задачного канала.

## Термины

- **WebSocket** класс.
- **WebSocketDisconnect**.

## Внутреннее устройство

HTTP upgrade обрабатывает Starlette; ваш код — accept/цикл.

## Пример

Клиент подключается, шлёт JSON, видит echo и broadcast.

## Разбор

Disconnect не должен ронять процесс.

## Код

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import json

app = FastAPI()
manager = ConnectionManager()  # из прошлого урока

@app.websocket("/ws/tasks")
async def ws_tasks(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            # ожидаем {"type":"ping"} или {"type":"chat","text":"..."}
            if data.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            else:
                await manager.broadcast(json.dumps({"type": "event", "data": data}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
        await websocket.close()
```

## Практика

Где проверить токен query ?token=

## Типичные ошибки

- accept до auth без последующего close.
- Блокирующий ORM в узком цикле без нужды.

## Что запомнить

Минимальный сервер: connect + loop + cleanup + broadcast.

## Задание

Добавьте query-token и словарь user_id.

## Связь со следующим уроком

Клиент на JS.

### Закрепление 1

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».
