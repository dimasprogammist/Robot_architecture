---
id: linux-realtime
title: Realtime Linux: ожидания
category: linux
section: Надёжность
order: 12
description: PREEMPT_RT, isolcpus, нет чуда.
tags: [linux, надёжность]
technologies: [Linux]
related: [linux-intro, cpp-embedded, robotics-control-split]
---

# Realtime Linux: ожидания

Можно улучшить джиттер шлюза, нельзя честно заменить MCU на Pi для тока мотора.

## Зачем это в робототехнической системе

Если нужен 1 кГц PWM — MCU. Linux — планирование, зрение, сеть.

## Синтаксис и контракт

```bash
# isolcpus=3 nohz_full=3 в cmdline — только после измерения
```

## Типичные ошибки

- маркетинг «realtime Pi» как архитектура привода
- SCHED_FIFO без понимания инверсии

## В Architecture Canvas

Разделение MCU/SBC на холсте — главное архитектурное решение робота.

## Связанные разделы
- linux-intro
- cpp-embedded
- robotics-control-split
