---
id: bash-args
title: Аргументы скрипта
category: bash
section: Основы
order: 4
description: $1, getopts.
tags: [bash, основы]
technologies: [Bash]
related: [python-argparse, bash-help, bash-vars]
---

# Аргументы скрипта

Скрипт прошивки принимает --port, --fw, --dry-run.

## Зачем это в робототехнической системе

Оператор в поле не редактирует скрипт.

## Синтаксис и контракт

```bash
while getopts p:f:n flag; do ...; done
```

## Типичные ошибки

- позиционные без help
- нет --dry-run на опасных действиях

## В Architecture Canvas

CLI tooling совпадает с python argparse утилитами.

## Связанные разделы
- python-argparse
- bash-help
- bash-vars
