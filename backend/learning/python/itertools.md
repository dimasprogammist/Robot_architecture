---
id: python-itertools
title: itertools
category: python
section: Итерации
order: 40
description: window, chain, cycle для буферов.
tags: [python, итерации]
technologies: [Python]
related: [python-generators, python-math, python-pid]
---

# itertools

`pairwise` для производной энкодера, `islice` для ограничения пакета MQTT.

## Зачем это в робототехнической системе

Окно из двух тиков → скорость. Не пишите свои ring-buffer, пока не нужны realtime-гарантии.

## Синтаксис и контракт

```python
from itertools import pairwise
omega = [(b-a)/dt for a, b in pairwise(ticks)]
```

## Типичные ошибки

- cycle бесконечный без break в проде
- tee и неожиданное потребление памяти

## В Architecture Canvas

Формулы одометрии — в алгоритме компонента Drive.

## Связанные разделы
- python-generators
- python-math
- python-pid
