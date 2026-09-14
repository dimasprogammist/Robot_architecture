---
id: electronics-motor
title: Силовая электроника привода
category: electronics
section: Сила
order: 9
description: Драйвер, TVS, питание, тормоз.
tags: [electronics, сила]
technologies: [Electronics]
related: [electronics-psu, robotics-actuators]
---

# Силовая электроника привода

Стартовый ток, рекуперация, тормозной резистор. MCU не «качает мотор пином» кроме маленьких DC.

## Зачем это в робототехнической системе

Колесо, манипулятор. Блок Motor Controller.

## Синтаксис и контракт

```text
VMOT, nFAULT, nSLEEP
```

## Типичные ошибки

- общий предохранитель логики и силы
- рекуперация без куда деть энергию

## В Architecture Canvas

BOM: драйвер, предохранитель, конденсаторы. Связь MCU PWM/CAN.

## Связанные разделы
- electronics-psu
- robotics-actuators
