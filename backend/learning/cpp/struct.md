---
id: cpp-struct
title: struct, packed, layout
category: cpp
section: Данные
order: 23
description: Совпадение с протоколом.
tags: [cpp, данные]
technologies: [C++]
related: [cpp-endian, cpp-hello, python-struct]
---

# struct, packed, layout

`#pragma pack` / `__attribute__((packed))` и `static_assert(sizeof==N)`. Без этого Python struct и C++ разъедутся.

## Зачем это в робототехнической системе

Кадр UART 8 байт: magic, seq, i16, i16, crc. Один документ на оба конца.

## Синтаксис и контракт

```cpp
struct __attribute__((packed)) Frame { uint8_t m; int16_t l,r; uint16_t crc; };
static_assert(sizeof(Frame)==7);
```

## Типичные ошибки

- паддинг компилятора, о котором забыли
- float в packed без согласования endian

## В Architecture Canvas

message_structure протокола = эта структура. Пришлите пример hex в data_example.

## Связанные разделы
- cpp-endian
- cpp-hello
- python-struct
