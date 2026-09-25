---
id: docker-sec
title: Минимальная безопасность
category: docker
section: Практика
order: 10
description: Non-root, read-only FS, no-new-privileges.
tags: [docker, практика]
technologies: [Docker]
related: [linux-permissions, docker-devices, linux-firewall]
---

# Минимальная безопасность

read_only + tmpfs. Capabilities drop. Это не IEC, но отсекает глупости.

## Зачем это в робототехнической системе

Контейнер UI не видит /dev.

## Синтаксис и контракт

```dockerfile
security_opt: ['no-new-privileges:true']
```

## Типичные ошибки

- сокет docker.sock внутрь приложения
- root + privileged + host pid

## В Architecture Canvas

Требования безопасности на runtime.

## Связанные разделы
- linux-permissions
- docker-devices
- linux-firewall
