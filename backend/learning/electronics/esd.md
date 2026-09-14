---
id: electronics-esd
title: ESD и защита входов
category: electronics
section: Надёжность
order: 12
description: TVS, серии резисторы.
tags: [electronics, надёжность]
technologies: [Electronics]
related: [electronics-levels, electronics-datasheet]
---

# ESD и защита входов

Разъёмы, которые трогает оператор. USB, кнопки, UART наружу.

## Зачем это в робототехнической системе

Сервисный разъём прошивки.

## Синтаксис и контракт

```text
TVS + 22R series
```

## Типичные ошибки

- голый GPIO на панель
- TVS с неверным напряжением

## В Architecture Canvas

Документ разъёмов. Требование живучести.

## Связанные разделы
- electronics-levels
- electronics-datasheet
