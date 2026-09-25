---
id: software-architecture-layers
title: Слои
category: software-architecture
section: Основы
order: 2
description: drivers / domain / api.
tags: [software-architecture, основы]
technologies: [Software Architecture]
related: [python-modules, cpp-hal]
---

# Слои

Domain не знает FastAPI. Drivers не знают миссии. API переводит HTTP в команды домена.

## Зачем это в робототехнической системе

Python пакеты = слои. C++ app vs hal.

## Синтаксис и контракт

```text
api → supervisor → drivers
```

## Типичные ошибки

- драйвер UART вызывает HTTP
- UI в прошивке

## В Architecture Canvas

Вложенный холст Backend.

## Связанные разделы
- python-modules
- cpp-hal
