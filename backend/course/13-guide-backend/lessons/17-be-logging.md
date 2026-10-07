---
id: be-logging
title: Логирование
module_id: backend
module_title: Backend
module_order: 13
order: 17
---

# Логирование

## Цель

Логировать структурированно: request_id, user_id, latency, без секретов.

## Что уже нужно знать

Ошибки.

## Объяснение с нуля

Логи — телеметрия для отладки и аудита. Пишите JSON-поля: level, msg, request_id, path, status, duration_ms. Не логируйте пароли и токены. Коррелируйте запросы request_id через middleware.

Уровни: debug/info/warning/error.

## Термины

- **Structured logging**.
- **Correlation id**.

## Внутреннее устройство

middleware ставит request_id → handlers логируют с ним → агрегатор.

## Пример

{"level":"info","path":"/tasks","status":201,"duration_ms":12,"request_id":"a1"}

## Разбор

Инцидент: ищете request_id из ответа клиента в логах.

## Код

```python
log.info("task_created", extra={"task_id": 10, "request_id": rid})
```

## Практика

Что нельзя писать в лог из заголовков?

## Типичные ошибки

- print() без структуры.
- Логировать Authorization.

## Что запомнить

Лог = наблюдаемость; секреты вне лога.

## Задание

Чеклист полей лога для POST /tasks.

## Связь со следующим уроком

Слои архитектуры.

### Закрепление 1

Сформулируйте инвариант урока своими словами и один сценарий поломки. Сверьтесь с примером кода выше.
