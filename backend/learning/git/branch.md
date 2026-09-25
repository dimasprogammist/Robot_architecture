---
id: git-branch
title: Ветки
category: git
section: Ветвление
order: 4
description: feature/estop, release/1.4.
tags: [git, ветвление]
technologies: [Git]
related: [git-merge, git-tag, git-commit]
---

# Ветки

Не держите 30 долгоживущих веток прошивки «на всякий борт».

## Зачем это в робототехнической системе

hotfix на роботе №7 — ветка от tag, не от чужого эксперимента SLAM.

## Синтаксис и контракт

```bash
git switch -c feature/can-filter
```

## Типичные ошибки

- коммиты напрямую в main на стенде
- ветка на каждого инженера без rebase/merge

## В Architecture Canvas

Architecture version в Canvas ≠ git branch, но релизный tag связывает.

## Связанные разделы
- git-merge
- git-tag
- git-commit
