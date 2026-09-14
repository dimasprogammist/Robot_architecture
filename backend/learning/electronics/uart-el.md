---
id: electronics-uart-el
title: UART/RS-485 физика
category: electronics
section: Сигналы
order: 7
description: Трансиверы, земля, экран.
tags: [electronics, сигналы]
technologies: [Electronics]
related: [protocols-uart, protocols-modbus, electronics-ground]
---

# UART/RS-485 физика

TTL UART на метр — лотерея. RS-485 для шкафа. Общая земля или изолированный трансивер.

## Зачем это в робототехнической системе

ПЛК—шлюз, MCU—SBC в помехах мотора.

## Синтаксис и контракт

```text
A/B, termination 120
```

## Типичные ошибки

- USB-UART висящий без земли к плате
- RS-485 без GND/reference

## В Architecture Canvas

Протокол UART/Modbus RTU + физика в electronics notes.

## Связанные разделы
- protocols-uart
- protocols-modbus
- electronics-ground
