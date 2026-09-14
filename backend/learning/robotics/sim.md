---
id: robotics-sim
title: Симуляция
category: robotics
section: Эксплуатация
order: 14
description: Контракты те же.
tags: [robotics, эксплуатация]
technologies: [Robotics]
related: [docker-sim, python-protocols-abc, python-testing]
---

# Симуляция

Fake MCU, gazebo, свой kinematic sim. Те же протоколы и автоматы. Иначе сим врёт.

## Зачем это в робототехнической системе

CI на парсер и автомат. Ночной прогон навигации.

## Синтаксис и контракт

```text
profile=sim
```

## Типичные ошибки

- другой протокол в симе «так проще»
- сим без ESTOP-веток

## В Architecture Canvas

Вложенный стенд Sim. Docker profile.

## Связанные разделы
- docker-sim
- python-protocols-abc
- python-testing
