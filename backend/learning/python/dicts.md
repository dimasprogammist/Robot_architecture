---
id: python-dicts
title: Словари
category: python
section: Коллекции
order: 11
description: Ключ-значение: конфиг, регистры, JSON.
tags: [python, коллекции]
technologies: [Python]
related: [python-json, python-config]
---

# Словари

Словарь — хеш-таблица. Ключ должен быть хешируемым. Конфиг робота часто начинают как dict, затем вырастает в схему.

## Зачем это в робототехнической системе

Карта `joint_name -> present_position`. Промах ключа — KeyError, на манипуляторе это стоп.

## Синтаксис и контракт

```python
joints = {'left_wheel': 0.0, 'right_wheel': 0.0}
joints['left_wheel'] += 0.01
```

## Типичные ошибки

- глубже 3 уровней вложенности без схемы
- json с числовыми ключами-строками

## В Architecture Canvas

Конфиг вынесите в документ компонента. Для продакшена — таблица/YAML со схемой, не «магический dict».

## Связанные разделы
- python-json
- python-config
