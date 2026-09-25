---
id: docker-compose
title: Compose
category: docker
section: Оркестрация
order: 3
description: Локальный и бортовой стек.
tags: [docker, оркестрация]
technologies: [Docker]
related: [docker-networks, docker-health, linux-systemd]
---

# Compose

Зависимости healthcheck: брокер healthy → шлюз. restart policies как systemd.

## Зачем это в робототехнической системе

Ноут инженера и робот — один compose с overlay device.

## Синтаксис и контракт

```dockerfile
depends_on:
  mqtt:
    condition: service_healthy
```

## Типичные ошибки

- depends_on без health — гонка
- volume на всё /

## В Architecture Canvas

Несколько software-блоков = несколько сервисов compose, связи = сети/топики.

## Связанные разделы
- docker-networks
- docker-health
- linux-systemd
