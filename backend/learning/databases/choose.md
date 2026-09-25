---
id: databases-choose
title: Как выбрать движок
category: databases
section: Выбор
order: 2
description: SQLite, Postgres, Redis, ничего.
tags: [databases, выбор]
technologies: [Databases]
related: [databases-sqlite, databases-postgres, databases-redis]
---

# Как выбрать движок

Один робот оффлайн — SQLite. Парк + UI — Postgres. Кэш/сессии — Redis. MCU — не БД.

## Зачем это в робототехнической системе

Тележка в поле без сети: SQLite на SBC. Диспетчерская — Postgres.

## Синтаксис и контракт

```sql
-- sqlite3 robot.db
-- postgres dsn
```

## Типичные ошибки

- Mongo «потому что JSON» без модели
- Redis как единственное хранилище миссий

## В Architecture Canvas

Поле dialect у DatabaseInfo и тип блока DATA.

## Связанные разделы
- databases-sqlite
- databases-postgres
- databases-redis
