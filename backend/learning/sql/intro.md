---
id: sql-intro
title: SQL в робототехническом стеке
category: sql
section: Основы
order: 1
description: Что хранить: не тики 1 кГц.
tags: [sql, основы]
technologies: [SQL]
related: [sql-select, databases-choose]
---

# SQL в робототехническом стеке

БД — миссии, пользователи, события, калибровки, BOM-ссылки. Не поток IMU. Для потока — файлы, TSDB, брокер.

## Зачем это в робототехнической системе

Таблица missions, events, devices. Телеметрия 100 Гц — Timescale/файлы, отдельное решение.

## Синтаксис и контракт

```sql
SELECT now();
```

## Типичные ошибки

- писать каждый сэмпл IMU в Postgres на SD
- один JSON-столбец «на всё» без нужды

## В Architecture Canvas

Режим База данных в Canvas — семантическая ER, затем Export SQL.

## Связанные разделы
- sql-select
- databases-choose
