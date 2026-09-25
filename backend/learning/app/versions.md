---
id: app-versions
title: Снимки версий
category: app
section: Экспорт
order: 21
description: Метки модели.
tags: [app, экспорт]
technologies: [Architecture Canvas]
related: [git-tag, app-export-json, protocols-versioning]
---

# Снимки версий

Сохранить снимок архитектуры. Это не git, но рядом с git tag удобно.

## Зачем это в робототехнической системе

Перед ломающим изменение протокола.

## Синтаксис и контракт

```text
Экспорт → Сохранить снимок версии
```

## Типичные ошибки

- 100 снимков без имён
- считать это CAD PDM

## В Architecture Canvas

current_version_label в шапке.

## Связанные разделы
- git-tag
- app-export-json
- protocols-versioning
