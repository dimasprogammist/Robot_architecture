---
id: bash-intro
title: Bash как клей
category: bash
section: Основы
order: 1
description: Скрипты деплоя, не control loop.
tags: [bash, основы]
technologies: [Bash]
related: [bash-strict, bash-args, linux-systemd]
---

# Bash как клей

Bash запускает, проверяет, прошивает. Не считает PID.

## Зачем это в робототехнической системе

flash.sh, healthcheck.sh, backup-calib.sh.

## Синтаксис и контракт

```bash
#!/usr/bin/env bash
set -euo pipefail
```

## Типичные ошибки

- bash на 500 строк с логикой навигации
- нет set -euo

## В Architecture Canvas

Скрипты — блок Tooling.

## Связанные разделы
- bash-strict
- bash-args
- linux-systemd
