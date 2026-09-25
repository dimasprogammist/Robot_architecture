---
id: git-remote
title: push, pull, review
category: git
section: Совместная работа
order: 8
description: Защита main.
tags: [git, совместная работа]
technologies: [Git]
related: [git-tag, cpp-safety, git-branch]
---

# push, pull, review

CI на парсеры. Review обязателен на протокол и ESTOP.

## Зачем это в робототехнической системе

Правка ISR ESTOP без ревью — нарушение процесса безопасности.

## Синтаксис и контракт

```bash
git push -u origin feature/estop
```

## Типичные ошибки

- force push main
- обход CI «очень надо на выставку»

## В Architecture Canvas

Требования must к процессу — в requirements проекта.

## Связанные разделы
- git-tag
- cpp-safety
- git-branch
