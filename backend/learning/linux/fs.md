---
id: linux-fs
title: Файловая система и пути
category: linux
section: Основы
order: 2
description: FHS, /etc, /var, /dev.
tags: [linux, основы]
technologies: [Linux]
related: [linux-permissions, linux-udev, python-files]
---

# Файловая система и пути

/dev — устройства, /etc — конфиги, /var/lib — состояние, /opt или /usr/local — сервисы.

## Зачем это в робототехнической системе

Калибровка в /var/lib/robot, unit в /etc/systemd/system, UART /dev/ttyACM0.

## Синтаксис и контракт

```bash
ls /dev/ttyACM* /dev/ttyUSB* /dev/can*
```

## Типичные ошибки

- хранить конфиг в домашней папке pi и запускать из systemd без User=
- относительные пути

## В Architecture Canvas

Документация Linux-компонента: абсолютные пути артефактов.

## Связанные разделы
- linux-permissions
- linux-udev
- python-files
