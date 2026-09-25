---
id: electronics-adc-el
title: Цепи АЦП
category: electronics
section: Сигналы
order: 6
description: RC, опора, дифференциальный шунт.
tags: [electronics, сигналы]
technologies: [Electronics]
related: [electronics-ground, electronics-motor]
---

# Цепи АЦП

Фильтр до ADC, Kelvin к шунту, не гонять силовой ток через землю АЦП.

## Зачем это в робототехнической системе

Ток колеса для защиты.

## Синтаксис и контракт

```text
RC 1k+100n как старт, потом посчитайте
```

## Типичные ошибки

- длинная аналоговая рядом с PWM без экрана
- опора от шумного 3.3

## В Architecture Canvas

Алгоритм ADC в MCU + notes цепи.

## Связанные разделы
- electronics-ground
- electronics-motor
