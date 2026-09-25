---
id: linux-udev
title: udev и стабильные имена
category: linux
section: Устройства
order: 4
description: Не /dev/ttyUSB0 «какой сегодня».
tags: [linux, устройства]
technologies: [Linux]
related: [linux-fs, linux-permissions, python-serial]
---

# udev и стабильные имена

Правила udev по idVendor/idProduct/serial дают /dev/imu и /dev/lidar.

## Зачем это в робототехнической системе

Два USB-serial: IMU и MCU. Без udev после перетыкания порты меняются — ложный протокол.

## Синтаксис и контракт

```bash
SUBSYSTEM=="tty", ATTRS{serial}=="ABC", SYMLINK+="robot-mcu"
```

## Типичные ошибки

- правило по номеру порта USB-хаба
- не перезагрузить udev после деплоя

## В Architecture Canvas

Имена устройств — в документации связей UART. Hardware notes камеры/IMU.

## Связанные разделы
- linux-fs
- linux-permissions
- python-serial
