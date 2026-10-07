---
id: fa-pydantic
title: Pydantic-модели
module_id: fastapi
module_title: FastAPI
module_order: 14
order: 9
---

# Pydantic-модели

## Цель

Разделить In/Out модели и не светить внутренние поля.

## Что уже нужно знать

Тело запроса.

## Объяснение с нуля

Pydantic задаёт поля, типы, валидаторы. Отделяйте NoteCreate, NoteUpdate, NoteOut: наружу не отдавайте hashed secrets и лишние колонки. model_config / orm_mode (from_attributes) помогают из ORM-объектов.

Модели — часть контракта API.

## Термины

- **BaseModel**.
- **Field / field_validator**.
- **from_attributes**.

## Внутреннее устройство

Валидация на границе; внутри сервиса уже типы Python.

## Пример

NoteOut: id, title, done, created_at.

## Разбор

Случайное поле password_hash не должно быть в Out.

## Код

```python
class NoteOut(BaseModel):
    id: int
    title: str
    done: bool
    model_config = {"from_attributes": True}
```

## Практика

Зачем разные Create и Out?

## Типичные ошибки

- Одна MegaModel на всё.
- Молчаливое исключение лишних полей без политики.

## Что запомнить

Модели фиксируют контракт данных.

## Задание

Напишите Create/Update/Out для заметки.

## Связь со следующим уроком

Модель ответа.

### Закрепление 1

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».
