---
id: microcontrollers-rtos-mcu
title: Нужен ли RTOS
category: microcontrollers
section: Архитектура MCU
order: 10
description: Цикл vs задачи.
tags: [microcontrollers, архитектура mcu]
technologies: [Microcontrollers]
related: [cpp-freertos, cpp-embedded]
---

# Нужен ли RTOS

Простой робот — superloop 1 кГц. Сложный — FreeRTOS. Не RTOS ради резюме.

## Зачем это в робототехнической системе

Несколько шин + USB + PID — задачи. Один PID + UART — loop.

## Синтаксис и контракт

```c
while(1){ tick(); } vs tasks
```

## Типичные ошибки

- RTOS и всё в одной задаче всё равно
- забытые стеки

## В Architecture Canvas

Вложенный холст задач или один алгоритм loop.

## Связанные разделы
- cpp-freertos
- cpp-embedded
