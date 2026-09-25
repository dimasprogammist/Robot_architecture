---
id: protocols-i2c
title: I²C
category: protocols
section: Полевые
order: 10
description: Адреса, pull-up, NACK.
tags: [protocols, полевые]
technologies: [Protocols]
related: [cpp-i2c, electronics-pullup, electronics-datasheet]
---

# I²C

7-bit addr, 4.7k pull-up типово, смотрите емкость шины. Clock stretch timeout.

## Зачем это в робототехнической системе

Несколько датчиков — уникальные адреса или мультиплексор как блок.

## Синтаксис и контракт

```text
addr 0x68
```

## Типичные ошибки

- два устройства 0x68
- нет timeout на SCL

## В Architecture Canvas

Шина как компонент или пучок связей I²C.

## Связанные разделы
- cpp-i2c
- electronics-pullup
- electronics-datasheet
