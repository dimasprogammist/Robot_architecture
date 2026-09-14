---
id: cpp-endian
title: Порядок байт
category: cpp
section: Данные
order: 24
description: Little-endian MCU vs сеть.
tags: [cpp, данные]
technologies: [C++]
related: [cpp-struct, cpp-modbus, python-struct]
---

# Порядок байт

ARM обычно LE. Протоколы «как в регистре» vs big-endian Modbus. Функции `htons`/свои load_le.

## Зачем это в робототехнической системе

Modbus: big-endian регистры. Внутренний UART к своему MCU: LE. Шлюз конвертирует явно.

## Синтаксис и контракт

```cpp
inline uint16_t rd_be(const uint8_t* p){ return (uint16_t(p[0])<<8)|p[1]; }
```

## Типичные ошибки

- смешать BE/LE в одном кадре без таблицы
- кастить struct на сеть

## В Architecture Canvas

В протоколе поле encoding/endian. Связи Modbus и UART — разные цвета и разные правила.

## Связанные разделы
- cpp-struct
- cpp-modbus
- python-struct
