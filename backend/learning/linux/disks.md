---
id: linux-disks
title: Диски, overlay, износ SD
category: linux
section: Надёжность
order: 11
description: Логи убивают SD-карту.
tags: [linux, надёжность]
technologies: [Linux]
related: [linux-journalctl, linux-fs, linux-realtime]
---

# Диски, overlay, износ SD

Pi на SD: journal на volatile или USB/SSD. Overlayroot для киоска.

## Зачем это в робототехнической системе

Телеметрия 50 Гц в файл на SD — через месяц карта read-only, робот «загадочно» не пишет калибровку.

## Синтаксис и контракт

```bash
df -h
findmnt
```

## Типичные ошибки

- без мониторинга read-only remount
- swap на SD

## В Architecture Canvas

Hardware notes SBC: носитель, политика логов.

## Связанные разделы
- linux-journalctl
- linux-fs
- linux-realtime
