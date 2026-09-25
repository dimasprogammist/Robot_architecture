---
id: cpp-spi
title: SPI
category: cpp
section: Шины
order: 49
description: Режим, CS, транзакции.
tags: [cpp, шины]
technologies: [C++]
related: [cpp-raii, electronics-datasheet, cpp-i2c]
---

# SPI

IMU SPI: mode, max Hz из datasheet. CS — RAII транзакция. Не отпускать CS посередине регистра.

## Зачем это в робототехнической системе

Блок IMU на холсте, связь SPI с MCU. Datasheet — Documentation link.

## Синтаксис и контракт

```cpp
cs_low();
spi_txrx(reg | 0x80);
cs_high();
```

## Типичные ошибки

- неверный SPI mode 0/3
- слишком длинные провода без проверки timing

## Связанные разделы
- cpp-raii
- electronics-datasheet
- cpp-i2c
