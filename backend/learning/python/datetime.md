---
id: python-datetime
title: Время: datetime и monotonic
category: python
section: Численность
order: 43
description: Стенки часов vs длительности.
tags: [python, численность]
technologies: [Python]
related: [python-pid, python-logging]
---

# Время: datetime и monotonic

Интервалы цикла — `time.monotonic()`. Штампы для логов/БД — UTC aware datetime. Никогда не меряйте dt через wall clock (NTP прыгнет).

## Зачем это в робототехнической системе

PID и таймаут Watchdog считают monotonic. Операторский график — UTC.

## Синтаксис и контракт

```python
t0 = time.monotonic()
dt = time.monotonic() - t0
```

## Типичные ошибки

- datetime.now() naive
- сравнение aware и naive

## В Architecture Canvas

В таблице events колонка timestamptz. В алгоритме PID — monotonic dt.

## Связанные разделы
- python-pid
- python-logging
