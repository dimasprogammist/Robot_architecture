---
id: cpp-modbus
title: Modbus на MCU/шлюзе
category: cpp
section: Шины
order: 52
description: RTU vs TCP, регистры.
tags: [cpp, шины]
technologies: [C++]
related: [protocols-modbus, cpp-endian, python-struct]
---

# Modbus на MCU/шлюзе

ПЛК часто Modbus. MCU может быть slave. Карта регистров — документ, как ER для железа.

## Зачем это в робототехнической системе

Python-сервис читает holding registers. Карта: 40001 = omega_sp. Совпадает с таблицей в Canvas docs.

## Синтаксис и контракт

```cpp
uint16_t regs[32];
```

## Типичные ошибки

- off-by-one 40001 vs 0
- CRC RTU другой, чем «кажется»

## В Architecture Canvas

Протокол Modbus RTU/TCP на ребре PLC—Service. Карта регистров — Documentation.

## Связанные разделы
- protocols-modbus
- cpp-endian
- python-struct
