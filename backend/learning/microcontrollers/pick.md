---
id: microcontrollers-pick
title: Как выбрать MCU
category: microcontrollers
section: Выбор
order: 12
description: FPU, CAN, таймеры, RAM.
tags: [microcontrollers, выбор]
technologies: [Microcontrollers]
related: [electronics-datasheet, robotics-overview]
---

# Как выбрать MCU

Нужен CAN+3 таймера encoder+FPU — не «самый дешёвый Arduino».

## Зачем это в робототехнической системе

Сопоставьте периферию с холстом связей.

## Синтаксис и контракт

```c
таблица: CAN, TIM, ADC, USB, RAM
```

## Типичные ошибки

- выбор по цене модуля без карты пинов
- нехватка таймеров «потом»

## В Architecture Canvas

Hardware catalog Raspberry/STM32/ESP. Пины в docs.

## Связанные разделы
- electronics-datasheet
- robotics-overview
