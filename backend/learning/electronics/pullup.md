---
id: electronics-pullup
title: Подтяжки
category: electronics
section: Практика
order: 5
description: I²C, кнопки, ESTOP.
tags: [electronics, практика]
technologies: [Electronics]
related: [cpp-i2c, cpp-safety]
---

# Подтяжки

I²C без pull-up «иногда работает на столе». ESTOP: определите NC/NO и безопасное состояние обрыва.

## Зачем это в робототехнической системе

Кнопка ESTOP — аппаратно разрывает питание драйвера, логический пин — дубль.

## Синтаксис и контракт

```text
4.7k к 3.3 на SDA/SCL
```

## Типичные ошибки

- внутренняя подтяжка MCU на длинной I²C
- ESTOP с подтяжкой, которая держит RUN при обрыве

## В Architecture Canvas

Требование безопасного состояния обрыва. Схема в notes/файле.

## Связанные разделы
- cpp-i2c
- cpp-safety
