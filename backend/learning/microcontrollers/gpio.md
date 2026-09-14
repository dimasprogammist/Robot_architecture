---
id: microcontrollers-gpio
title: GPIO
category: microcontrollers
section: Периферия
order: 2
description: Направление, скорость, подтяжки.
tags: [microcontrollers, периферия]
technologies: [Microcontrollers]
related: [electronics-pullup, cpp-isr, cpp-safety]
---

# GPIO

Пин — выход ШИМ/CS или вход ESTOP. После reset состояние опасно — задайте явно.

## Зачем это в робототехнической системе

ESTOP вход, STEP выход. Не оставляйте floating.

## Синтаксис и контракт

```c
pinMode analog: HAL GPIO_Init
```

## Типичные ошибки

- плавающий ESTOP
- светодиод и STEP на одном пине «временно»

## В Architecture Canvas

Таблица пинов — Documentation MCU. Связи к кнопке/драйверу.

## Связанные разделы
- electronics-pullup
- cpp-isr
- cpp-safety
