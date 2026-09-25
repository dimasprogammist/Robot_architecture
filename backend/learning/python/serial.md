---
id: python-serial
title: pyserial / UART
category: python
section: Наука и железо
order: 46
description: Порт, таймауты, кадрация.
tags: [python, наука и железо]
technologies: [Python]
related: [python-struct, python-bytes, cpp-uart]
---

# pyserial / UART

UART — байтовый поток без границ сообщений. Вы обязаны собирать кадры сами (idle-gap, length, delimiter).

## Зачем это в робототехнической системе

Связь Pi ↔ STM32. 115200 8N1. Watchdog: нет кадра 100 мс → FAULT.

## Синтаксис и контракт

```python
ser = serial.Serial('/dev/ttyACM0', 115200, timeout=0.05)
n = ser.read(64)
```

## Типичные ошибки

- timeout=None в проде
- предполагать, что read() вернул целый пакет

## В Architecture Canvas

Протокол UART на связи, алгоритм «сбор кадра» на шлюзе, MCU — парсер зеркальный (C++).

## Связанные разделы
- python-struct
- python-bytes
- cpp-uart
