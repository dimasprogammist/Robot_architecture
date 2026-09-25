---
id: python-bools-none
title: bool, None, правда и ложь
category: python
section: Типы
order: 7
description: Истина, ложь, отсутствие значения.
tags: [python, типы]
technologies: [Python]
related: [python-exceptions, python-typing, python-state-machine]
---

# bool, None, правда и ложь

`None` — нет значения. Пустой список `[]` тоже ложен в `if`, но это другой смысл: «нет целей» vs «ещё не пришло».

## Зачем это в робототехнической системе

Состояние лидара: `scan is None` (нет кадра) vs `len(scan)==0` (кадр пустой — возможно ошибка драйвера).

## Синтаксис и контракт

```python
if pose is None:
    return
if not waypoints:
    hold_position()
```

## Типичные ошибки

- `if not data` когда 0.0 — валидная скорость
- sentinel -1 вместо Optional

## В Architecture Canvas

В алгоритме компонента явно разведите ветки «нет данных» и «нулевая скорость».

## Связанные разделы
- python-exceptions
- python-typing
- python-state-machine
