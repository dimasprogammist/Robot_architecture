---
id: robotics-overview
title: Стек робота
category: robotics
section: Карта
order: 1
description: Механика → сила → MCU → SBC → UI.
tags: [robotics, карта]
technologies: [Robotics]
related: [robotics-control-split, app-nested]
---

# Стек робота

Каждый слой — холст. Не пытайтесь одним прямоугольником «Robot».

## Зачем это в робототехнической системе

Учебный шаблон «Робот» в Canvas — старт, его раскладывают вложенностью.

## Синтаксис и контракт

```text
layers: mech, power, mcu, sbc, cloud
```

## Типичные ошибки

- один блок Robot без внутренностей
- зрение внутри PID MCU

## В Architecture Canvas

Создайте проект из шаблона Робот и провалитесь в контроллер.

## Связанные разделы
- robotics-control-split
- app-nested
