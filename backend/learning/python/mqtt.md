---
id: python-mqtt
title: MQTT (paho)
category: python
section: Сеть
order: 47
description: Топики, QoS, retained, last will.
tags: [python, сеть]
technologies: [Python]
related: [python-json, python-asyncio, protocols-mqtt]
---

# MQTT (paho)

MQTT — шина телеметрии. Не канал аварийного стопа, если нет отдельного гарантированного пути (проводной E-stop).

## Зачем это в робототехнической системе

`robot/+/imu` телеметрия QoS0. `robot/cmd` QoS1. Last will `robot/status=offline`.

## Синтаксис и контракт

```python
client.publish('robot/imu', payload, qos=0, retain=False)
```

## Типичные ошибки

- retained команда движения — робот тронется после рестарта
- пароль брокера в образе без секрета

## В Architecture Canvas

Блок MQTT + протокол MQTT на рёбрах. В data_example — JSON IMU. В notes — QoS и LWT.

## Связанные разделы
- python-json
- python-asyncio
- protocols-mqtt
