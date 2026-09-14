---
id: protocols-can
title: CAN / CANopen идея
category: protocols
section: Полевые
order: 7
description: Шина приводов.
tags: [protocols, полевые]
technologies: [Protocols]
related: [cpp-can, python-struct]
---

# CAN / CANopen идея

Bitrate, termination 120Ω, id, DLC. Bus-off обработка. Прикладной протокол поверх (свой или CANopen).

## Зачем это в робототехнической системе

Сервоприводы и MCU. Шлюз SocketCAN — Linux-блок.

## Синтаксис и контракт

```text
id 0x101 DLC 8
```

## Типичные ошибки

- без терминаторов
- смешать 250k и 500k
- игнор error counters

## В Architecture Canvas

Протокол CAN. Физика в electronics. Прикладной кадр в message_structure.

## Связанные разделы
- cpp-can
- python-struct
