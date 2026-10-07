---
id: be-middleware
title: Middleware
module_id: backend
module_title: Backend
module_order: 13
order: 14
---

# Middleware

## Цель

Встроить поперечные слои: лог, auth, CORS — вокруг обработчика.

## Что уже нужно знать

JWT/сессии.

## Объяснение с нуля

Middleware — обёртка пайплайна запроса: до и после handler. Логирование latency, аутентификация, CORS, rate limit. Порядок важен: сначала request-id, потом auth, потом handler.

Не пихайте бизнес-логику «закрыть задачу» в middleware.

## Термины

- **Pipeline / onion**.
- **CORS**, **rate limiting**.

## Внутреннее устройство

request → mw1 → mw2 → handler → mw2 → mw1 → response.

## Пример

Auth middleware пишет request.user; handler просто использует.

## Разбор

Если auth mw вернул 401, handler не вызывается.

## Код

```python
def auth_middleware(request, call_next):
    request.user = authenticate(request)
    if request.user is None and needs_auth(request):
        return Response(status_code=401)
    return call_next(request)
```

## Практика

В каком порядке: logging, auth, business?

## Типичные ошибки

- Бизнес-правила в middleware.
- Тихий swallow исключений.

## Что запомнить

Middleware = поперечные касания, не доменные операции.

## Задание

Список middleware для API задач.

## Связь со следующим уроком

Валидация входа.

### Закрепление 1

Сформулируйте инвариант урока своими словами и один сценарий поломки. Сверьтесь с примером кода выше.
