---
id: sql-where
title: WHERE и предикаты
category: sql
section: Чтение
order: 3
description: Фильтры событий робота.
tags: [sql, чтение]
technologies: [SQL]
related: [sql-index, sql-join, sql-explain]
---

# WHERE и предикаты

Индексируемые предикаты. Не оборачивайте колонку в функцию, если нужен индекс.

## Зачем это в робототехнической системе

События робота_id и времени — типичный фильтр.

## Синтаксис и контракт

```sql
WHERE robot_id = $1 AND created_at >= $2
```

## Типичные ошибки

- WHERE DATE(created_at)=today() на большом журнале
- строковое сравнение uuid

## В Architecture Canvas

Индексы нарисуйте в инспекторе таблицы.

## Связанные разделы
- sql-index
- sql-join
- sql-explain
