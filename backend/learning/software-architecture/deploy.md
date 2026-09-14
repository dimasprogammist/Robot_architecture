---
id: software-architecture-deploy
title: Поставка
category: software-architecture
section: Эксплуатация
order: 9
description: Пин версий набора.
tags: [software-architecture, эксплуатация]
technologies: [Software Architecture]
related: [git-tag, docker-ci, protocols-versioning]
---

# Поставка

Прошивка + шлюз + UI + схема БД. Матрица совместимости протоколов.

## Зачем это в робототехнической системе

Релиз v1.4: firmware 1.4.0, svc 1.4.1, uart proto v2.

## Синтаксис и контракт

```text
compatibility matrix
```

## Типичные ошибки

- обновили только UI
- нет отката

## В Architecture Canvas

version на блоках. tag git. docker digest.

## Связанные разделы
- git-tag
- docker-ci
- protocols-versioning
