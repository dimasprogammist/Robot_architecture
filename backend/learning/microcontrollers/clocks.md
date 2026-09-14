---
id: microcontrollers-clocks
title: Тактирование и power
category: microcontrollers
section: Архитектура MCU
order: 8
description: RCC, PLL, sleep.
tags: [microcontrollers, архитектура mcu]
technologies: [Microcontrollers]
related: [electronics-psu, cpp-hal]
---

# Тактирование и power

Неверная частота — «случайный» baud. Sleep не для привода под нагрузкой без политики.

## Зачем это в робототехнической системе

Кварц, PLL до 168 МГц, шины APB для таймеров.

## Синтаксис и контракт

```c
SystemCoreClock
```

## Типичные ошибки

- UART baud посчитан от другой частоты
- выключить таймер PWM в sleep

## В Architecture Canvas

Hardware notes MCU: clock source.

## Связанные разделы
- electronics-psu
- cpp-hal
