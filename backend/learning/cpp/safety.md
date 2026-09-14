---
id: cpp-safety
title: Функциональная безопасность (практика)
category: cpp
section: Управление
order: 58
description: Не IEC 61508 целиком, но дисциплина.
tags: [cpp, управление]
technologies: [C++]
related: [cpp-atomics, cpp-watchdog, robotics-safety]
---

# Функциональная безопасность (практика)

Два канала стопа: проводной ESTOP снимает PWM в ISR; логический FAULT гасит уставки. Не один MQTT-топик.

## Зачем это в робототехнической системе

На холсте ESTOP — отдельный блок/связь GPIO. Требование «движение невозможно при разомкнутом контуре».

## Синтаксис и контракт

```cpp
if (estop.load()) { pwm_coast(); return; }
```

## Типичные ошибки

- программный стоп без аппаратного
- тест ESTOP только в симе

## В Architecture Canvas

Requirements с priority must на ESTOP. Связь с MCU и драйвером мотора.

## Связанные разделы
- cpp-atomics
- cpp-watchdog
- robotics-safety
