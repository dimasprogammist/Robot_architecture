---
id: protocols-uart
title: UART/Serial
category: protocols
section: Полевые
order: 8
description: Байтовый поток.
tags: [protocols, полевые]
technologies: [Protocols]
related: [python-serial, cpp-uart]
---

# UART/Serial

8N1, baud, кадрирование прикладное. Flow control редко, но RTS/CTS на длинных линиях.

## Зачем это в робототехнической системе

Pi—STM32 115200. Watchdog кадра.

## Синтаксис и контракт

```text
115200 8N1
```

## Типичные ошибки

- разный baud
- нет framing
- timeout=None

## В Architecture Canvas

Связь UART цвет. Алгоритм сборки кадра.

## Связанные разделы
- python-serial
- cpp-uart
