---
id: python-classes
title: Классы
category: python
section: ООП
order: 31
description: Состояние сервиса, драйверы устройств.
tags: [python, ооп]
technologies: [Python]
related: [python-composition, python-protocols-abc, python-dataclasses]
---

# Классы

Класс драйвера инкапсулирует порт и протокол. Класс домена (`Pose`) — данные. Не делайте God-object `Robot` на 2к строк.

## Зачем это в робототехнической системе

`ImuDriver`, `MotorGateway`, `Supervisor` — три блока на холсте и три класса на границах.

## Синтаксис и контракт

```python
class MotorGateway:
    def __init__(self, proto):
        self.proto = proto
    def set_omega(self, left, right):
        self.proto.send(left, right)
```

## Типичные ошибки

- логика навигации внутри драйвера UART
- публичные поля порта извне

## В Architecture Canvas

Имя класса ≈ имя компонента. Вложенная архитектура ≈ пакет классов.

## Связанные разделы
- python-composition
- python-protocols-abc
- python-dataclasses
