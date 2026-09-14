---
id: git-clone
title: clone и remote
category: git
section: Основы
order: 2
description: Откуда изделие получает код — не git pull на роботе как процесс.
tags: [git, основы]
technologies: [Git]
related: [git-branch, docker-intro, linux-systemd]
---

# clone и remote

Сборка в CI, на робот — артефакт. git на изделии — исключение для стенда.

## Зачем это в робототехнической системе

Инженер клонирует стенд, робот получает deb/docker.

## Синтаксис и контракт

```bash
git clone git@host:org/robot.git
```

## Типичные ошибки

- на изделии ветка develop
- https пароль в unit-файле

## В Architecture Canvas

Поставка — отдельный блок CI/CD в будущем; пока notes компонента.

## Связанные разделы
- git-branch
- docker-intro
- linux-systemd
