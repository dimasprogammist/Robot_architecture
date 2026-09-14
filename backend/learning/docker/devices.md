---
id: docker-devices
title: Устройства и privileged
category: docker
section: Железо
order: 6
description: Прокидывать точечно.
tags: [docker, железо]
technologies: [Docker]
related: [linux-udev, python-serial, docker-file]
---

# Устройства и privileged

devices: /dev/robot-mcu. privileged почти всегда лишний и опасный.

## Зачем это в робототехнической системе

Шлюз в контейнере говорит с STM32. udev на хосте создаёт имя, контейнер видит device.

## Синтаксис и контракт

```dockerfile
devices:
  - /dev/robot-mcu:/dev/robot-mcu
```

## Типичные ошибки

- privileged: true «потому что serial»
- нет group_add dialout

## В Architecture Canvas

Документируйте runtime у блока Gateway.

## Связанные разделы
- linux-udev
- python-serial
- docker-file
