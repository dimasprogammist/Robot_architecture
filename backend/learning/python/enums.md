---
id: python-enums
title: Enum и режимы
category: python
section: Типы+
order: 37
description: Режимы, коды ошибок, не магические строки.
tags: [python, типы+]
technologies: [Python]
related: [python-state-machine, python-if, python-json]
---

# Enum и режимы

`class Mode(StrEnum): IDLE=... FAULT=...` сериализуется в JSON и совпадает с state machine.

## Зачем это в робототехнической системе

Операторский UI и бэкенд должны разделять один словарь режимов. Расхождение — опасный баг.

## Синтаксис и контракт

```python
class Mode(StrEnum):
    IDLE = 'IDLE'
    AUTO = 'AUTO'
    FAULT = 'FAULT'
```

## Типичные ошибки

- сравнение строк 'fault'/'FAULT'
- enum в MCU другой, чем в Python, без таблицы соответствий

## В Architecture Canvas

Состояния алгоритма = Enum. Требование: «неизвестное состояние → FAULT».

## Связанные разделы
- python-state-machine
- python-if
- python-json
