---
id: python-struct
title: struct и бинарная раскладка
category: python
section: Ввод-вывод
order: 27
description: pack/unpack кадров MCU.
tags: [python, ввод-вывод]
technologies: [Python]
related: [python-bytes, python-serial, cpp-endian]
---

# struct и бинарная раскладка

`struct.pack('<hH', left, right)` задаёт endianness. MCU little-endian — почти всегда `<`.

## Зачем это в робототехнической системе

Канал UART: `AA 55` + int16 left + int16 right + crc. Python и C++ должны разделить один документ протокола.

## Синтаксис и контракт

```python
import struct
struct.pack('<2h', int(left), int(right))
```

## Типичные ошибки

- забыть endianness
- pack float туда, где прошивка ждёт Q8.8

## В Architecture Canvas

Протокол Custom: message_structure = таблица полей. Связь MCU↔Python ссылается на него.

## Связанные разделы
- python-bytes
- python-serial
- cpp-endian
