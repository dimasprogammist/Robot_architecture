---
id: python-decorators
title: Декораторы
category: python
section: Функции
order: 20
description: Обёртки, retries, timing, permission.
tags: [python, функции]
technologies: [Python]
related: [python-functions, python-logging, python-exceptions]
---

# Декораторы

Декоратор добавляет политику: повтор UART, таймаут, логирование. Не прячьте в нём бизнес-ветвление режима.

## Зачем это в робототехнической системе

`@retry(timeout=0.2, tries=3)` на `read_register` Modbus. На стоп-кнопку retry быть не должно.

## Синтаксис и контракт

```python
def timed(fn):
    def wrap(*a, **k):
        t0 = time.monotonic()
        try:
            return fn(*a, **k)
        finally:
            log.debug('dt=%s', time.monotonic()-t0)
    return wrap
```

## Типичные ошибки

- декоратор, глотающий KeyboardInterrupt
- стек из 6 декораторов на один handler

## В Architecture Canvas

Политики retry опишите в протоколе (timeout, retry), декоратор только реализует контракт.

## Связанные разделы
- python-functions
- python-logging
- python-exceptions
