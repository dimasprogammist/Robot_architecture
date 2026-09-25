---
id: git-conflict
title: Конфликты
category: git
section: Ветвление
order: 7
description: Особенно codegen и IDL.
tags: [git, ветвление]
technologies: [Git]
related: [git-merge, python-struct, cpp-struct]
---

# Конфликты

Конфликт .proto/кадра — остановитесь и свертесь с Canvas protocol.

## Зачем это в робототехнической системе

Семантика важнее, чем «оставить обе стороны».

## Синтаксис и контракт

```bash
<<<<<<< HEAD
magic = 0xAA
=======
```

## Типичные ошибки

- принять обе константы magic
- решить конфликт только в Python

## В Architecture Canvas

Протокол на холсте — арбитраж конфликта.

## Связанные разделы
- git-merge
- python-struct
- cpp-struct
