---
id: protocols-opcua
title: OPC UA
category: protocols
section: Индустрия
order: 11
description: Модель узлов, не «ещё JSON».
tags: [protocols, индустрия]
technologies: [Protocols]
related: [protocols-modbus, networking-tls]
---

# OPC UA

ПЛК и SCADA. Security policy. Подписка на items vs опрос.

## Зачем это в робототехнической системе

Завод хочет видеть робота как OPC-сервер. Шлюз — отдельный блок, не MCU.

## Синтаксис и контракт

```text
opc.tcp://host:4840
```

## Типичные ошибки

- Anonymous в проде без решения
- подписка 1 мс на всё

## В Architecture Canvas

Протокол OPC UA. Блок Gateway к IT/OT.

## Связанные разделы
- protocols-modbus
- networking-tls
