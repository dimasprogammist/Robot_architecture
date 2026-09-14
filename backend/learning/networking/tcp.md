---
id: networking-tcp
title: TCP
category: networking
section: L4
order: 4
description: Потоки, гарантия, не realtime.
tags: [networking, l4]
technologies: [Networking]
related: [networking-udp, protocols-http, cpp-chrono]
---

# TCP

HTTP, MQTT (обычно), Modbus TCP. Ретрансмиссии дают джиттер — не кладите сюда ток мотора.

## Зачем это в робототехнической системе

Конфиг и команды миссии — TCP. Setpoint 1 кГц — нет.

## Синтаксис и контракт

```text
ss -ti
```

## Типичные ошибки

- Nagle + маленькие setpoint
- бесконечный keepalive без приложения

## В Architecture Canvas

Протокол TCP/HTTP цвет линии. Notes: зачем TCP, а не UDP.

## Связанные разделы
- networking-udp
- protocols-http
- cpp-chrono
