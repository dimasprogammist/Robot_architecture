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

В Architecture Canvas таблица — сущность с колонками. Связь 1–N создаёт FK. N–N — junction в SQL.

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

## В Architecture Canvas

Раздел База данных слева. Инспектор колонок. Экспорт SQL.

## Связанные разделы
- sql-keys
- sql-join
