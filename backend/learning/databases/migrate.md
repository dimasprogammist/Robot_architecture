---
id: databases-migrate
title: Миграции
category: databases
section: Эволюция
order: 7
description: Версия схемы = версия компонента Data.
tags: [databases, эволюция]
technologies: [Databases]
related: [sql-er, git-tag, python-packaging]
---

# Миграции

Alembic/Flyway. Запрет «ALTER руками на проде» без записи.

## Зачем это в робототехнической системе

Добавили колонку firmware_sha — миграция + поле на холсте таблицы devices.

## Синтаксис и контракт

```sql
-- alembic upgrade head
```

## Типичные ошибки

- менять ER в Canvas и забывать миграцию
- destructive drop на поле

## В Architecture Canvas

Версия схемы в notes блока БД. ER и миграции не должны расходиться.

## Связанные разделы
- sql-er
- git-tag
- python-packaging
