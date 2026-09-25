---
id: linux-processes
title: Процессы, сигналы, nice
category: linux
section: Процессы
order: 5
description: ps, top, SIGTERM.
tags: [linux, процессы]
technologies: [Linux]
related: [linux-systemd, linux-journalctl]
---

# Процессы, сигналы, nice

Сервис должен корректно гасить PWM-уставки на SIGTERM (systemd stop), не только kill -9.

## Зачем это в робототехнической системе

Перед обновлением: stop сервиса → безопасный coast → flash.

## Синтаксис и контракт

```bash
ps aux | grep robot
kill -TERM $(pidof robot-svc)
```

## Типичные ошибки

- kill -9 как обычный рестарт
- зомби-процессы драйвера камеры, держащие /dev/video0

## В Architecture Canvas

Алгоритм shutdown компонента API/Supervisor.

## Связанные разделы
- linux-systemd
- linux-journalctl
