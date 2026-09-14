---
id: sql-basics
title: Основы SQL
category: sql
order: 1
description: Таблицы, ключи и связи — основа ER-диаграммы.
tags: [sql, database]
technologies: [SQL, PostgreSQL]
---

# Основы SQL

В Architecture Canvas таблица — семантическая сущность. Из неё генерируется `CREATE TABLE`.

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  login VARCHAR(255) NOT NULL UNIQUE
);
```

Связь 1→N задаётся внешним ключом на стороне «многих».
