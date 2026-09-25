---
id: software-architecture-sync
title: Синхронность и очереди
category: software-architecture
section: Связи
order: 5
description: Границы потоков.
tags: [software-architecture, связи]
technologies: [Software Architecture]
related: [python-queues, cpp-queues]
---

# Синхронность и очереди

Каждый I/O — очередь и политика drop. Документируйте.

## Зачем это в робототехнической системе

UART thread → q → supervisor.

## Синтаксис и контракт

```text
queue maxsize, drop-old | block | fault
```

## Типичные ошибки

- общий dict без лока
- безлимит очередь кадров

## В Architecture Canvas

data_flow notes: частота и политика.

## Связанные разделы
- python-queues
- cpp-queues
