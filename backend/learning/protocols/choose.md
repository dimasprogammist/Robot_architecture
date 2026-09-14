---
id: protocols-choose
title: Как выбрать протокол
category: protocols
section: Практика
order: 13
description: Таблица решений.
tags: [protocols, практика]
technologies: [Protocols]
related: [protocols-intro, robotics-overview, app-protocols]
---

# Как выбрать протокол

Расстояние, число узлов, realtime, наличие MCU, IT-требования. Не мода.

## Зачем это в робототехнической системе

1 м до IMU — I²C/SPI. 20 м до ПЛК — Modbus/CAN. UI — HTTP. Парк — MQTT.

## Синтаксис и контракт

```text
матрица: latency, topology, tooling
```

## Типичные ошибки

- MQTT потому что статья
- CAN внутри одной платы без нужды

## В Architecture Canvas

Каждое ребро холста — осознанный протокол.

## Связанные разделы
- protocols-intro
- robotics-overview
- app-protocols
