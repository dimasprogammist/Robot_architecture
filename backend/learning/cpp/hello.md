---
id: cpp-hello
title: main, типы фиксированной ширины
category: cpp
section: Основы
order: 3
description: cstdint вместо голого int на железе.
tags: [cpp, основы]
technologies: [C++]
related: [cpp-struct, cpp-endian, cpp-headers]
---

# main, типы фиксированной ширины

На MCU размер int зависит от ABI. Регистры и протоколы описывайте `uint8_t`, `uint16_t`, `int32_t`.

## Зачем это в робототехнической системе

Кадр CAN 8 байт, ШИМ 16 бит таймера — типы в коде = типы в message_structure.

## Синтаксис и контракт

```cpp
#include <cstdint>
std::uint16_t pwm;
```

## Типичные ошибки

- int для сырого регистра 32 бит без комментария signed
- bool как 8 бит в packed-структуре без static_assert

## В Architecture Canvas

Таблица протокола и packed struct должны совпадать по именам полей.

## Связанные разделы
- cpp-struct
- cpp-endian
- cpp-headers
