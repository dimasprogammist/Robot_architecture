---
id: docker-file
title: Dockerfile
category: docker
section: Образы
order: 2
description: Слои, пользователь, pin базового образа.
tags: [docker, образы]
technologies: [Docker]
related: [docker-multi, docker-compose, python-packaging]
---

# Dockerfile

Не root в runtime. Копируйте только нужное. Мультистейдж для сборки C++ gateway.

## Зачем это в робототехнической системе

Образ шлюза с pyserial. Пользователь robot uid совпадает с udev groups — проще на host network/device.

## Синтаксис и контракт

```dockerfile
RUN useradd -r robot
USER robot
```

## Типичные ошибки

- latest теги
- секреты в слое ENV

## В Architecture Canvas

Версия образа = version компонента.

## Связанные разделы
- docker-multi
- docker-compose
- python-packaging
