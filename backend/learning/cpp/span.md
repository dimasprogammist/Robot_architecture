---
id: cpp-span
title: span и views
category: cpp
section: Память+
order: 22
description: Невладеющий взгляд на буфер.
tags: [cpp, память+]
technologies: [C++]
related: [cpp-arrays, cpp-struct, cpp-uart]
---

# span и views

`std::span<const uint8_t>` в парсер кадра: не копировать, не владеть. Владелец — DMA/очередь.

## Зачем это в робототехнической системе

CRC считается по span payload. Парсер не new.

## Синтаксис и контракт

```cpp
void parse(std::span<const std::uint8_t> f);
```

## Типичные ошибки

- сохранить span дольше жизни буфера
- span на временный vector

## В Architecture Canvas

Парсер — алгоритм шлюза. Буфер — драйвер DMA/UART.

## Связанные разделы
- cpp-arrays
- cpp-struct
- cpp-uart
