---
id: software-architecture-overview
title: Архитектура ПО робота
category: software-architecture
section: Основы
order: 1
description: Компоненты и контракты.
tags: [software-architecture, основы]
technologies: [Software Architecture]
related: [python-architecture, app-canvas]
---

# Архитектура ПО робота

Софт — граф ответственности. Canvas — этот граф. Код не должен иметь тайных связей.

## Зачем это в робототехнической системе

Backend, MCU firmware, UI, tools.

## Синтаксис и контракт

```text
components + connections = architecture
```

## Типичные ошибки

- shared util, который импортируют все
- бог-процесс

## В Architecture Canvas

Системный холст + вложенные. Правило: импорт = ребро.

## Связанные разделы
- python-architecture
- app-canvas
