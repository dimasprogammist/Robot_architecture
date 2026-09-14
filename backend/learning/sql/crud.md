---
id: sql-crud
title: INSERT/UPDATE/DELETE
category: sql
section: Запись
order: 11
description: Идемпотентность команд.
tags: [sql, запись]
technologies: [SQL]
related: [sql-keys, sql-tx, python-pydantic]
---

# INSERT/UPDATE/DELETE

Повтор HTTP не должен плодить 3 миссии. UNIQUE + upsert где нужно.

## Зачем это в робототехнической системе

Кнопка «сохранить карту» дважды.

## Синтаксис и контракт

```sql
INSERT INTO maps(id, body) VALUES ($1,$2) ON CONFLICT (id) DO UPDATE SET body=EXCLUDED.body;
```

## Типичные ошибки

- DELETE FROM без WHERE
- update статуса без where id

## В Architecture Canvas

API компонента Data = эти операторы. ER показывает таблицы.

## Связанные разделы
- sql-keys
- sql-tx
- python-pydantic
