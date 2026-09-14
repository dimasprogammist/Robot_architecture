---
id: bash-if
title: if, test, [[ ]]
category: bash
section: Поток
order: 7
description: Проверки устройства.
tags: [bash, поток]
technologies: [Bash]
related: [linux-udev, linux-systemd, bash-strict]
---

# if, test, [[ ]]

Перед стартом сервиса: есть ли /dev/robot-mcu. Нет — не стартовать RUN, unit failed.

## Зачем это в робототехнической системе

ExecStartPre=/usr/lib/robot/check-dev.sh

## Синтаксис и контракт

```bash
if [[ ! -e /dev/robot-mcu ]]; then exit 1; fi
```

## Типичные ошибки

- -e vs -L на symlink udev
- проверка ping как «MCU жив» без протокола

## В Architecture Canvas

Precondition компонента шлюза.

## Связанные разделы
- linux-udev
- linux-systemd
- bash-strict
