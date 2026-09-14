---
id: software-architecture-ports
title: Порты и адаптеры
category: software-architecture
section: Основы
order: 3
description: Hexagonal без религии.
tags: [software-architecture, основы]
technologies: [Software Architecture]
related: [python-protocols-abc, python-testing]
---

# Порты и адаптеры

Порт Bus.send. Адаптеры: SocketCAN, Fake, Serial. Тесты на fake.

## Зачем это в робототехнической системе

Смена транспорта не ломает автомат.

## Синтаксис и контракт

```text
interface Bus
```

## Типичные ошибки

- адаптер, который знает про UI
- 10 портов на каждый чих

## В Architecture Canvas

Интерфейсы компонента = порты.

## Связанные разделы
- python-protocols-abc
- python-testing
