---
id: python-lists
title: Списки
category: python
section: Коллекции
order: 9
description: Упорядоченные буферы измерений.
tags: [python, коллекции]
technologies: [Python]
related: [python-comprehensions, python-numpy]
---

# Списки

Список — динамический массив ссылок. Срезы копируют. Для очереди команд лучше `deque`.

## Зачем это в робототехнической системе

Окно последних 50 токов мотора для защиты по I²t. Не используйте list.pop(0) в горячем цикле.

## Синтаксис и контракт

```python
window = []
def push(i):
    window.append(i)
    if len(window) > 50:
        window.pop(0)
```

## Типичные ошибки

- pop(0) на больших списках
- хранить numpy-матрицы как вложенные list без нужды

## В Architecture Canvas

Буфер телеметрии опишите во входах/выходах компонента, не только в коде.

## Связанные разделы
- python-comprehensions
- python-numpy
