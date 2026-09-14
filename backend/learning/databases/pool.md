---
id: databases-pool
title: Пулы соединений
category: databases
section: Эксплуатация
order: 9
description: Не коннект на каждый MQTT.
tags: [databases, эксплуатация]
technologies: [Databases]
related: [python-fastapi, databases-postgres, sql-tx]
---

# Пулы соединений

HTTP API держит pool. Фоновый consumer — свой бюджет коннектов.

## Зачем это в робототехнической системе

Шлюз не открывает Postgres на каждый кадр IMU.

## Синтаксис и контракт

```sql
-- pool_size=5
```

## Типичные ошибки

- утечка коннектов при исключении
- pool больше чем max_connections

## В Architecture Canvas

Notes Backend: кто ходит в БД. MCU — никто.

## Связанные разделы
- python-fastapi
- databases-postgres
- sql-tx
