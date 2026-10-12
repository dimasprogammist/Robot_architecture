---
id: python-tuples
title: Кортежи и распаковка
category: python
section: Коллекции
order: 10
description: Неизменяемые записи координат.
tags: [python, коллекции]
technologies: [Python]
related: [python-dataclasses, python-unpacking]
---

# Кортежи и распаковка

Кортеж — фиксированная запись. Удобен для `(x, y, yaw)`, но для публичного API лучше dataclass.

## Зачем это в робототехнической системе

Возврат из одометрии: `return x, y, yaw`. На границе сервисов именованные поля надёжнее.

## Синтаксис и контракт

```python
x, y, yaw = odometry()
point = (x, y)
```

## Типичные ошибки

- кортеж из 8 безымянных чисел
- мутировать «кортеж» ожидая list

## Связанные разделы
- python-dataclasses
- python-unpacking
