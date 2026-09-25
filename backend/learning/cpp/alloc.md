---
id: cpp-alloc
title: Аллокации и пулы
category: cpp
section: MCU
order: 43
description: Если куча всё же есть.
tags: [cpp, mcu]
technologies: [C++]
related: [cpp-embedded, cpp-dma, cpp-vector]
---

# Аллокации и пулы

Пул кадров фиксированного размера лучше общего heap. Фрагментация на неделе работы — классика.

## Зачем это в робототехнической системе

Пулл 8 кадров лидара на M7 с RTOS. Не malloc на каждый USB-пакет.

## Синтаксис и контракт

```cpp
static Frame pool[8];
```

## Типичные ошибки

- free не того указателя после DMA
- разный размер пула «на глаз» без измерения

## В Architecture Canvas

Пул — внутренность вложенного холста драйвера.

## Связанные разделы
- cpp-embedded
- cpp-dma
- cpp-vector
