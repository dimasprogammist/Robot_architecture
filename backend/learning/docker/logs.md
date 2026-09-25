---
id: docker-logs
title: Логи контейнера
category: docker
section: Наблюдаемость
order: 7
description: json-file limits.
tags: [docker, наблюдаемость]
technologies: [Docker]
related: [linux-disks, linux-journalctl, docker-compose]
---

# Логи контейнера

max-size, max-file. Иначе SD снова умрёт. Можно journald driver.

## Зачем это в робототехнической системе

Телеметрия не в stdout 100 Гц.

## Синтаксис и контракт

```dockerfile
logging:
  options:
    max-size: "10m"
```

## Типичные ошибки

- без лимита на камеру debug
- секреты в логе healthcheck

## В Architecture Canvas

Согласуйте с python-logging: уровни, не дамп кадра.

## Связанные разделы
- linux-disks
- linux-journalctl
- docker-compose
