---
id: python-args
title: Аргументы: default, *, **
category: python
section: Функции
order: 18
description: Позиционные, именованные, keyword-only.
tags: [python, функции]
technologies: [Python]
related: [python-functions, python-dataclasses, python-fastapi]
---

# Аргументы: default, *, **

Keyword-only после `*` защищает от путаницы единиц: `move(*, speed_mps, duration_s)`.

## Зачем это в робототехнической системе

API движения робота легко вызвать с перепутанными скоростью и временем, если оба float.

## Синтаксис и контракт

```python
def move(*, speed_mps: float, duration_s: float) -> None:
    ...
```

## Типичные ошибки

- *args в публичном API без схемы
- перегрузка смыслом позиционных аргументов

## В Architecture Canvas

В поле API компонента перечислите именованные параметры команд.

## Связанные разделы
- python-functions
- python-dataclasses
- python-fastapi
