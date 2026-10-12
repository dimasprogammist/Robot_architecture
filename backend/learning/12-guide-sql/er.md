---
id: sql-er
title: ER и генерация SQL
category: sql
section: Практика Canvas
order: 13
description: Таблица как компонент.
tags: [sql, практика canvas]
technologies: [SQL]
related: [sql-keys, sql-join]
---

# ER и генерация SQL

Таблица — сущность с колонками. Связь «один ко многим» задаёт внешний ключ. Связь «многие ко многим» — отдельная таблица-связка.

## Зачем это в робототехнической системе

Спроектируйте users/projects, затем диалект PostgreSQL и скачайте .sql.

## Синтаксис и контракт

```sql
-- CREATE TABLE users (...);
-- CONSTRAINT fk_ ...
```

## Типичные ошибки

- рисовать ER картинкой вне модели
- имена таблиц с пробелами без правил

## Связанные разделы
- sql-keys
- sql-join
