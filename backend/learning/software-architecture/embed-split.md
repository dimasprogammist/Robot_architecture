---
id: software-architecture-embed-split
title: Граница embedded/Linux
category: software-architecture
section: Практика
order: 10
description: Самое важное ребро.
tags: [software-architecture, практика]
technologies: [Software Architecture]
related: [protocols-choose, cpp-struct, python-struct]
---

# Граница embedded/Linux

Документируйте кадр, частоты, кто watchdog. Это сердце архитектуры робота.

## Зачем это в робототехнической системе

Связь MCU—Gateway.

## Синтаксис и контракт

```text
frame, hz, watchdog, estop independent
```

## Типичные ошибки

- скрытый второй канал «отладки», который может задать RUN
- разные endian без записи

## В Architecture Canvas

Протокол Custom/UART/CAN между HARDWARE и SOFTWARE.

## Связанные разделы
- protocols-choose
- cpp-struct
- python-struct
