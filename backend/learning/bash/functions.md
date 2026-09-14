---
id: bash-functions
title: Функции bash
category: bash
section: Структура
order: 9
description: Повторяемые шаги flash.
tags: [bash, структура]
technologies: [Bash]
related: [bash-traps, bash-strict, python-functions]
---

# Функции bash

need_cmd, die, wait_dev — короткие функции. Не копипаста 4 раз.

## Зачем это в робототехнической системе

Одинаковый wait_dev для IMU и MCU.

## Синтаксис и контракт

```bash
die() { echo "$*" >&2; exit 1; }
```

## Типичные ошибки

- функции, меняющие глобальные без local
- имя cd внутри функции без pushd

## В Architecture Canvas

Скрипт как вложенный алгоритм блока Tooling.

## Связанные разделы
- bash-traps
- bash-strict
- python-functions
