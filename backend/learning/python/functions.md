---
id: python-functions
title: Функции
category: python
section: Функции
order: 17
description: def, return, документация, чистые функции.
tags: [python, функции]
technologies: [Python]
related: [python-args, python-typing, python-testing]
---

# Функции

Функция — именованный шаг. Чистая функция (нет железа внутри) тестируется. I/O вынесите на края.

## Зачем это в робототехнической системе

`def wheel_omega(ticks, dt, cpr)` — чистая. `def set_pwm(channel, duty)` — эффект на драйвер.

## Синтаксис и контракт

```python
def clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))
```

## Типичные ошибки

- mutable default `def f(buf=[])`
- функции на 200 строк «и драйвер, и PID, и HTTP»

## В Architecture Canvas

Шаги алгоритма в инспекторе должны совпадать с функциями модуля, а не жить только в чате.

## Связанные разделы
- python-args
- python-typing
- python-testing
