---
id: app-links
title: Связи
category: app
section: Холст
order: 6
description: Протокол, направление, данные.
tags: [app, холст]
technologies: [Architecture Canvas]
related: [app-protocols, protocols-intro, app-export-ai]
---

# Связи

Соедините хендлы. В инспекторе: протокол, пример payload, частота, надёжность, цвет.

## Зачем это в робототехнической системе

PLC — Modbus TCP → Python. Подпись на линии.

## Синтаксис и контракт

```text
Инспектор связи
```

## Типичные ошибки

- связь без протокола «чтобы было»
- ESTOP через MQTT без GPIO-ребра

## В Architecture Canvas

Цвет по типу протокола, override вручную.

## Связанные разделы
- app-protocols
- protocols-intro
- app-export-ai
