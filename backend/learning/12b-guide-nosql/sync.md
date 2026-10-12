---
id: databases-sync
title: Синхронизация борт↔облако
category: databases
section: Потоки
order: 11
description: Оффлайн очередь.
tags: [databases, потоки]
technologies: [Databases]
related: [sql-crud, networking-nat, python-asyncio]
---

# Синхронизация борт↔облако

Робот копит события, при сети — upload. Идемпотентные id.

## Зачем это в робототехнической системе

Шахта/поле: связь пропадает. Миссии не теряются.

## Синтаксис и контракт

```sql
-- UUID pk, replicated_at
```

## Типичные ошибки

- wall clock как id
- синхронный insert в облако из control loop

## Связанные разделы
- sql-crud
- networking-nat
- python-asyncio
