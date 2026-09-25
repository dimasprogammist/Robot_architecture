---
id: app-bom
title: BOM
category: app
section: Механика
order: 17
description: Инженерный список, не склад.
tags: [app, механика]
technologies: [Architecture Canvas]
related: [app-mech, electronics-motor, app-export-json]
---

# BOM

Раздел BOM: имя, категория, производитель, артикул, qty, заметки. Берётся из модели.

## Зачем это в робототехнической системе

Закупка прототипа.

## Синтаксис и контракт

```text
Навигация → BOM
```

## Типичные ошибки

- вести Excel параллельно как истину
- нет part number у критичных деталей

## В Architecture Canvas

Экспорт JSON содержит bom. AI — в составе полного экспорта.

## Связанные разделы
- app-mech
- electronics-motor
- app-export-json
