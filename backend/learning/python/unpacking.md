---
id: python-unpacking
title: Распаковка, * и _
category: python
section: Коллекции
order: 13
description: Удобный разбор последовательностей.
tags: [python, коллекции]
technologies: [Python]
related: [python-bytes, python-exceptions, python-struct]
---

# Распаковка, * и _

`head, *rest = frame` читаемее срезов, если формат стабилен.

## Зачем это в робототехнической системе

Кадр: sync, len, *payload, crc. Не распаковывайте, пока не проверили длину.

## Синтаксис и контракт

```python
sync, length, *payload, crc = frame
if length != len(payload):
    raise ValueError('len')
```

## Типичные ошибки

- распаковка без проверки длины
- игнор ошибок через голый `_` в протоколе

## В Architecture Canvas

Алгоритм парсера: шаги «проверить длину» → «распаковать» → «CRC».

## Связанные разделы
- python-bytes
- python-exceptions
- python-struct
