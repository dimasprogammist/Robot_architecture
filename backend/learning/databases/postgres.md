---
id: databases-postgres
title: PostgreSQL
category: databases
section: Движки
order: 4
description: Парк, JSONB, надёжный SQL.
tags: [databases, движки]
technologies: [Databases]
related: [sql-jsonb, sql-index, databases-backup]
---

# PostgreSQL

Роли, timestamptz, FK. Основной диалект экспорта Canvas.

## Зачем это в робототехнической системе

Диспетчер, пользователи, отчёты FAULT по смене.

## Синтаксис и контракт

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## Типичные ошибки

- суперпользователь из приложения
- без бэкапов WAL

## В Architecture Canvas

Блок PostgreSQL + холст таблиц. SQL export postgresql.

## Связанные разделы
- sql-jsonb
- sql-index
- databases-backup
