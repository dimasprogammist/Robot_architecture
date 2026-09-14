---
id: bash-strict
title: set -euo pipefail
category: bash
section: Основы
order: 2
description: Падать рано.
tags: [bash, основы]
technologies: [Bash]
related: [bash-intro, bash-pipes, bash-traps]
---

# set -euo pipefail

Незамеченный rm по пустой переменной хуже, чем останов скрипта.

## Зачем это в робототехнической системе

Прошивка: если esptool вернул 1 — не reboot в half-flashed.

## Синтаксис и контракт

```bash
set -euo pipefail
trap 'echo fail' ERR
```

## Типичные ошибки

- set -e и пайп без pipefail
- маскировка $? в if без причины

## В Architecture Canvas

failure_modes tooling: ненулевой код = стоп процедуры.

## Связанные разделы
- bash-intro
- bash-pipes
- bash-traps
