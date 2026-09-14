---
id: electronics-proto
title: Макет vs изделие
category: electronics
section: Надёжность
order: 13
description: Навесное не едет в поле.
tags: [electronics, надёжность]
technologies: [Electronics]
related: [robotics-mechanics, app-bom, electronics-motor]
---

# Макет vs изделие

Breadboard не для моторов. Изделие: PCB, крепёж, strain relief кабеля.

## Зачем это в робототехнической системе

Стенд ок. Робот — BOM и механика разъёмов.

## Синтаксис и контракт

```text
strain relief, connector P/N
```

## Типичные ошибки

- макетная плата в корпусе робота
- кабель без петли компенсации изгиба

## В Architecture Canvas

Mechanical assembly разъёма + part number в BOM.

## Связанные разделы
- robotics-mechanics
- app-bom
- electronics-motor
