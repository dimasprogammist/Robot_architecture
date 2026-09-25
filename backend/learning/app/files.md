---
id: app-files
title: Файлы и 3D-печать
category: app
section: Механика
order: 16
description: Метаданные и печать.
tags: [app, механика]
technologies: [Architecture Canvas]
related: [app-stl, app-bom, electronics-proto]
---

# Файлы и 3D-печать

Имя, тип, размер, дата, version. Опционально nozzle, layer, infill во вкладке механики.

## Зачем это в робототехнической системе

Кронштейн печати.

## Синтаксис и контракт

```text
3D Printing fields
```

## Типичные ошибки

- печать без материала в BOM
- версия файла не совпадает с version детали

## В Architecture Canvas

PrintSettings в MechanicalData.

## Связанные разделы
- app-stl
- app-bom
- electronics-proto
