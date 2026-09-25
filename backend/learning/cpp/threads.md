---
id: cpp-threads
title: std::thread на Linux
category: cpp
section: Параллельность
order: 31
description: Не путать с задачами FreeRTOS.
tags: [cpp, параллельность]
technologies: [C++]
related: [cpp-mutex, cpp-queues, cpp-freertos]
---

# std::thread на Linux

На IPC поток чтения сокета + поток контроля. Affinity/realtime-policy — осознанно (SCHED_FIFO осторожно).

## Зачем это в робототехнической системе

Gateway: thread CAN, thread MQTT. Общая очередь команд.

## Синтаксис и контракт

```cpp
std::thread th([&]{ can_loop(); });
th.join();
```

## Типичные ошибки

- detach и доступ к стеку caller
- два потока пишут в один сокет без mutex

## В Architecture Canvas

Потоки Linux-сервиса = вложенные блоки или явно описанные алгоритмы параллельных циклов.

## Связанные разделы
- cpp-mutex
- cpp-queues
- cpp-freertos
