---
id: fa-middleware
title: Middleware во FastAPI
module_id: fastapi
module_title: FastAPI
module_order: 12
order: 12
---

# Middleware во FastAPI

## Цель

Повесить middleware для request_id и логирования latency.

## Что уже нужно знать

Depends.

## Объяснение с нуля

Middleware на уровне ASGI/Starlette оборачивает приложение. Удобно для CORS, HTTPS redirect, метрик. Порядок добавления влияет на порядок обёрток.

Бизнес-проверки владельца заметки — в сервисе/Depends, не в middleware.

## Термины

- **add_middleware**.
- **CORSMiddleware**.

## Внутреннее устройство

request → middlewares → routes → back.

## Пример

Проставить X-Request-ID если нет.

## Разбор

Клиент получает тот же id в ответе для поддержки.

## Код

```python
import time, uuid
from starlette.middleware.base import BaseHTTPMiddleware

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        rid = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        start = time.perf_counter()
        response = await call_next(request)
        response.headers["X-Request-ID"] = rid
        response.headers["X-Latency-ms"] = str(int((time.perf_counter()-start)*1000))
        return response
```

## Практика

Куда добавить CORS для локального frontend?

## Типичные ошибки

- Authz в middleware «на все случаи».
- Тяжёлая синхронная работа в async middleware.

## Что запомнить

Middleware = поперечные заголовки и обёртки.

## Задание

Подключите RequestIdMiddleware к app.

## Связь со следующим уроком

Авторизация в API.

### Закрепление 1

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».

### Закрепление 2

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».

### Закрепление 3

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».

### Закрепление 4

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».

### Закрепление 5

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».

### Закрепление 6

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».

### Закрепление 7

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».

### Закрепление 8

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».
