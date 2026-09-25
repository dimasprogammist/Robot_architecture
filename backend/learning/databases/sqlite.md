---
id: databases-sqlite
title: SQLite
category: databases
section: Движки
order: 3
description: Файл, транзакции, ограничения записи.
tags: [databases, движки]
technologies: [Databases]
related: [sql-tx, linux-disks, databases-choose]
---

# SQLite

Один writer. Отлично для конфигов и локального журнала. Бэкап = файл.

## Зачем это в робототехнической системе

Калибровки и last_mission на Pi. Не 200 Гц insert.

## Синтаксис и контракт

```sql
PRAGMA journal_mode=WAL;
```

## Типичные ошибки

- сеть NFS и SQLite
- многопроцессная запись без очереди

## В Architecture Canvas

Файл БД — path в docs SBC. ER та же, диалект sqlite в экспорте.

## Связанные разделы
- sql-tx
- linux-disks
- databases-choose
