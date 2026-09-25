---
id: cpp-pointers
title: Указатели и ссылки
category: cpp
section: Память
order: 7
description: nullable vs обязательная ссылка.
tags: [cpp, память]
technologies: [C++]
related: [cpp-ownership, cpp-span, cpp-isr]
---

# Указатели и ссылки

Ссылка — объект есть. Указатель — может быть nullptr (нет шины). Владение отдельно (unique_ptr).

## Зачем это в робототехнической системе

`Imu&` в tick, если IMU обязателен. `Bus*` если опциональный отладочный адаптер.

## Синтаксис и контракт

```cpp
void apply(Motor& m, const Twist& cmd);
```

## Типичные ошибки

- ссылка на временный объект
- указатель без владельца из ISR в app без синхронизации

## В Architecture Canvas

Опциональные устройства — отдельные блоки со связью, не «магический nullptr» без требований.

## Связанные разделы
- cpp-ownership
- cpp-span
- cpp-isr
