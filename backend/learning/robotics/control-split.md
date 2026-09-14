---
id: robotics-control-split
title: Где какой контур
category: robotics
section: Управление
order: 2
description: Частоты и ответственность.
tags: [robotics, управление]
technologies: [Robotics]
related: [python-pid, cpp-pid, linux-realtime]
---

# Где какой контур

Ток 10–20 кГц MCU. Скорость 1 кГц MCU. Поза/план 10–50 Гц SBC. Миссия 1 Гц UI.

## Зачем это в робототехнической системе

Нарушение — джиттер и опасность.

## Синтаксис и контракт

```text
loop rates table
```

## Типичные ошибки

- планировщик на MCU
- ток на Python

## В Architecture Canvas

Алгоритмы на соответствующих блоках. Связи setpoint/feedback.

## Связанные разделы
- python-pid
- cpp-pid
- linux-realtime
