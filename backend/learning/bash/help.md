---
id: bash-help
title: set -x и отладка
category: bash
section: Надёжность
order: 14
description: Видно команду, не секреты.
tags: [bash, надёжность]
technologies: [Bash]
related: [bash-args, linux-ssh, bash-strict]
---

# set -x и отладка

PS4 и xtrace. Маскируйте токены MQTT.

## Зачем это в робототехнической системе

Почему scp не туда — видно с -x.

## Синтаксис и контракт

```bash
bash -x ./flash.sh --dry-run
```

## Типичные ошибки

- -x в проде с паролями
- отладка на живых моторах

## В Architecture Canvas

Стенд tooling отдельно от RUN.

## Связанные разделы
- bash-args
- linux-ssh
- bash-strict
