---
id: cpp-freertos
title: FreeRTOS задачи
category: cpp
section: RTOS
order: 53
description: Приоритеты, стеки, очереди.
tags: [cpp, rtos]
technologies: [C++]
related: [cpp-isr, cpp-watchdog, cpp-queues]
---

# FreeRTOS задачи

Задача PID высокий приоритет, телеметрия ниже. Стеки мерить, не 128 «наугад». Watchdog task.

## Зачем это в робототехнической системе

Вложенный холст MCU: tasks как блоки. Связи — очереди RTOS (семантика data_flow).

## Синтаксис и контракт

```cpp
xTaskCreate(pid_task, "pid", 512, 0, 4, 0);
```

## Типичные ошибки

- голодание низкой задачи логов — ок; голодание ESTOP — нет
- printf из низкого приоритета с огромным стеком

## В Architecture Canvas

Каждая задача — вложенный блок или шаг алгоритма с приоритетом в notes.

## Связанные разделы
- cpp-isr
- cpp-watchdog
- cpp-queues
