---
id: python-composition
title: Композиция вместо гигантского наследования
category: python
section: ООП
order: 34
description: Сборка робота из драйверов.
tags: [python, ооп]
technologies: [Python]
related: [python-classes, python-protocols-abc, python-testing]
---

# Композиция вместо гигантского наследования

Робот *имеет* шину, не «является» Serial. Наследование драйверов — редкость, композиция — норма.

## Зачем это в робототехнической системе

`Supervisor(motors, imu, estop)` тестируется моками. Иерархия `class Robot(Serial, HTTP, IMU)` — нет.

## Синтаксис и контракт

```python
class Supervisor:
    def __init__(self, motors, imu, estop):
        self.motors, self.imu, self.estop = motors, imu, estop
```

## Типичные ошибки

- наследование ради шаринга пары методов
- скрытые синглтоны вместо аргументов

## В Architecture Canvas

Связи на холсте = композиции в коде. Если связи нет, не тащите зависимость «на всякий случай».

## Связанные разделы
- python-classes
- python-protocols-abc
- python-testing
