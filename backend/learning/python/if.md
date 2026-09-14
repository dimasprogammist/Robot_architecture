---
id: python-if
title: Условия
category: python
section: Поток управления
order: 14
description: if/elif/else, тернарный оператор, match.
tags: [python, поток управления]
technologies: [Python]
related: [python-state-machine, python-enums]
---

# Условия

Ветвление по режиму робота должно быть явным. Скрытые флаги `if x:` плодят баги в fail-safe.

## Зачем это в робототехнической системе

Режимы: IDLE, TELEOP, AUTO, FAULT. FAULT всегда перекрывает остальные.

## Синтаксис и контракт

```python
if mode == 'FAULT':
    coast()
elif mode == 'AUTO':
    follow_path()
else:
    teleop()
```

## Типичные ошибки

- цепочка elif на 20 протоколов вместо таблицы стратегий
- забытый else в fail-safe

## В Architecture Canvas

Состояния перенесите в алгоритм компонента и в state machine, не держите только в if.

## Связанные разделы
- python-state-machine
- python-enums
