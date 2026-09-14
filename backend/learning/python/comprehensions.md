---
id: python-comprehensions
title: Comprehensions
category: python
section: Итерации
order: 38
description: Списки/словари в одно выражение, без фанатизма.
tags: [python, итерации]
technologies: [Python]
related: [python-lists, python-generators, python-numpy]
---

# Comprehensions

Удобно фильтровать валидные лидарные точки. Не прячьте PID внутрь comprehension.

## Зачем это в робототехнической системе

`valid = [p for p in cloud if p.range_m < 20]` — ок. Побочные эффекты в genexp — нет.

## Синтаксис и контракт

```python
hz = {s.name: s.rate for s in sensors if s.ok}
```

## Типичные ошибки

- вложенные comp на 4 уровня
- исключения внутри comp без контекста

## В Architecture Canvas

Фильтрация данных — шаг алгоритма «preprocess».

## Связанные разделы
- python-lists
- python-generators
- python-numpy
