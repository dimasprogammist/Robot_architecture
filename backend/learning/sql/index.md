---
id: sql-index
title: Индексы
category: sql
section: Схема
order: 7
description: B-tree на фильтры, не на всё.
tags: [sql, схема]
technologies: [SQL]
related: [sql-explain, sql-where, databases-postgres]
---

# Индексы

Индекс (robot_id, created_at) под журнал. Лишние индексы бьют запись калибровок.

## Зачем это в робототехнической системе

Вставка события FAULT не должна тормозить из-за 12 индексов «на будущее».

## Синтаксис и контракт

```sql
CREATE INDEX idx_events_robot_time ON events (robot_id, created_at);
```

## Типичные ошибки

- уникальный индекс на часто меняющееся float
- индекс как замена нормализации

## В Architecture Canvas

Table indexes в инспекторе. SQL export пишет CREATE INDEX.

## Связанные разделы
- sql-explain
- sql-where
- databases-postgres
