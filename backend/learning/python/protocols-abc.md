---
id: python-protocols-abc
title: Protocol и ABC
category: python
section: ООП
order: 35
description: Интерфейсы без ложной иерархии.
tags: [python, ооп]
technologies: [Python]
related: [python-typing, python-testing, python-composition]
---

# Protocol и ABC

`typing.Protocol` задаёт «умеет send(frame)». MCU-заглушка и реальный CAN — две реализации.

## Зачем это в робототехнической системе

На CI гоняйте навигацию против FakeBus. На изделии — SocketCAN. Архитектура не меняется.

## Синтаксис и контракт

```python
class Bus(Protocol):
    def send(self, fid: int, data: bytes) -> None: ...
```

## Типичные ошибки

- ABC с обязательным наследованием там, где достаточно Protocol
- интерфейс из 30 методов

## В Architecture Canvas

Интерфейс компонента = поле interfaces + API. В коде — Protocol с тем же именем.

## Связанные разделы
- python-typing
- python-testing
- python-composition
