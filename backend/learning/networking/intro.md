---
id: networking-intro
title: Сеть как часть машины
category: networking
section: Основы
order: 1
description: Не «просто Wi-Fi».
tags: [networking, основы]
technologies: [Networking]
related: [networking-l2, networking-tcp, linux-net-tools]
---

# Сеть как часть машины

OT-сеть робота: детерминизм, сегментация, диагностика. Офисный Wi-Fi — враг ШИМ только если вы туда засунули control.

## Зачем это в робототехнической системе

MCU—драйвер: не Ethernet. Камера GigE — Ethernet. UI — Wi-Fi.

## Синтаксис и контракт

```text
OSI: L1 кабель/радио → L4 TCP/UDP → L7 MQTT
```

## Типичные ошибки

- весь control через облако
- одна плоская сеть гостей и приводов

## В Architecture Canvas

Связи NETWORK/PROTOCOL на холсте с указанием L4.

## Связанные разделы
- networking-l2
- networking-tcp
- linux-net-tools
