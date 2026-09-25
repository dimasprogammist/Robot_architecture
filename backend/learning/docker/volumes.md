---
id: docker-volumes
title: Тома
category: docker
section: Данные
order: 4
description: Калибровки переживают обновление образа.
tags: [docker, данные]
technologies: [Docker]
related: [linux-fs, docker-compose, python-config]
---

# Тома

Named volume /var/lib/robot. Не храните прошивку-секреты в образе.

## Зачем это в робототехнической системе

Обновили шлюз — IMU bias на месте.

## Синтаксис и контракт

```dockerfile
volumes:
  - robot-data:/var/lib/robot
```

## Типичные ошибки

- bind-mount всей домашней папки
- забыть uid volume

## В Architecture Canvas

Paths как в linux-fs статье, согласованные.

## Связанные разделы
- linux-fs
- docker-compose
- python-config
