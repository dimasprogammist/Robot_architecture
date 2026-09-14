---
id: cpp-i2c
title: I²C
category: cpp
section: Шины
order: 50
description: NACK, clock stretch, несколько устройств.
tags: [cpp, шины]
technologies: [C++]
related: [electronics-pullup, cpp-expected, cpp-spi]
---

# I²C

Адрес 7 bit. Pull-up — электроника, не «магия кода». Timeout обязателен: slave может зажать SCL.

## Зачем это в робототехнической системе

Датчики на одной шине — отдельные блоки, одна связь I²C к MCU (или явно bus component).

## Синтаксис и контракт

```cpp
if (!i2c_write(addr, reg, val)) return Err::Nack;
```

## Типичные ошибки

- игнор NACK
- два мастера без политики

## В Architecture Canvas

Если много slave — покажите шину как NETWORK/компонент шины, не прямую кашу рёбер.

## Связанные разделы
- electronics-pullup
- cpp-expected
- cpp-spi
