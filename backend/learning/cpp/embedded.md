---
id: cpp-embedded
title: Embedded без кучи
category: cpp
section: MCU
order: 42
description: static, пулы, запрет new.
tags: [cpp, mcu]
technologies: [C++]
related: [cpp-freertos, cpp-string, cpp-alloc]
---

# Embedded без кучи

`new` в прошивке либо запрещён, либо только на старте. После `osKernelStart` — никаких аллокаций.

## Зачем это в робототехнической системе

Объекты драйверов — static. Очереди FreeRTOS — статический аллокатор.

## Синтаксис и контракт

```cpp
static PwmTimer tim;
// no new after boot
```

## Типичные ошибки

- строка STL в тике
- рекурсия парсера

## В Architecture Canvas

Ограничение «no heap» — notes MCU и требование. Это влияет на выбор STL.

## Связанные разделы
- cpp-freertos
- cpp-string
- cpp-alloc
