---
id: linux-systemd
title: systemd unit
category: linux
section: Процессы
order: 6
description: Автозапуск шлюза.
tags: [linux, процессы]
technologies: [Linux]
related: [linux-journalctl, linux-processes, docker-compose]
---

# systemd unit

Restart=on-failure, WatchdogSec, After=network-online, User=robot, SupplementaryGroups=dialout.

## Зачем это в робототехнической системе

Робот включили — шлюз поднялся, MQTT last will сработал при падении.

## Синтаксис и контракт

```bash
[Service]
ExecStart=/usr/bin/robot-svc
Restart=on-failure
```

## Типичные ошибки

- Restart=always без backoff при Hardware Fault
- WorkingDirectory не задан

## В Architecture Canvas

Запуск — README блока SBC/Backend. Связь с MQTT брокером: After=mosquitto.

## Связанные разделы
- linux-journalctl
- linux-processes
- docker-compose
