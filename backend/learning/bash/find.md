---
id: bash-find
title: find и чистка артефактов
category: bash
section: Текст
order: 11
description: Ротация csv телеметрии.
tags: [bash, текст]
technologies: [Bash]
related: [linux-disks, bash-redirects, python-files]
---

# find и чистка артефактов

Удалять старше N дней, не rm *. На SD критично.

## Зачем это в робототехнической системе

Каталог /var/lib/robot/telem

## Синтаксис и контракт

```bash
find /var/lib/robot/telem -mtime +7 -delete
```

## Типичные ошибки

- find без -print0 при пробелах
- удаление калибровок тем же правилом

## В Architecture Canvas

Политика данных — docs SBC.

## Связанные разделы
- linux-disks
- bash-redirects
- python-files
