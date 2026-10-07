---
id: be-errors
title: Ошибки API
module_id: backend
module_title: Backend
module_order: 13
order: 16
---

# Ошибки API

## Цель

Единый формат ошибок и правильные статусы.

## Что уже нужно знать

Валидация.

## Объяснение с нуля

Ошибки делят на ожидаемые (4xx) и сбои (5xx). Единый JSON: code, message, fields, request_id. Логируйте 5xx с стеком внутри; наружу — коротко.

Не маскируйте 403 под 404 без политики (иногда делают для скрытия существования).

## Термины

- **Problem details** (идея).
- **request_id**.

## Внутреннее устройство

exceptions → handler → JSON response.

## Пример

{"code":"not_found","message":"task not found","request_id":"..."}

## Разбор

Слой API ловит DomainError и мапит в статус.

## Код

```python
class NotFound(Exception):
    pass

# handler
except NotFound:
    return JSONResponse({"code":"not_found"}, status_code=404)
```

## Практика

Словарь code → status для задач.

## Типичные ошибки

- Разный формат на каждый endpoint.
- Стек в проде наружу.

## Что запомнить

Ошибка — тоже контракт.

## Задание

Опишите 4 ошибки create_task.

## Связь со следующим уроком

Логирование.

### Закрепление 1

Сформулируйте инвариант урока своими словами и один сценарий поломки. Сверьтесь с примером кода выше.
