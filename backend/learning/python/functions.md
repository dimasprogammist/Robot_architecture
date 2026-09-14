---
id: python-functions
title: Функции
category: python
order: 2
description: Описание функций, синтаксис и типичные ошибки.
tags: [python, functions]
technologies: [Python]
related: [python-basics]
---

# Функции

Функция инкапсулирует шаг алгоритма компонента.

## Синтаксис

```python
def read_sensor(port: str) -> float:
    """Читает значение с датчика."""
    return 0.0
```

## Примеры

```python
def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))
```

## Типичные ошибки

- побочные эффекты без явного имени;
- слишком длинные функции вместо модулей сервиса.

Связанные темы: алгоритмы компонента, API бэкенда.
