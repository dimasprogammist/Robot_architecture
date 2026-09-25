---
id: cpp-testing
title: GoogleTest / Catch2
category: cpp
section: Качество
order: 40
description: Парсер, PID, автомат без платы.
tags: [cpp, качество]
technologies: [C++]
related: [cpp-ub, python-testing, cpp-state-machine]
---

# GoogleTest / Catch2

80% прошивки можно тестировать: math, fsm, protocol. HAL мокайте.

## Зачем это в робототехнической системе

`TEST(Crc, MatchesPython)` — золотой стандарт общего протокола.

## Синтаксис и контракт

```cpp
EXPECT_EQ(crc16(buf), 0x1D0F);
```

## Типичные ошибки

- тесты, завязанные на реальный ST-Link в unit
- золотые файлы без комментария протокола

## В Architecture Canvas

Связь требования REQ и теста. На холсте MCU.requirement_ids.

## Связанные разделы
- cpp-ub
- python-testing
- cpp-state-machine
