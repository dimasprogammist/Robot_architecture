---
id: databases-backup
title: Бэкапы и restore
category: databases
section: Эволюция
order: 8
description: Журнал безопасности имеет ценность.
tags: [databases, эволюция]
technologies: [Databases]
related: [databases-postgres, linux-disks]
---

# Бэкапы и restore

pg_dump по расписанию. Проверяйте restore. SQLite — копируйте файл атомарно.

## Зачем это в робототехнической системе

После инцидента нужны события, не «диск умер вместе с правдой».

## Синтаксис и контракт

```sql
pg_dump -Fc robot > robot.dump
```

## Типичные ошибки

- бэкап рядом на той же SD
- никогда не пробовали restore

## В Architecture Canvas

Требование must: хранение журнала N суток.

## Связанные разделы
- databases-postgres
- linux-disks
