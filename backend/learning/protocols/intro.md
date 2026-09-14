---
id: protocols-intro
title: Протокол — контракт связи
category: protocols
section: Основы
order: 1
description: Не цвет линии ради цвета.
tags: [protocols, основы]
technologies: [Protocols]
related: [protocols-versioning, app-protocols, python-struct]
---

# Протокол — контракт связи

Протокол задаёт поля, время, ошибки, адресацию. Canvas хранит это в сущности Protocol + Connection.

## Зачем это в робототехнической системе

MCU↔Python: свой кадр. UI↔Backend: HTTP. Датчики: I²C. Не смешивайте в одной «магистрали без имени».

## Синтаксис и контракт

```text
name, transport, port, data_format, timeout, retry, crc
```

## Типичные ошибки

- одна связь «данные» на всё
- разные версии кадра без version

## В Architecture Canvas

Каталог протоколов + цвет ребра + data_example.

## Связанные разделы
- protocols-versioning
- app-protocols
- python-struct
