---
id: linux-net-tools
title: ip, ss, ping, tcpdump
category: linux
section: Сеть ОС
order: 9
description: Диагностика Ethernet/Wi-Fi.
tags: [linux, сеть ос]
technologies: [Linux]
related: [networking-ip, linux-firewall, protocols-mqtt]
---

# ip, ss, ping, tcpdump

Сначала L3: ping, ip addr. Потом сокеты ss -l. Потом tcpdump порта MQTT 1883.

## Зачем это в робототехнической системе

Робот «не видит» брокер: это DNS, маршрут, firewall или брокер down — не «Python сломался».

## Синтаксис и контракт

```bash
ss -lntp | grep 1883
ip route
```

## Типичные ошибки

- сразу переписывать код сервиса
- tcpdump без фильтра на 1 Гбит камере

## В Architecture Canvas

Связь Ethernet/Wi-Fi на холсте. Troubleshooting — в docs шлюза.

## Связанные разделы
- networking-ip
- linux-firewall
- protocols-mqtt
