---
id: sql-isolation
title: Изоляция и гонки
category: sql
section: Запись
order: 9
description: Два оператора, одна миссия.
tags: [sql, запись]
technologies: [SQL]
related: [sql-tx, python-state-machine]
---

# Изоляция и гонки

Повторный START. Optimistic lock version или SELECT FOR UPDATE осознанно.

## Зачем это в робототехнической системе

Два UI отправили run. БД или супервизор — единственный арбитр.

## Синтаксис и контракт

```sql
-- version INT, UPDATE ... WHERE version=$old
```

## Типичные ошибки

- потерянный апдейт статуса
- FOR UPDATE на всю таблицу events

## В Architecture Canvas

Состояние RUN живёт в супервизоре. БД — факт миссии, не PWM.

## Связанные разделы
- sql-tx
- python-state-machine
