---
id: cpp-queues
title: Очереди RTOS/Lock-free
category: cpp
section: RTOS
order: 54
description: События, не shared mutable.
tags: [cpp, rtos]
technologies: [C++]
related: [cpp-freertos, cpp-isr, python-queues]
---

# Очереди RTOS/Lock-free

ISR → queue → task. Переполнение очереди команд — FAULT, не drop E-stop.

## Зачем это в робототехнической системе

Как Python Queue, но со статическим хранилищем.

## Синтаксис и контракт

```cpp
xQueueSendFromISR(q, &b, &woken);
```

## Типичные ошибки

- очередь «на 1 элемент» для потока кадров камеры
- слать из ISR в очередь, которая ждёт malloc

## В Architecture Canvas

Политика очереди — в связи data_flow (frequency, reliability).

## Связанные разделы
- cpp-freertos
- cpp-isr
- python-queues
