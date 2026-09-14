---
id: databases-mysql
title: MySQL/MariaDB
category: databases
section: Движки
order: 5
description: Когда уже стоит на заводе.
tags: [databases, движки]
technologies: [Databases]
related: [sql-er, databases-choose, sql-tx]
---

# MySQL/MariaDB

Часто данность IT. Типы и JSON отличаются. Экспорт Canvas умеет mysql.

## Зачем это в робототехнической системе

Интеграция с существущим MES, не «ещё один Postgres назло».

## Синтаксис и контракт

```sql
-- ENGINE=InnoDB
```

## Типичные ошибки

- MyISAM для журнала безопасности
- разный sql_mode на стенде и заводе

## В Architecture Canvas

Выберите диалект MySQL в панели SQL.

## Связанные разделы
- sql-er
- databases-choose
- sql-tx
