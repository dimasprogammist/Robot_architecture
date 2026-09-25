---
id: python-types-numbers
title: Числа: int, float, decimal
category: python
section: Типы
order: 5
description: Целые произвольной длины, float64, деньги и физика.
tags: [python, типы]
technologies: [Python]
related: [python-math, python-typing, python-pid]
---

# Числа: int, float, decimal

`int` в Python не переполняется. `float` — IEEE-754 double. Для ШИМ и АЦП часто нужны явные диапазоны, а не «просто float».

## Зачем это в робототехнической системе

Перевод энкодера: ticks * (2π / CPR) * gear. Считайте единицы в имени: `wheel_rad`, не `val`.

## Синтаксис и контракт

```python
ticks = 4096
rad = ticks * (2 * 3.1415926535) / 4096
```

## Типичные ошибки

- сравнивать float через ==
- смешивать мм и м в одном PID

## В Architecture Canvas

В ER/конфиге храните единицы. В блоке MCU опишите CPR энкодера — бэкенд не должен угадывать.

## Связанные разделы
- python-math
- python-typing
- python-pid
