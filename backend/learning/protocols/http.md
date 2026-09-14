---
id: protocols-http
title: HTTP/HTTPS
category: protocols
section: Прикладные
order: 3
description: Команды и REST, не тик.
tags: [protocols, прикладные]
technologies: [Protocols]
related: [python-fastapi, networking-tls, python-pydantic]
---

# HTTP/HTTPS

Идемпотентность GET, команды POST с id. TLS между цехами.

## Зачем это в робототехнической системе

Старт миссии, загрузка карты, статус.

## Синтаксис и контракт

```text
POST /cmd/twist  {"vx":0.2,"wz":0}
```

## Типичные ошибки

- PUT уставки колёс 50 Гц
- нет auth на /cmd

## В Architecture Canvas

Протокол HTTP цвет. API блок. Pydantic схемы.

## Связанные разделы
- python-fastapi
- networking-tls
- python-pydantic
