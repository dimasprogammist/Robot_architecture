---
id: cpp-hal
title: HAL и порты
category: cpp
section: MCU
order: 44
description: Слой абстракции, не религия.
tags: [cpp, mcu]
technologies: [C++]
related: [cpp-classes, cpp-macros, cpp-isr]
---

# HAL и порты

HAL от вендора удобен. Не размазывайте регистры по app. Порт: `gpio_set`, `tim_set_ccr`.

## Зачем это в робототехнической системе

App считает омы, HAL пишет CCR. Смена MCU — замена hal/, не supervisor.

## Синтаксис и контракт

```cpp
void pwm_set(int ch, uint16_t ccr);
```

## Типичные ошибки

- app включает биты RCC вперемешку с PID
- HAL-callback ад без очереди в app

## В Architecture Canvas

Вложенный холст MCU: HAL vs App. Связь внутренняя, но семантическая.

## Связанные разделы
- cpp-classes
- cpp-macros
- cpp-isr
