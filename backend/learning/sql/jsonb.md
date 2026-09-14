---
id: sql-jsonb
title: JSON в SQL
category: sql
section: Типы SQL
order: 12
description: Гибкость vs ER.
tags: [sql, типы sql]
technologies: [SQL]
related: [sql-select, databases-postgres, python-json]
---

# JSON в SQL

JSONB для редких атрибутов устройства. Колонками — то, по чему фильтруете и связываете.

## Зачем это в робототехнической системе

params калибровки можно JSONB. robot_id — колонка.

## Синтаксис и контракт

```sql
SELECT params->>'bias_x' FROM imu_calib;
```

## Типичные ошибки

- вся архитектура в одном jsonb
- поиск по jsonb без GIN, удивляясь тормозам

## В Architecture Canvas

Если поле в ER-колонке, не дублируйте только в JSON.

## Связанные разделы
- sql-select
- databases-postgres
- python-json
