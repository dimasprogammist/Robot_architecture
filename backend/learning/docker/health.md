---
id: docker-health
title: Healthcheck
category: docker
section: Наблюдаемость
order: 8
description: Не ping, а «шина жива».
tags: [docker, наблюдаемость]
technologies: [Docker]
related: [docker-compose, python-fastapi, linux-systemd]
---

# Healthcheck

HTTP /health: mqtt connected, last mcu frame < 200ms. Иначе не ready.

## Зачем это в робототехнической системе

Оркестратор не шлёт трафик в полумёртвый шлюз.

## Синтаксис и контракт

```dockerfile
HEALTHCHECK CMD curl -f localhost:8000/health
```

## Типичные ошибки

- health всегда 200
- health, который ходит в тяжёлый SLAM

## В Architecture Canvas

API health — часть блока Backend.

## Связанные разделы
- docker-compose
- python-fastapi
- linux-systemd
