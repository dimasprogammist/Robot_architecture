---
id: python-sets
title: Множества
category: python
section: Коллекции
order: 12
description: Уникальность id, быстрый membership.
tags: [python, коллекции]
technologies: [Python]
related: [python-dicts, python-lists]
---

# Множества

`set` проверяет «уже видели этот uid тега» за O(1) среднее.

## Зачем это в робототехнической системе

Фильтр повторных UUID детектированных маркеров ARUCO за кадр.

## Синтаксис и контракт

```python
seen: set[int] = set()
if marker_id not in seen:
    seen.add(marker_id)
```

## Типичные ошибки

- set из list, если нужен порядок
- изменяемые элементы как ключи

## В Architecture Canvas

В требованиях: «повторные детекции не порождают повторную команду».

## Связанные разделы
- python-dicts
- python-lists
