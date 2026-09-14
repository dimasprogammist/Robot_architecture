---
id: python-bytes
title: bytes, bytearray, memoryview
category: python
section: Типы
order: 8
description: Бинарные буферы для протоколов.
tags: [python, типы]
technologies: [Python]
related: [python-strings, python-struct, python-serial]
---

# bytes, bytearray, memoryview

`bytes` неизменяем, `bytearray` — нет. `memoryview` позволяет резать кадр без копий.

## Зачем это в робототехнической системе

Разбор Modbus RTU или кастомного UART: заголовок, длина, CRC. Копии на каждый байт убивают SBC при 1 кГц.

## Синтаксис и контракт

```python
frame = bytearray(rx)
crc = crc16(memoryview(frame)[:-2])
```

## Типичные ошибки

- конкатенация bytes в цикле
- забытый CRC

## В Architecture Canvas

Документируйте message_structure протокола. Алгоритм «парсер кадра» повесьте на шлюз.

## Связанные разделы
- python-strings
- python-struct
- python-serial
