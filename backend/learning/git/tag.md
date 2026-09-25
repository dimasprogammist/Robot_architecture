---
id: git-tag
title: Теги и релизы
category: git
section: Релизы
order: 9
description: v1.4.0-firmware, semver протокола отдельно.
tags: [git, релизы]
technologies: [Git]
related: [git-commit, python-packaging, git-lfs]
---

# Теги и релизы

Прошивка, шлюз, схема БД могут версионироваться раздельно, но релиз робота — набор pin.

## Зачем это в робототехнической системе

На холсте version блоков = git tag артефакта.

## Синтаксис и контракт

```bash
git tag -a v1.4.0 -m 'drive pid antiwindup'
```

## Типичные ошибки

- один tag на всё при несовместимом UART
- перезапись tag

## В Architecture Canvas

Export JSON архитектуры кладите рядом с tag.

## Связанные разделы
- git-commit
- python-packaging
- git-lfs
