---
id: electronics-intro
title: Электроника как часть модели
category: electronics
section: Основы
order: 1
description: Не «черный ящик с проводами».
tags: [electronics, основы]
technologies: [Electronics]
related: [electronics-psu, electronics-ground, electronics-datasheet]
---

# Электроника как часть модели

Напряжения, земли, бюджет мощности, уровни GPIO — иначе протоколы в Canvas врут.

## Зачем это в робототехнической системе

24 В силовая, 5 В логика, 3.3 В MCU. DC-DC в BOM.

## Синтаксис и контракт

```text
P = I * V
```

## Типичные ошибки

- питать мотор и MCU от одной неразвязанной линии без фильтра
- игнор datasheet

## В Architecture Canvas

Hardware Data: voltage. PSU — блок. Связи питания можно описать notes, позже electrical kind.

## Связанные разделы
- electronics-psu
- electronics-ground
- electronics-datasheet
