---
id: protocols-mqtt
title: MQTT
category: protocols
section: Прикладные
order: 4
description: Шина телеметрии.
tags: [protocols, прикладные]
technologies: [Protocols]
related: [python-mqtt, cpp-safety, networking-tls]
---

# MQTT

Topic hierarchy, QoS, retain, LWT. Retain команд движения запрещён.

## Зачем это в робототехнической системе

robot/{id}/imu, robot/{id}/status, robot/{id}/cmd.

## Синтаксис и контракт

```text
publish robot/1/status online
```

## Типичные ошибки

- retain на cmd
- QoS2 везде «на всякий»
- ESTOP только MQTT

## В Architecture Canvas

Блок брокера опционален. Рёбра MQTT. Notes QoS/LWT.

## Связанные разделы
- python-mqtt
- cpp-safety
- networking-tls
