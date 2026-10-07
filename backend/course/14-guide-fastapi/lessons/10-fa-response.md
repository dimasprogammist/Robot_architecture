---
id: fa-response
title: Модели ответа
module_id: fastapi
module_title: FastAPI
module_order: 14
order: 10
---

# Модели ответа

## Цель

Фиксировать response_model и status_code.

## Что уже нужно знать

Pydantic.

## Объяснение с нуля

response_model=NoteOut отфильтрует лишние поля и появится в OpenAPI. status_code на декораторе задаёт успех по умолчанию. Для списков — list[NoteOut].

Можно Response без тела для 204.

## Термины

- **response_model**.
- **response_model_exclude**.

## Внутреннее устройство

return dict/ORM → фильтр через response_model → JSON.

## Пример

create возвращает NoteOut и 201.

## Разбор

Лишнее поле internal попадёт в return, но response_model отрежет.

## Код

```python
@router.post("", response_model=NoteOut, status_code=201)
def create_note(body: NoteCreate) -> NoteOut:
    ...
```

## Практика

Когда response_model мешает стримингу?

## Типичные ошибки

- Разный shape ответа на одном path.
- Забыть 201 на create.

## Что запомнить

Ответ тоже схема, не «просто dict».

## Задание

Опишите response для list и get.

## Связь со следующим уроком

Depends.

### Закрепление 1

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».
