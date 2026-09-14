---
id: linux-ssh
title: SSH и доступ к изделию
category: linux
section: Сеть ОС
order: 8
description: Ключи, не пароль в цехе.
tags: [linux, сеть ос]
technologies: [Linux]
related: [linux-permissions, linux-firewall]
---

# SSH и доступ к изделию

Только ключи, отдельный user, порт не обязательно 22 в публичной сети. Tunnel для MQTT отладки.

## Зачем это в робототехнической системе

Инженер настраивает робота в поле. Пароль raspberry — инцидент.

## Синтаксис и контракт

```bash
ssh -i robot.ed25519 robot@10.0.0.21
```

## Типичные ошибки

- permit root login
- общий ключ на 40 роботов без учёта

## В Architecture Canvas

Доступ — вложенный холст операций, не runtime-архитектура, но требование безопасности.

## Связанные разделы
- linux-permissions
- linux-firewall
