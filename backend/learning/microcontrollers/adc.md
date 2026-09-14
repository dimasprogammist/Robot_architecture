---
id: microcontrollers-adc
title: АЦП
category: microcontrollers
section: Периферия
order: 3
description: Опора, шум, единицы.
tags: [microcontrollers, периферия]
technologies: [Microcontrollers]
related: [cpp-dma, python-math]
---

# АЦП

counts → вольты → амперы шунта. Фильтр. Не верьте одному сэмплу тока.

## Зачем это в робототехнической системе

Ток мотора, терморезистор, батарея.

## Синтаксис и контракт

```c
uint16_t raw; float i = (raw * vref / 4095) / r_shunt;
```

## Типичные ошибки

- игнор vref
- земля АЦП рядом с силовым ключом без фильтра

## В Architecture Canvas

Формулы в алгоритме MCU. Шунт — mechanical/electronics notes.

## Связанные разделы
- cpp-dma
- python-math
