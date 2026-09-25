---
id: docker-ci
title: Образы в CI
category: docker
section: Практика
order: 12
description: Теги sha, не latest на роботе.
tags: [docker, практика]
technologies: [Docker]
related: [git-tag, docker-file, python-packaging]
---

# Образы в CI

Робот pin digest. latest только на стенде инженера.

## Зачем это в робототехнической системе

Откат — предыдущий digest, не «починить на живую».

## Синтаксис и контракт

```dockerfile
image: registry/robot-svc@sha256:...
```

## Типичные ошибки

- pull latest ночью без тестов
- разный digest на двух колёсных роботах «одного парка» без учёта

## В Architecture Canvas

version компонента = digest/tag.

## Связанные разделы
- git-tag
- docker-file
- python-packaging
