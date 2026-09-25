---
id: sql-select
title: SELECT и проекция
category: sql
section: Чтение
order: 2
description: Только нужные колонки.
tags: [sql, чтение]
technologies: [SQL]
related: [sql-where, sql-index, python-fastapi]
---

# SELECT и проекция

Операторский UI не тянет BYTEA карт. Список миссий — id, name, status.

## Зачем это в робототехнической системе

Экран «последние FAULT» — узкий select.

## Синтаксис и контракт

```sql
SELECT id, code, created_at FROM events WHERE severity = 'FAULT';
```

## Типичные ошибки

- SELECT * в API
- отсутствие LIMIT на бесконечном журнале

## В Architecture Canvas

Колонки таблицы в ER = контракт API list-эндпоинта.

## Связанные разделы
- sql-where
- sql-index
- python-fastapi
