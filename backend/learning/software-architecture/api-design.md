---
id: software-architecture-api-design
title: Дизайн API
category: software-architecture
section: Контракты
order: 6
description: Команды домена, не «набор GET».
tags: [software-architecture, контракты]
technologies: [Software Architecture]
related: [python-fastapi, python-enums]
---

# Дизайн API

Имена как у автомата. Коды ошибок как FAULT reasons. Версия API.

## Зачем это в робототехнической системе

POST /missions/{id}/start

## Синтаксис и контракт

```text
OpenAPI = документация блока API
```

## Типичные ошибки

- CRUD на pwm
- разные имена режима в UI и MCU

## В Architecture Canvas

Поле API компонента. Состояния совпадают с algorithm.

## Связанные разделы
- python-fastapi
- python-enums
