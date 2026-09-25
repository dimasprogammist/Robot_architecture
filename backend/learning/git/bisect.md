---
id: git-bisect
title: bisect
category: git
section: Инструменты
order: 11
description: Кто сломал одометрию.
tags: [git, инструменты]
technologies: [Git]
related: [python-testing, robotics-odometry]
---

# bisect

Автоматический тест: робот едет 1 м в симе. bisect найдёт коммит.

## Зачем это в робототехнической системе

Регресс после «мелкого рефактора UART».

## Синтаксис и контракт

```bash
git bisect start
git bisect bad
git bisect good v1.3.0
```

## Типичные ошибки

- bisect без воспроизводимого теста
- пропуск коммитов протокола

## В Architecture Canvas

Тест одометрии привязан к requirement.

## Связанные разделы
- python-testing
- robotics-odometry
