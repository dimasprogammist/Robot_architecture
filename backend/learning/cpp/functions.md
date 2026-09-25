---
id: cpp-functions
title: Функции, перегрузка, inline
category: cpp
section: Функции
order: 15
description: Границы, ABI, не раздувать header.
tags: [cpp, функции]
technologies: [C++]
related: [cpp-headers, cpp-classes, cpp-hal]
---

# Функции, перегрузка, inline

Маленькие inline в header — ок. Тяжёлая математика FOC — в cpp, чтобы не раздувать каждый TU.

## Зачем это в робототехнической системе

`set_duty(channel, counts)` — низкий слой. `set_omega(rad_s)` — домен. Не смешивать в одной перегрузке без имён.

## Синтаксис и контракт

```cpp
void set_duty(int ch, std::uint16_t counts);
void set_omega(int ch, float rad_s);
```

## Типичные ошибки

- перегрузка float/double без правила единиц
- inline гигантских функций

## В Architecture Canvas

API блока MCU списком функций. Алгоритм пользуется доменным слоем.

## Связанные разделы
- cpp-headers
- cpp-classes
- cpp-hal
