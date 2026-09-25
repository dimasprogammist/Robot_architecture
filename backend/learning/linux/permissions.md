---
id: linux-permissions
title: Права, пользователи, groups
category: linux
section: Основы
order: 3
description: dialout, gpio, не всё от root.
tags: [linux, основы]
technologies: [Linux]
related: [linux-udev, linux-systemd, linux-ssh]
---

# Права, пользователи, groups

Сервис робота — отдельный user в группах dialout/i2c/gpio. Root скрывает ошибки прав до продакшена.

## Зачем это в робототехнической системе

Пользователь robot читает ttyACM0. Прошивка через systemd-сервис с DeviceAllow.

## Синтаксис и контракт

```bash
id robot
ls -l /dev/ttyACM0
```

## Типичные ошибки

- chmod 777 на /dev
- пароль pi/raspberry в изделии

## В Architecture Canvas

В notes SBC: user сервиса и группы. Это требование безопасности.

## Связанные разделы
- linux-udev
- linux-systemd
- linux-ssh
