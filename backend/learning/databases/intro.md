---
id: databases-intro
title: Зачем БД роботу
category: databases
section: Выбор
order: 1
description: Состояние мира vs поток сенсоров.
tags: [databases, выбор]
technologies: [Databases]
related: [sql-intro, databases-choose]
---

# Зачем БД роботу

БД хранит факты: кто, какая миссия, какая калибровка, какой BOM. Поток лидара — не Postgres на SD.

## Зачем это в робототехнической системе

Супервизор — источник RUN. БД — журнал и конфигурация.

## Синтаксис и контракт

```sql
-- missions, devices, events, calib
```

## Типичные ошибки

- заменить брокер базой
- хранить STL в bytea без нужды

## В Architecture Canvas

ER-диаграмма проекта. Блок PostgreSQL на системном холсте — runtime, таблицы — на холсте БД.

## Связанные разделы
- sql-intro
- databases-choose
