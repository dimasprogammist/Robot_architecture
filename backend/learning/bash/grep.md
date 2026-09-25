---
id: bash-grep
title: grep, rg, journal
category: bash
section: Текст
order: 10
description: Искать FAULT аккуратно.
tags: [bash, текст]
technologies: [Bash]
related: [linux-journalctl, python-logging]
---

# grep, rg, journal

Фиксированные паттерны. Цвет ломает пайпы — --no-color.

## Зачем это в робототехнической системе

Алерт: три FAULT за минуту.

## Синтаксис и контракт

```bash
journalctl -u robot-svc | grep -E 'FAULT|ESTOP'
```

## Типичные ошибки

- grep по всему диску на роботе
- ложный матч в hex-дампе

## В Architecture Canvas

Словарь событий согласован с логами Python/C++.

## Связанные разделы
- linux-journalctl
- python-logging
