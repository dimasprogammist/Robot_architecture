---
id: python-typing
title: Аннотации типов
category: python
section: Типы+
order: 36
description: pyright/mypy, Optional, list[str].
tags: [python, типы+]
technologies: [Python]
related: [python-functions, python-dataclasses, python-testing]
---

# Аннотации типов

Типы ловят путаницу м и мм на границе функций. Это дешёвая страховка для робототехники.

## Зачем это в робототехнической системе

`def to_pwm(omega_rad_s: float) -> int` нельзя случайно скормить ticks.

## Синтаксис и контракт

```python
def to_pwm(omega_rad_s: float) -> int:
    return int(clamp(omega_rad_s / MAX_OMEGA, -1, 1) * 1000)
```

## Типичные ошибки

- Any как способ «закрыть глаза»
- типы только в публичном API, внутри каша — лучше чем ничего, но границы важнее

## В Architecture Canvas

В документации API приведите сигнатуры. AI-экспорт тогда не выдумает единицы.

## Связанные разделы
- python-functions
- python-dataclasses
- python-testing
