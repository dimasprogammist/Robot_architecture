---
id: databases-tsdb
title: Временные ряды
category: databases
section: Потоки
order: 10
description: Когда SQL уже не тот инструмент.
tags: [databases, потоки]
technologies: [Databases]
related: [sql-intro, databases-choose, python-generators]
---

# Временные ряды

Timescale/Influx/файлы parquet. Отдельный контур от OLTP миссий.

## Зачем это в робототехнической системе

График тока за смену — TSDB. Список миссий — Postgres.

## Синтаксис и контракт

```sql
-- hypertable(ts, robot_id)
```

## Типичные ошибки

- гипертаблица «на всё» включая users
- высокая cardinality id без плана

## В Architecture Canvas

Не смешивайте на одном ER-холсте OLTP и 10кГц ряды без необходимости.

## Связанные разделы
- sql-intro
- databases-choose
- python-generators
