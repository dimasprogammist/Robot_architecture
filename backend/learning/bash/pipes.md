---
id: bash-pipes
title: Пайпы и коды возврата
category: bash
section: Поток
order: 5
description: Левая команда молча умерла.
tags: [bash, поток]
technologies: [Bash]
related: [bash-strict, linux-journalctl, bash-redirects]
---

# Пайпы и коды возврата

pipefail обязателен. healthcheck: journalctl | grep FAULT — поймите ложные срабатывания.

## Зачем это в робототехнической системе

Цепочка: dump_log | gzip > /var/log/robot/x.gz

## Синтаксис и контракт

```bash
cmd1 | cmd2
```

## Типичные ошибки

- проверка только $? последней
- grep без || true там, где 1 = «не найдено» норма

## В Architecture Canvas

Алгоритм процедуры бэкапа логов.

## Связанные разделы
- bash-strict
- linux-journalctl
- bash-redirects
