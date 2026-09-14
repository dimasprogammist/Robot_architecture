---
id: sql-views
title: VIEW
category: sql
section: Практика Canvas
order: 14
description: Готовые срезы для UI.
tags: [sql, практика canvas]
technologies: [SQL]
related: [sql-select, sql-er]
---

# VIEW

VIEW last_faults — не путать с таблицей. Обновляемость ограничена.

## Зачем это в робототехнической системе

Оператор видит безопасный срез без PII, если спрячете колонки.

## Синтаксис и контракт

```sql
CREATE VIEW last_faults AS SELECT ...;
```

## Типичные ошибки

- вместо индекса сделать view и ждать ускорения
- view, скрывающая тяжёлый join без docs

## В Architecture Canvas

В будущем entity view. Сейчас — notes/SQL вручную после базовых таблиц.

## Связанные разделы
- sql-select
- sql-er
