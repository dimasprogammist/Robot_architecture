---
id: git-merge
title: merge
category: git
section: Ветвление
order: 5
description: Слияние с историей.
tags: [git, ветвление]
technologies: [Git]
related: [git-conflict, git-rebase, cpp-modbus]
---

# merge

Подходит для релизов. Конфликты в картах регистров решайте явно.

## Зачем это в робототехнической системе

Два человека добавили holding register 40010. Нужна таблица, не «оба».

## Синтаксис и контракт

```bash
git merge --no-ff release/1.4
```

## Типичные ошибки

- merge без прочтения карты регистров
- игнор конфликтных бинарников

## В Architecture Canvas

Документ карты регистров — единственный источник, код — зеркало.

## Связанные разделы
- git-conflict
- git-rebase
- cpp-modbus
