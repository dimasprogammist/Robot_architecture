---
id: cpp-arrays
title: Массивы и C-буферы
category: cpp
section: Память
order: 8
description: Фиксированный кадр, DMA, без вектора в ISR.
tags: [cpp, память]
technologies: [C++]
related: [cpp-span, cpp-dma, cpp-freertos]
---

# Массивы и C-буферы

На MCU кадр фиксирован: `uint8_t rx[64]`. `std::vector` в прерывании — путь в HardFault.

## Зачем это в робототехнической системе

USART DMA circular buffer — массив в BSS, индексы head/tail атомарно/volatile по правилам RTOS.

## Синтаксис и контракт

```cpp
std::uint8_t rx[64];
volatile std::uint16_t head;
```

## Типичные ошибки

- возврат указателя на стековый массив
- vector.reserve в ISR «чтобы быстрее»

## В Architecture Canvas

Размер кадра — в протоколе. Буфер — в алгоритме шлюза.

## Связанные разделы
- cpp-span
- cpp-dma
- cpp-freertos
