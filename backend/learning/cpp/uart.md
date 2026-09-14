---
id: cpp-uart
title: UART в C++
category: cpp
section: Шины
order: 48
description: Регистры, DMA, кадры.
tags: [cpp, шины]
technologies: [C++]
related: [python-serial, cpp-struct, cpp-dma]
---

# UART в C++

Как в Python: поток байт. State machine: Hunt magic → len → payload → crc.

## Зачем это в робототехнической системе

Связь со шлюзом Python. Одинаковый документ кадра. Тест CRC общий.

## Синтаксис и контракт

```cpp
enum { Hunt, Len, Body, Crc };
```

## Типичные ошибки

- блокирующий wait в тике на RX
- разный magic на концах

## В Architecture Canvas

Протокол UART на ребре MCU—Gateway. Алгоритм FSM — у обоих, но реализация своя.

## Связанные разделы
- python-serial
- cpp-struct
- cpp-dma
