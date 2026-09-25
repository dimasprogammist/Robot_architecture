---
id: python-install
title: Установка и запуск
category: python
section: Основы
order: 2
description: CPython, версии, запуск скрипта и модуля.
tags: [python, основы]
technologies: [Python]
related: [python-intro, python-venv, python-modules]
---

# Установка и запуск

Используйте CPython 3.11+. Для робота фиксируйте minor-версию в Docker/CI, иначе «у меня работает» ломает прошивочные утилиты.

## Зачем это в робототехнической системе

На Raspberry Pi OS ставьте системный python3 и отдельно venv для сервиса. Не ставьте пакеты в system site-packages без нужды.

## Синтаксис и контракт

```python
python3 -m venv .venv
source .venv/bin/activate
python -m robot_app
```

## Типичные ошибки

- python vs python3 на Linux
- запуск файлов из чужого cwd, из-за чего не находятся конфиги

## В Architecture Canvas

В компоненте бэкенда поле «версия» = 3.11. Документируйте команду запуска в README блока.

## Связанные разделы
- python-intro
- python-venv
- python-modules
