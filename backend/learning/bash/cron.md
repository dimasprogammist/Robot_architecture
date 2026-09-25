---
id: bash-cron
title: cron/timers systemd
category: bash
section: Расписание
order: 12
description: Бэкап, не контроль.
tags: [bash, расписание]
technologies: [Bash]
related: [linux-systemd, bash-intro, linux-disks]
---

# cron/timers systemd

systemd timer лучше cron на изделии: логи, зависимостей.

## Зачем это в робототехнической системе

Ночной бэкап калибровок на USB.

## Синтаксис и контракт

```bash
OnCalendar=*-*-* 03:00:00
```

## Типичные ошибки

- cron с GUI-окружением
- задача, которая двигает робота

## В Architecture Canvas

Блок maintenance на холсте операций.

## Связанные разделы
- linux-systemd
- bash-intro
- linux-disks
