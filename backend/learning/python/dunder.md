---
id: python-dunder
title: Дандер-методы
category: python
section: ООП
order: 32
description: __init__, __enter__, __repr__, сравнение.
tags: [python, ооп]
technologies: [Python]
related: [python-classes, python-context, python-logging]
---

# Дандер-методы

`__repr__` должен помогать в логах: `Imu(ok=True, hz=200)`, а не `<Imu object at 0x>`.

## Зачем это в робототехнической системе

При отладке телеметрии по journalctl человеческий repr экономит часы.

## Синтаксис и контракт

```python
def __repr__(self) -> str:
    return f'Pose(x={self.x:.3f}, y={self.y:.3f})'
```

## Типичные ошибки

- тяжёлая работа в __del__
- __eq__ без __hash__ для ключей

## В Architecture Canvas

Формат логов согласуйте в документации сервиса.

## Связанные разделы
- python-classes
- python-context
- python-logging
