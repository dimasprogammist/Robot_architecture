---
id: databases-redis
title: Redis
category: databases
section: Движки
order: 6
description: Кэш, очередь, не система записи правды.
tags: [databases, движки]
technologies: [Databases]
related: [python-queues, databases-choose]
---

# Redis

Последняя телеметрия для UI, lock, rate limit. Миссии — в SQL.

## Зачем это в робототехнической системе

Ключ robot:{id}:pose с TTL. Рестарт Redis не должен забывать маршрут в SQL.

## Синтаксис и контракт

```sql
SET robot:1:pose '{...}' EX 2
```

## Типичные ошибки

- единственное хранилище ESTOP в Redis
- без TTL и утечка ключей

## В Architecture Canvas

Блок Redis категории DATA. Связь с Backend — протокол Redis/TCP.

## Связанные разделы
- python-queues
- databases-choose
