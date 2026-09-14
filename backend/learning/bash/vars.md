---
id: bash-vars
title: Переменные и кавычки
category: bash
section: Основы
order: 3
description: "$dev" vs $dev.
tags: [bash, основы]
technologies: [Bash]
related: [bash-strict, bash-args, linux-permissions]
---

# Переменные и кавычки

Путь с пробелом, пустой UART — классика уничтожения.

## Зачем это в робототехнической системе

DEVICE=/dev/robot-mcu всегда в кавычках.

## Синтаксис и контракт

```bash
flash "$DEVICE"
```

## Типичные ошибки

- rm -rf $DIR/ где DIR пуст
- неэкранированный ssh

## В Architecture Canvas

Параметры скрипта = конфиг, не хардкод.

## Связанные разделы
- bash-strict
- bash-args
- linux-permissions
