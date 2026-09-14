---
id: sql-tx
title: Транзакции
category: sql
section: Запись
order: 8
description: Атомарность миссии.
tags: [sql, запись]
technologies: [SQL]
related: [sql-isolation, python-fastapi, sql-keys]
---

# Транзакции

Создать миссию + точки маршрута — одна транзакция. Иначе полусохранённый маршрут.

## Зачем это в робототехнической системе

BEGIN; INSERT mission; INSERT waypoints; COMMIT;

## Синтаксис и контракт

```sql
BEGIN;
INSERT INTO missions(name) VALUES ('dock');
COMMIT;
```

## Типичные ошибки

- автокоммит по строке в загрузчике карты
- длинная транзакция на UI-клик с сетью

## В Architecture Canvas

Инварианты — requirements + транзакция в сервисе.

## Связанные разделы
- sql-isolation
- python-fastapi
- sql-keys
