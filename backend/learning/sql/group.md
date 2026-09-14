---
id: sql-group
title: GROUP BY и агрегаты
category: sql
section: Чтение
order: 5
description: Сколько FAULT за смену.
tags: [sql, чтение]
technologies: [SQL]
related: [sql-select, sql-index, sql-explain]
---

# GROUP BY и агрегаты

COUNT/AVG по robot_id. HAVING после агрегата.

## Зачем это в робототехнической системе

Дашборд парка роботов, не realtime PID.

## Синтаксис и контракт

```sql
SELECT robot_id, COUNT(*) FROM events WHERE code='FAULT' GROUP BY robot_id;
```

## Типичные ошибки

- SELECT * с GROUP BY некорректно
- агрегат в приложении циклом без нужды

## В Architecture Canvas

Отчётные запросы — документ блока Analytics, если появится.

## Связанные разделы
- sql-select
- sql-index
- sql-explain
