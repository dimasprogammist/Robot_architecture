---
id: robotics-nav
title: Планирование и следование
category: robotics
section: Навигация
order: 11
description: Глобальный план vs локальный.
tags: [robotics, навигация]
technologies: [Robotics]
related: [robotics-control-split, python-state-machine, robotics-safety]
---

# Планирование и следование

Глобальный путь 1 Гц, локальный 10 Гц, контроль 1 кГц. Препятствие — локальный.

## Зачем это в робототехнической системе

Доехать до дока.

## Синтаксис и контракт

```text
global / local / control
```

## Типичные ошибки

- глобальный планировщик дёргает PWM
- нет поведения «стоп если нет плана»

## В Architecture Canvas

Три блока или вложенный холст Nav. Связи setpoint.

## Связанные разделы
- robotics-control-split
- python-state-machine
- robotics-safety
