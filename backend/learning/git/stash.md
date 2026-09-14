---
id: git-stash
title: stash
category: git
section: Инструменты
order: 10
description: Карман для локальной грязи.
tags: [git, инструменты]
technologies: [Git]
related: [git-commit, python-config, git-clone]
---

# stash

Не stash на две недели калибровочных коэффициентов — это должен быть файл и коммит.

## Зачем это в робототехнической системе

Переключились посмотреть чужой CAN-фильтр.

## Синтаксис и контракт

```bash
git stash push -m 'wip imu bias'
```

## Типичные ошибки

- stash секретов
- потеря stash на другом ПК

## В Architecture Canvas

Калибровки — файлы в /var или репозиторий config, не stash.

## Связанные разделы
- git-commit
- python-config
- git-clone
