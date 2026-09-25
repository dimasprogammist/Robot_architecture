---
id: cpp-lambda
title: Лямбды
category: cpp
section: Функции
order: 16
description: Колбэки RTOS, захват this.
tags: [cpp, функции]
technologies: [C++]
related: [cpp-isr, cpp-freertos, cpp-ownership]
---

# Лямбды

Лямбда на таймер: не захватывайте большие объекты по значению в ISR. `this` должен жить дольше таймера.

## Зачем это в робототехнической системе

FreeRTOS task + лямбда, которая зовёт `this->tick()`. Объект Supervisor — static/global lifetime.

## Синтаксис и контракт

```cpp
auto isr = [this] { this->on_edge(); };
```

## Типичные ошибки

- висящий this после delete
- захват vector по значению в 1 кГц

## В Architecture Canvas

Колбэки — часть алгоритма компонента, не «скрытая магия таймера».

## Связанные разделы
- cpp-isr
- cpp-freertos
- cpp-ownership
