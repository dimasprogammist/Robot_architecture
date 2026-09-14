---
id: electronics-psu
title: Питание
category: electronics
section: Сила
order: 10
description: Бюджет, sequency, UVLO.
tags: [electronics, сила]
technologies: [Electronics]
related: [electronics-ohm, linux-disks, electronics-intro]
---

# Питание

Сначала логика, потом драйвера — или наоборот по datasheet. UVLO чтобы не дёргаться на просадке.

## Зачем это в робототехнической системе

АКБ 6S, DC-DC 5 В/3.3 В, 24 В приводы.

## Синтаксис и контракт

```text
I_budget = sum(I_max)*margin
```

## Типичные ошибки

- питание Pi от того же узла, что стартует мотор, без ёмкости
- нет предохранителя

## В Architecture Canvas

Блок PSU. Напряжения в Hardware Data всех потребителей.

## Связанные разделы
- electronics-ohm
- linux-disks
- electronics-intro
