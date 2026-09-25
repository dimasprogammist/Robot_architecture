---
id: python-exceptions
title: Исключения
category: python
section: Надёжность
order: 23
description: raise, except, finally, цепочки ошибок.
tags: [python, надёжность]
technologies: [Python]
related: [python-logging, python-context, python-testing]
---

# Исключения

Исключение — сигнал сбоя. На контуре безопасности не глотайте `except Exception: pass`.

## Зачем это в робототехнической системе

Обрыв USB-камеры: исключение → FAULT → безопасный останов, событие в лог и MQTT `robot/fault`.

## Синтаксис и контракт

```python
try:
    cam.read()
except CameraTimeout as e:
    raise Fault('camera') from e
```

## Типичные ошибки

- голый except
- использование исключений для нормального потока «цели нет»

## Связанные разделы
- python-logging
- python-context
- python-testing
