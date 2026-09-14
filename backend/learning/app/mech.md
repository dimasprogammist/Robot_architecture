---
id: app-mech
title: Механическая архитектура
category: app
section: Механика
order: 14
description: Те же вложенные холсты.
tags: [app, механика]
technologies: [Architecture Canvas]
related: [robotics-mechanics, app-nested, app-bom]
---

# Механическая архитектура

Раздел Механика фильтрует библиотеку. Поля материала, массы, qty. Double-click в сборку.

## Зачем это в робототехнической системе

Drive System → Left Wheel Assembly.

## Синтаксис и контракт

```text
Вкладка Механика в инспекторе
```

## Типичные ошибки

- сборка без деталей внутри
- qty=1 при 4 колёсах без мысли

## В Architecture Canvas

BOM собирается из HARDWARE+MECHANICS.

## Связанные разделы
- robotics-mechanics
- app-nested
- app-bom
