---
id: git-rebase
title: rebase
category: git
section: Ветвление
order: 6
description: Линейная история feature.
tags: [git, ветвление]
technologies: [Git]
related: [git-merge, git-commit, git-remote]
---

# rebase

Не rebase публичных release. Для локальной feature — ок.

## Зачем это в робототехнической системе

Перед PR шлюза rebase на main, прогоните тесты CRC.

## Синтаксис и контракт

```bash
git rebase main
```

## Типичные ошибки

- rebase уже запушенной release
- force push в shared ветку прошивки цеха

## Связанные разделы
- git-merge
- git-commit
- git-remote
