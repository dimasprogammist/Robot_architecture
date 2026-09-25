---
id: python-pydantic
title: Pydantic-схемы
category: python
section: Сеть
order: 49
description: Валидация команд на границе.
tags: [python, сеть]
technologies: [Python]
related: [python-dataclasses, python-fastapi, python-testing]
---

# Pydantic-схемы

Pydantic отсекает `vx=1e9`. Граница доверия — здесь, не в PID.

## Зачем это в робототехнической системе

Модель `Twist` с `ge=-2, le=2`. Невалидное — 422, робот не двигается.

## Синтаксис и контракт

```python
class Twist(BaseModel):
    vx: float = Field(ge=-2, le=2)
    wz: float = Field(ge=-3, le=3)
```

## Типичные ошибки

- модель «всё Optional» без инвариантов
- два разных Twist в UI и бэкенде

## В Architecture Canvas

Поля модели = документация API компонента = возможно колонки audit-таблицы.

## Связанные разделы
- python-dataclasses
- python-fastapi
- python-testing
