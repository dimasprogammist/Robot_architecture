---
id: cpp-expected
title: std::expected / коды возврата
category: cpp
section: STL
order: 14
description: Ошибки без исключений в embedded.
tags: [cpp, stl]
technologies: [C++]
related: [cpp-optional, cpp-exceptions, cpp-i2c]
---

# std::expected / коды возврата

На MCU исключения часто выключены. `expected<T, Err>` или `bool + out` — явный контракт.

## Зачем это в робототехнической системе

`read_reg` возвращает Err::Nack. Выше — retry как в протоколе, не как «ну попробуем ещё».

## Синтаксис и контракт

```cpp
enum class Err { Ok, Nack, Crc, Timeout };
Err read_reg(uint8_t a, uint16_t& v);
```

## Типичные ошибки

- bool без причины отказа
- исключения при -fno-exceptions «на потом»

## В Architecture Canvas

Поле retry/timeout протокола = политика этого API.

## Связанные разделы
- cpp-optional
- cpp-exceptions
- cpp-i2c
