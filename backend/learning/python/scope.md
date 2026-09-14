---
id: python-scope
title: Области видимости и closures
category: python
section: Функции
order: 19
description: LEGB, global, nonlocal.
tags: [python, функции]
technologies: [Python]
related: [python-functions, python-classes, python-mqtt]
---

# Области видимости и closures

Замыкание захватывает переменную, не значение момента. В цикле колбэков это классический баг.

## Зачем это в робототехнической системе

Подписки MQTT `for topic in topics: client.on(topic, lambda: handle(topic))` — все увидят последний topic.

## Синтаксис и контракт

```python
def bind(topic):
    def _h(msg):
        handle(topic, msg)
    return _h
```

## Типичные ошибки

- global для состояния робота
- лямбда в цикле без default-аргумента

## В Architecture Canvas

Состояние держите в объекте сервиса или очереди, не в global.

## Связанные разделы
- python-functions
- python-classes
- python-mqtt
