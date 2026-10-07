---
id: ws-clients
title: Менеджер клиентов
module_id: websocket
module_title: WebSocket
module_order: 15
order: 7
---

# Менеджер клиентов

## Цель

Хранить активные сокеты и безопасный send.

## Что уже нужно знать

Reconnect.

## Объяснение с нуля

ConnectionManager держит set/list сокетов или map user_id→sockets. send лично и broadcast. При ошибке send — удалить мёртвый сокет.

На нескольких процессах нужен Redis pub/sub — иначе broadcast только локальный.

## Термины

- **fan-out**.
- **dead socket cleanup**.

## Внутреннее устройство

add/remove/broadcast methods.

## Пример

Два клиента подключены — оба получают событие.

## Разбор

Один отвалился — remove, второй продолжает.

## Код

```python
class ConnectionManager:
    def __init__(self):
        self.active: set = set()
    async def connect(self, ws):
        await ws.accept()
        self.active.add(ws)
    def disconnect(self, ws):
        self.active.discard(ws)
    async def broadcast(self, message: str):
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)
```

## Практика

Как связать user_id с ws?

## Типичные ошибки

- Broadcast без cleanup.
- Глобальный list без блокировок в sync-коде (осознайте модель).

## Что запомнить

Менеджер — реестр живых соединений.

## Задание

Добавьте send_to_user.

## Связь со следующим уроком

Broadcast событий.

### Закрепление 1

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».
