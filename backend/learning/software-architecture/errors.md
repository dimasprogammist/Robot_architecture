---
id: software-architecture-errors
title: Ошибки и отказы
category: software-architecture
section: Контракты
order: 7
description: Классы отказов.
tags: [software-architecture, контракты]
technologies: [Software Architecture]
related: [python-exceptions, cpp-expected, robotics-safety]
---

# Ошибки и отказы

Транзиент (retry), постоянный (FAULT), безопасность (ESTOP). Не один catch.

## Зачем это в робототехнической системе

CRC vs отсутствие лидара vs грибок.

## Синтаксис и контракт

```text
retry | degrade | stop | halt-power
```

## Типичные ошибки

- retry на ESTOP
- degrade без индикации оператору

## В Architecture Canvas

failure_modes каждого блока. Requirements.

## Связанные разделы
- python-exceptions
- cpp-expected
- robotics-safety
