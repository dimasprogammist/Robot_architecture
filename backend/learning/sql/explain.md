---
id: sql-explain
title: EXPLAIN
category: sql
section: Производительность
order: 10
description: Seq scan журнала.
tags: [sql, производительность]
technologies: [SQL]
related: [sql-index, sql-where, databases-postgres]
---

# EXPLAIN

Перед продакшеном журнала — EXPLAIN ANALYZE на типичный фильтр.

## Зачем это в робототехнической системе

UI «события за сутки» не должен сканировать год.

## Синтаксис и контракт

```sql
EXPLAIN ANALYZE SELECT * FROM events WHERE robot_id=1;
```

## Типичные ошибки

- игнор seq scan потому что «данных мало» на стенде
- оптимизация без измерения

## В Architecture Canvas

Notes таблицы: ожидаемый объём и запросы UI.

## Связанные разделы
- sql-index
- sql-where
- databases-postgres
