---
id: python-math
title: math, statistics, случайность
category: python
section: Численность
order: 42
description: Тригонометрия, фильтры, не numpy.
tags: [python, численность]
technologies: [Python]
related: [python-types-numbers, python-pid, python-numpy]
---

# math, statistics, случайность

Для 2D-одометрии часто хватает math. atan2(dy, dx) для yaw. random — только симуляция/тесты, не для seed безопасности ключей.

## Зачем это в робототехнической системе

`yaw = math.atan2(dy, dx)` после интеграции. Нормализуйте угол в [-π, π].

## Синтаксис и контракт

```python
import math
yaw = (yaw + math.pi) % (2*math.pi) - math.pi
```

## Типичные ошибки

- градусы/радианы без суффикса
- random в control loop «для шума» на изделии

## В Architecture Canvas

Единицы углов укажите в документации компонента Localization.

## Связанные разделы
- python-types-numbers
- python-pid
- python-numpy
