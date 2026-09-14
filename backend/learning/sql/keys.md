---
id: sql-keys
title: PRIMARY/UNIQUE/FK
category: sql
section: Схема
order: 6
description: Целостность важнее удобства JSON.
tags: [sql, схема]
technologies: [SQL]
related: [sql-join, sql-er, sql-tx]
---

# PRIMARY/UNIQUE/FK

PK, UNIQUE login, FK user_id. ON DELETE согласуйте с доменом: нельзя молча удалить робота с журналом безопасности.

## Зачем это в робототехнической системе

Удаление устройства — политика. Для аудита чаще RESTRICT.

## Синтаксис и контракт

```sql
ALTER TABLE projects ADD CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users(id);
```

## Типичные ошибки

- нет FK «потому что ORM»
- каскад, стирающий audit

## В Architecture Canvas

ER-связи Canvas генерируют FK. Проверьте cardinality.

## Связанные разделы
- sql-join
- sql-er
- sql-tx
