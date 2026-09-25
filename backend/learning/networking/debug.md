---
id: networking-debug
title: Диагностика сети
category: networking
section: Эксплуатация
order: 11
description: Слой за слоем.
tags: [networking, эксплуатация]
technologies: [Networking]
related: [linux-net-tools, networking-tcp, protocols-mqtt]
---

# Диагностика сети

Link → IP → порт → прикладной handshake. Не начинайте с переписывания Python.

## Зачем это в робототехнической системе

Нет телеметрии: ping брокера, ss, логи ACL, потом код.

## Синтаксис и контракт

```text
ping -c 3 192.168.10.1; tcpdump -n port 1883
```

## Типичные ошибки

- менять PID потому что «сеть лагает»
- dump без фильтра на GigE

## В Architecture Canvas

Чек-лист в docs Gateway.

## Связанные разделы
- linux-net-tools
- networking-tcp
- protocols-mqtt
