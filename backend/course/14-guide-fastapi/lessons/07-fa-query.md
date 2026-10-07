---
id: fa-query
title: Query-параметры
module_id: fastapi
module_title: FastAPI
module_order: 14
order: 7
---

# Query-параметры

## Цель

Фильтровать списки через query: q, limit, offset, done.

## Что уже нужно знать

Path.

## Объяснение с нуля

Query — параметры после ?. В сигнатуре обычные аргументы без Path/Body становятся query. Отлично для фильтрации списка заметок. Задайте default и границы limit.

Не используйте query для секретов.

## Термины

- **Query**.
- **Пагинация limit/offset**.

## Внутреннее устройство

URL query string → типы → аргументы.

## Пример

GET /notes?done=false&limit=10

## Разбор

limit=1000 при max 100 → 422.

## Код

```python
from fastapi import Query

@router.get("")
def list_notes(
    done: bool | None = None,
    limit: int = Query(20, ge=1, le=100),
):
    return {"done": done, "limit": limit}
```

## Практика

Спроектируйте поиск q по тексту заметки.

## Типичные ошибки

- Безлимитный limit.
- Обязательный query там, где нужен path id.

## Что запомнить

Query = фильтры и опции выборки.

## Задание

Добавьте offset и опишите ответ.

## Связь со следующим уроком

Тело запроса.

### Закрепление 1

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».
