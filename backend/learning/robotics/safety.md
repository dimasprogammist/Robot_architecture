---
id: robotics-safety
title: Безопасность робота
category: robotics
section: Безопасность
order: 12
description: Слои.
tags: [robotics, безопасность]
technologies: [Robotics]
related: [cpp-safety, electronics-pullup, app-requirements]
---

# Безопасность робота

Клетка, ESTOP, ограничение скорости, watchdogs, безопасные состояния ПО. Не один if.

## Зачем это в робототехнической системе

Выставка vs цех — разные must requirements.

## Синтаксис и контракт

```text
E-stop, light curtain, software limits
```

## Типичные ошибки

- софт-стоп вместо грибка
- тест безопасности только в симе

## В Architecture Canvas

Requirements must. Связи GPIO ESTOP. Алгоритм FAULT.

## Связанные разделы
- cpp-safety
- electronics-pullup
- app-requirements
