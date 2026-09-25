---
id: networking-qos-net
title: QoS и приоритеты
category: networking
section: Эксплуатация
order: 9
description: Видео не душит команды.
tags: [networking, эксплуатация]
technologies: [Networking]
related: [networking-l2, protocols-modbus, linux-firewall]
---

# QoS и приоритеты

Отдельные VLAN: vision / ui / unused for drive. DSCP если умеете.

## Зачем это в робототехнической системе

4K камера на том же свитче, что Modbus TCP к ПЛК — классика боли.

## Синтаксис и контракт

```text
VLAN 10 OT, VLAN 20 vision
```

## Типичные ошибки

- один switch unmanaged на всё
- QoS только на бумаге

## В Architecture Canvas

Коммутатор — блок NETWORK. VLAN в notes.

## Связанные разделы
- networking-l2
- protocols-modbus
- linux-firewall
