---
id: cpp-logging
title: Логи прошивки и spdlog
category: cpp
section: Наблюдаемость
order: 30
description: ITM/RTT/UART vs spdlog на Linux.
tags: [cpp, наблюдаемость]
technologies: [C++]
related: [cpp-uart, cpp-watchdog, linux-journalctl]
---

# Логи прошивки и spdlog

На MCU — кольцевой лог уровней. На IPC — spdlog/journald. Не printf в 10 кГц.

## Зачем это в робототехнической системе

FAULT пишет причину и tick count. Это потом попадёт в MQTT fault-topic через шлюз.

## Синтаксис и контракт

```cpp
log_fault("crc", seq);
```

## Типичные ошибки

- блокирующий UART-лог из ISR
- строки без лимита в tiny RAM

## В Architecture Canvas

Канал логов — связь MCU → шлюз (может быть тот же UART multiplex или RTT только на стенде).

## Связанные разделы
- cpp-uart
- cpp-watchdog
- linux-journalctl
