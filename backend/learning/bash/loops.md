---
id: bash-loops
title: Циклы
category: bash
section: Поток
order: 8
description: Ожидание устройства, не busy forever.
tags: [bash, поток]
technologies: [Bash]
related: [bash-if, linux-udev, bash-traps]
---

# Циклы

Ждать udev 10 секунд с backoff. Дальше fail.

## Зачем это в робототехнической системе

Камера появляется позже бута.

## Синтаксис и контракт

```bash
for i in {1..20}; do [[ -e /dev/video0 ]] && break; sleep 0.5; done
```

## Типичные ошибки

- while true без timeout
- sleep 30 «на всякий» в unit

## В Architecture Canvas

Таймаут ожидания — requirement на старт системы.

## Связанные разделы
- bash-if
- linux-udev
- bash-traps
