---
id: cpp-can
title: CAN
category: cpp
section: Шины
order: 51
description: id, DLC, фильтры, bus-off.
tags: [cpp, шины]
technologies: [C++]
related: [cpp-endian, protocols-can, python-struct]
---

# CAN

CAN — не «сокет на всякий». Нужны bitrate, termination, фильтры id, обработка bus-off.

## Зачем это в робототехнической системе

Привод и MCU на CAN. Python-шлюз через SocketCAN — другой блок, тот же протокол прикладного уровня.

## Синтаксис и контракт

```cpp
can_send(0x101, data, 8);
```

## Типичные ошибки

- забытый терминатор
- разный bitrate концов
- игнор error warning

## В Architecture Canvas

Протокол CAN цвет линии. Прикладной кадр — message_structure. Физика — в electronics/notes.

## Связанные разделы
- cpp-endian
- protocols-can
- python-struct
