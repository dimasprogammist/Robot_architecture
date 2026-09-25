---
id: python-for
title: Цикл for и итераторы
category: python
section: Поток управления
order: 15
description: Обход коллекций, range, else у for.
tags: [python, поток управления]
technologies: [Python]
related: [python-while, python-itertools, python-generators]
---

# Цикл for и итераторы

`for` ходит по итератору. `for/else` срабатывает, если не было break — редко читают правильно.

## Зачем это в робототехнической системе

Опрос N сервоприводов. На timeout — break и переход в FAULT, не «молча пропустить».

## Синтаксис и контракт

```python
for servo in servos:
    servo.poll(timeout=0.02)
else:
    pass  # все ответили
```

## Типичные ошибки

- изменение списка во время for
- busy-loop без sleep в Linux-сервисе

## В Architecture Canvas

Цикл опроса опишите в алгоритме «control loop» блока контроллера.

## Связанные разделы
- python-while
- python-itertools
- python-generators
