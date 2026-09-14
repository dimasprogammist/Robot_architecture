---
id: networking-nat
title: NAT, маршруты, VPN
category: networking
section: L3
order: 7
description: Удалённая диагностика.
tags: [networking, l3]
technologies: [Networking]
related: [linux-ssh, linux-firewall, networking-wifi]
---

# NAT, маршруты, VPN

VPN инженера в OT, не проброс MQTT в интернет. NAT скрывает борт — заложите порты явно.

## Зачем это в робототехнической системе

Поддержка в поле через WireGuard jump host.

## Синтаксис и контракт

```text
ip route
```

## Типичные ошибки

- проброс 1883 на 0.0.0.0 мира
- два VPN с overlapping 10.0.0.0/8

## В Architecture Canvas

Блок External Access. Требования безопасности.

## Связанные разделы
- linux-ssh
- linux-firewall
- networking-wifi
