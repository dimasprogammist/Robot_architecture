---
id: sql-join
title: JOIN
category: sql
section: Чтение
order: 4
description: Пользователи и миссии, устройства и события.
tags: [sql, чтение]
technologies: [SQL]
related: [sql-er, sql-keys]
---

# JOIN

1–N как на ER-холсте. JOIN в SQL должен совпасть с Connection cardinality.

## Зачем это в робототехнической системе

users 1—N projects в учебном примере Canvas.

## Синтаксис и контракт

```sql
SELECT p.name, u.login FROM projects p JOIN users u ON u.id = p.user_id;
```

## Типичные ошибки

- JOIN без ключей, декартово
- N–N без промежуточной таблицы

## В Architecture Canvas

Связь таблиц на ER = JOIN. SQL export это проверяет.

## Связанные разделы
- sql-er
- sql-keys
