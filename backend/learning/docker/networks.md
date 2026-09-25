---
id: docker-networks
title: Сети Docker
category: docker
section: Сеть
order: 5
description: Изоляция брокера.
tags: [docker, сеть]
technologies: [Docker]
related: [linux-firewall, docker-compose, protocols-mqtt]
---

# Сети Docker

Внутренний bridge для mqtt/api. Публикуйте только UI порт. Host network — исключение для сканирования UDP лидара.

## Зачем это в робототехнической системе

Лидар multicast иногда проще host network — опишите это как осознанный компромисс.

## Синтаксис и контракт

```dockerfile
expose: ['1883']
```

## Типичные ошибки

- 0.0.0.0 публикация брокера без ACL
- два compose-проекта с пересечением подсетей и удивлением

## В Architecture Canvas

Связи NETWORK на холсте = какие порты реально открыты.

## Связанные разделы
- linux-firewall
- docker-compose
- protocols-mqtt
