---
id: protocols-modbus
title: Modbus TCP/RTU
category: protocols
section: Полевые
order: 6
description: Регистры как API ПЛК.
tags: [protocols, полевые]
technologies: [Protocols]
related: [cpp-modbus, sql-er]
---

# Modbus TCP/RTU

Карта регистров — документ. Адрес 40001 путают с 0. RTU нужен CRC и 3.5 символа тишины.

## Зачем это в робототехнической системе

ПЛК держит концевики, Python читает discretes, не наоборот без нужды.

## Синтаксис и контракт

```text
function 3, 4, 6, 16
```

## Типичные ошибки

- off-by-one карты
- два мастера RTU

## В Architecture Canvas

Протокол Modbus цвет. Карта — Documentation ПЛК.

## Связанные разделы
- cpp-modbus
- sql-er
