---
id: software-architecture-events
title: События vs запросы
category: software-architecture
section: Связи
order: 4
description: Когда брокер, когда RPC.
tags: [software-architecture, связи]
technologies: [Software Architecture]
related: [protocols-mqtt, protocols-http, cpp-safety]
---

# События vs запросы

Телеметрия — события. Старт миссии — команда с ответом. ESTOP — не «событие в лучшем усилии» как единственный путь.

## Зачем это в робототехнической системе

MQTT imu, HTTP start, GPIO estop.

## Синтаксис и контракт

```text
cmd vs telemetry vs safety
```

## Типичные ошибки

- все через события «реактивно»
- команда без идемпотентности

## В Architecture Canvas

Тип связи connection vs data_flow. Reliability в инспекторе.

## Связанные разделы
- protocols-mqtt
- protocols-http
- cpp-safety
