---
id: networking-time-sync
title: Синхронизация времени
category: networking
section: Эксплуатация
order: 12
description: Логи и сенсоры.
tags: [networking, эксплуатация]
technologies: [Networking]
related: [python-datetime, cpp-chrono, sql-intro]
---

# Синхронизация времени

NTP/PTP для штампов камер и журнала. Контур MCU — свои часы. Не путать.

## Зачем это в робототехнической системе

Склейка видео и CAN логов для разбора инцидента.

## Синтаксис и контракт

```text
timedatectl status
```

## Типичные ошибки

- wall clock в PID
- разъехавшиеся часы двух SBC

## В Architecture Canvas

Штампы в ER events — timestamptz. В PID — monotonic.

## Связанные разделы
- python-datetime
- cpp-chrono
- sql-intro
