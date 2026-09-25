---
id: software-architecture-observe
title: Наблюдаемость
category: software-architecture
section: Эксплуатация
order: 8
description: Логи, метрики, трассы.
tags: [software-architecture, эксплуатация]
technologies: [Software Architecture]
related: [python-logging, linux-journalctl, sql-intro]
---

# Наблюдаемость

correlation id миссии в логах шлюза и MCU seq. Иначе инцидент не собрать.

## Зачем это в робототехнической системе

journald + MQTT fault + SQL events.

## Синтаксис и контракт

```text
mission_id, seq, mode
```

## Типичные ошибки

- метрики без меток робота
- PII в логах камеры

## В Architecture Canvas

Документ observability у системы.

## Связанные разделы
- python-logging
- linux-journalctl
- sql-intro
