---
id: microcontrollers-intro
title: MCU vs SBC vs PLC
category: microcontrollers
section: Выбор
order: 1
description: Кто владеет ШИМ.
tags: [microcontrollers, выбор]
technologies: [Microcontrollers]
related: [linux-realtime, robotics-control-split]
---

# MCU vs SBC vs PLC

MCU — детерминизм и GPIO. SBC — Linux. PLC — заводская экосистема. Роботу часто MCU+SBC.

## Зачем это в робототехнической системе

STM32 PID, Pi зрение, иногда Siemens для клетки безопасности.

## Синтаксис и контракт

```c
PWM @ MCU, SLAM @ SBC
```

## Типичные ошибки

- один Pi на ток мотора 20 кГц без доказательства
- ПЛК на CV

## В Architecture Canvas

Разные блоки HARDWARE. Связи между ними обязательны.

## Связанные разделы
- linux-realtime
- robotics-control-split
