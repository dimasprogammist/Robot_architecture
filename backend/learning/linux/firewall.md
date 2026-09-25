---
id: linux-firewall
title: nftables/iptables кратко
category: linux
section: Сеть ОС
order: 10
description: Минимальная экспозиция.
tags: [linux, сеть ос]
technologies: [Linux]
related: [linux-ssh, docker-networks, networking-nat]
---

# nftables/iptables кратко

На изделии открыты только SSH (ограниченно), MQTT если нужно, API. Не все порты Docker.

## Зачем это в робототехнической системе

Операторская сеть vs OT. Робот не торчит Node-RED в интернет.

## Синтаксис и контракт

```bash
nft add rule inet filter input tcp dport 1883 ip saddr 10.0.0.0/24 accept
```

## Типичные ошибки

- disable firewall «чтобы заработало» навсегда
- проброс 0.0.0.0:80

## В Architecture Canvas

Требования безопасности на блок External Access.

## Связанные разделы
- linux-ssh
- docker-networks
- networking-nat
