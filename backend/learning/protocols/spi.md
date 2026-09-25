---
id: protocols-spi
title: SPI
category: protocols
section: Полевые
order: 9
description: Четыре провода, режимы 0–3.
tags: [protocols, полевые]
technologies: [Protocols]
related: [cpp-spi, electronics-datasheet, cpp-raii]
---

# SPI

CLK/MOSI/MISO/CS. Частота из datasheet. Один мастер.

## Зачем это в робототехнической системе

IMU, энкодер, SD. Не «SPI в облако».

## Синтаксис и контракт

```text
mode 3, 8 MHz
```

## Типичные ошибки

- не тот mode
- CS общим без транзакций

## В Architecture Canvas

Протокол SPI. Datasheet IMU в docs.

## Связанные разделы
- cpp-spi
- electronics-datasheet
- cpp-raii
