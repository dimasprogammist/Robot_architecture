---
id: python-copy
title: Копии: copy и deepcopy
category: python
section: Память
order: 41
description: Когда разделять буфер нельзя.
tags: [python, память]
technologies: [Python]
related: [python-threading, python-lists, python-dataclasses]
---

# Копии: copy и deepcopy

Поток UI забирает снимок телеметрии. Control loop продолжает писать. Без копии — гонка.

## Зачем это в робототехнической системе

Снимок `telemetry.copy()` в очередь. Deepcopy облака точек дорогой — копируйте нужные поля.

## Синтаксис и контракт

```python
import copy
snap = copy.copy(state)
```

## Типичные ошибки

- deepcopy всего мира 100 Гц
- считать slice списка копией вложенных dict

## В Architecture Canvas

Граница потоков = очередь сообщений на холсте (data_flow), не общая переменная «на честном слове».

## Связанные разделы
- python-threading
- python-lists
- python-dataclasses
