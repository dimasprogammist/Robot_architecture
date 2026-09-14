---
id: cpp-dma
title: DMA
category: cpp
section: MCU
order: 46
description: Память, кэш, согласованность.
tags: [cpp, mcu]
technologies: [C++]
related: [cpp-isr, cpp-arrays]
---

# DMA

DMA пишет буфер, CPU читает. На Cortex-M7 смотрите D-cache. Align буферов.

## Зачем это в робототехнической системе

ADC + DMA для тока. PID читает последнее валидное значение по флагу half/full.

## Синтаксис и контракт

```cpp
HAL_ADC_Start_DMA(&hadc1, buf, N);
```

## Типичные ошибки

- читать буфер DMA кэшированным без invalidate
- перекрыть буфер стеком

## В Architecture Canvas

Внутренний блок ADC/DMA во вложенном холсте MCU.

## Связанные разделы
- cpp-isr
- cpp-arrays
