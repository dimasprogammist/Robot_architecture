---
id: cpp-intro
title: Роль C++ в роботе
category: cpp
section: Основы
order: 1
description: Прошивка, realtime, драйверы: где C++ обязателен.
tags: [cpp, основы]
technologies: [C++]
related: [cpp-build-model, cpp-embedded, cpp-isr]
---

# Роль C++ в роботе

C++ даёт контроль над памятью, детерминизм и доступ к регистрам. Это язык MCU, драйверов двигателей и часто нод ROS2, где важна латентность.

## Зачем это в робототехнической системе

Контур тока/скорости, разбор CAN, ШИМ — C++. Облако, UI, отчёты — чаще Python. Граница — протокол и очередь сообщений.

## Синтаксис и контракт

```cpp
// MCU control loop 1 kHz
void tick();
```

## Типичные ошибки

- писать UI на C++ «потому что быстрее» без измерения
- крутить кучу new в ISR

## В Architecture Canvas

Блок MCU/CPU: технология C++. Алгоритм tick() — во вкладке Algorithm. Связи — UART/CAN/SPI.

## Связанные разделы
- cpp-build-model
- cpp-embedded
- cpp-isr
