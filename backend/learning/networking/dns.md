---
id: networking-dns
title: DNS и mDNS
category: networking
section: L3
order: 6
description: Имена в цехе.
tags: [networking, l3]
technologies: [Networking]
related: [networking-ip, linux-net-tools, protocols-mqtt]
---

# DNS и mDNS

Не завязывайте привод на DNS облака. Локальные имена или /etc/hosts/OT DNS.

## Зачем это в робототехнической системе

Брокер mqtt.ot.local. Падение интернета не должно останавливать RUN, если миссия локальная.

## Синтаксис и контракт

```text
getent hosts mqtt.ot.local
```

## Типичные ошибки

- таймаут DNS 5 с в control
- публичный DNS для имени камеры

## В Architecture Canvas

Зависимости компонента: DNS нужен/не нужен в RUN.

## Связанные разделы
- networking-ip
- linux-net-tools
- protocols-mqtt
