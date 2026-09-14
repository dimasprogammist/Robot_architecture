---
id: software-architecture-canvas-map
title: Как вести Canvas и код вместе
category: software-architecture
section: Практика
order: 12
description: Правило синхронизации.
tags: [software-architecture, практика]
technologies: [Software Architecture]
related: [app-export-ai, python-architecture, git-commit]
---

# Как вести Canvas и код вместе

Новый импорт/топик/таблица → сразу ребро или сущность. PR без обновления архитектуры неполный.

## Зачем это в робототехнической системе

Ревью: diff кода и diff модели.

## Синтаксис и контракт

```text
code change ⇒ model change
```

## Типичные ошибки

- архитектура «потом нарисуем»
- холст для презентации, код другой

## В Architecture Canvas

Экспорт AI тогда помогает, а не врёт.

## Связанные разделы
- app-export-ai
- python-architecture
- git-commit
