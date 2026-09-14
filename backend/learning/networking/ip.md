---
id: networking-ip
title: IP, адреса, DHCP vs static
category: networking
section: L3
order: 3
description: Фиксируйте адреса OT.
tags: [networking, l3]
technologies: [Networking]
related: [networking-dns, linux-net-tools, networking-nat]
---

# IP, адреса, DHCP vs static

Камера 192.168.10.20 static. DHCP — для UI ноутбука, не для лидара в цикле.

## Зачем это в робототехнической системе

После ребута роутера лидар не должен сменить адрес.

## Синтаксис и контракт

```text
ip addr add 192.168.10.5/24 dev eth0
```

## Типичные ошибки

- два DHCP сервера в шкафу
- один адрес на два устройства

## В Architecture Canvas

Адреса в docs Network Device / Camera.

## Связанные разделы
- networking-dns
- linux-net-tools
- networking-nat
