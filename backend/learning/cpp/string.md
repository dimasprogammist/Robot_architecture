---
id: cpp-string
title: std::string и когда её нет
category: cpp
section: Память
order: 9
description: Строки на Linux vs MCU.
tags: [cpp, память]
technologies: [C++]
related: [cpp-embedded, cpp-exceptions, cpp-logging]
---

# std::string и когда её нет

На Raspberry/IPC `std::string` нормален. На Cortex-M0 без кучи — нет. Логи на MCU — кольцевой буфер байт.

## Зачем это в робототехнической системе

Парсер AT-команд модема на Linux-шлюзе — string. На MCU — state machine по байту.

## Синтаксис и контракт

```cpp
std::string topic = "robot/imu";
```

## Типичные ошибки

- исключения bad_alloc в control loop
- конкатенация string в тике 1 кГц

## В Architecture Canvas

Технология блока MCU: «без кучи» если так решили — это ограничение архитектуры.

## Связанные разделы
- cpp-embedded
- cpp-exceptions
- cpp-logging
