---
id: docker-sim
title: Симуляция в контейнерах
category: docker
section: Практика
order: 11
description: Gazebo/симы как профили compose.
tags: [docker, практика]
technologies: [Docker]
related: [python-protocols-abc, docker-compose, robotics-sim]
---

# Симуляция в контейнерах

Профиль sim поднимает fake-mcu. Профиль hw — devices. Один и тот же шлюз.

## Зачем это в робототехнической системе

CI гоняет sim профиль. Это ваши FakeBus из Python Protocol.

## Синтаксис и контракт

```dockerfile
# compose --profile sim up
```

## Типичные ошибки

- один образ, который сам угадывает есть ли железо, без явного профиля
- сим и hw одновременно на одни топики

## В Architecture Canvas

Вложенный холст Test/Sim vs Hardware.

## Связанные разделы
- python-protocols-abc
- docker-compose
- robotics-sim
