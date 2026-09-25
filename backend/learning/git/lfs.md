---
id: git-lfs
title: Git LFS и бинарники
category: git
section: Релизы
order: 12
description: STL, датасеты, не в обычный git.
tags: [git, релизы]
technologies: [Git]
related: [git-tag, app-stl, python-files]
---

# Git LFS и бинарники

STL механики в Canvas — файлы приложения. В git — LFS или artifactory. Не раздувайте клон.

## Зачем это в робототехнической системе

Колесо v2.stl 40 МБ × 80 коммитов убивает CI.

## Синтаксис и контракт

```bash
git lfs track '*.stl'
```

## Типичные ошибки

- lfs не поставить на CI runner
- хранить веса нейросети без версии

## В Architecture Canvas

AttachedFile в Canvas указывает filename+version. В git — тот же version.

## Связанные разделы
- git-tag
- app-stl
- python-files
