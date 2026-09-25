---
id: robotics-slam
title: SLAM и карты
category: robotics
section: Локализация
order: 10
description: Отдельный тяжёлый компонент.
tags: [robotics, локализация]
technologies: [Robotics]
related: [python-numpy, networking-udp, robotics-nav]
---

# SLAM и карты

Не на MCU. Карта — артефакт версии. Потеря лидара — поведение fail-safe.

## Зачем это в робототехнической системе

Склад, навигация.

## Синтаксис и контракт

```text
map.pgm + yaml
```

## Типичные ошибки

- SLAM  в том же процессе, что UART 1 кГц, без приоритетов
- карта без версии

## В Architecture Canvas

Блок SLAM. Файлы карты — attached/runtime path. Связь Lidar UDP.

## Связанные разделы
- python-numpy
- networking-udp
- robotics-nav
