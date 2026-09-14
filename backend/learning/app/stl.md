---
id: app-stl
title: STL и 3D
category: app
section: Механика
order: 15
description: Файлы на детали, preview STL.
tags: [app, механика]
technologies: [Architecture Canvas]
related: [app-files, app-mech, git-lfs]
---

# STL и 3D

Вкладка Файлы: STL/STEP/OBJ. Просмотр STL (вращение/зум). STEP пока как вложение.

## Зачем это в робототехнической системе

wheel_v1.stl, wheel_v2.stl версии.

## Синтаксис и контракт

```text
Загрузить → Просмотр STL
```

## Типичные ошибки

- хранить CAD только на личном диске без ссылки в модели
- ожидать STEP-preview в MVP

## В Architecture Canvas

AttachedFile.component_id = деталь.

## Связанные разделы
- app-files
- app-mech
- git-lfs
