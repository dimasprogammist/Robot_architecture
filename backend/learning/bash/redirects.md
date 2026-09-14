---
id: bash-redirects
title: Перенаправления
category: bash
section: Поток
order: 6
description: stdin/out/err, tee.
tags: [bash, поток]
technologies: [Bash]
related: [bash-pipes, linux-fs, git-lfs]
---

# Перенаправления

Лог прошивки в файл и на экран: tee. Пароль не в лог.

## Зачем это в робототехнической системе

esptool 2>&1 | tee flash.log

## Синтаксис и контракт

```bash
make 2>&1 | tee build.log
```

## Типичные ошибки

- закрыть stdin сервиса так, что serial отвалился
- перезаписать калибровку > вместо >> без бэкапа

## В Architecture Canvas

Артефакты flash.log — attached notes версии.

## Связанные разделы
- bash-pipes
- linux-fs
- git-lfs
