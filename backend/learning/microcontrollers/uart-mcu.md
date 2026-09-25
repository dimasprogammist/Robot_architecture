---
id: microcontrollers-uart-mcu
title: UART на MCU
category: microcontrollers
section: Периферия
order: 5
description: DMA vs IRQ.
tags: [microcontrollers, периферия]
technologies: [Microcontrollers]
related: [cpp-uart, cpp-dma, python-serial]
---

# UART на MCU

DMA circular + idle line — удобный кадр. Не poll в 1 кГц без нужды.

## Зачем это в робототехнической системе

Связь со шлюзом.

## Синтаксис и контракт

```c
USART + DMA RX
```

## Типичные ошибки

- потерять байт без overrun handling
- разный baud

## В Architecture Canvas

Протокол UART. Алгоритм DMA idle.

## Связанные разделы
- cpp-uart
- cpp-dma
- python-serial
