---
id: bash-traps
title: trap и безопасное прерывание
category: bash
section: Надёжность
order: 13
description: Снять адаптер, размотировать lock.
tags: [bash, надёжность]
technologies: [Bash]
related: [bash-strict, cpp-gdb, linux-processes]
---

# trap и безопасное прерывание

Ctrl+C во время flash: не оставить boot0 в странном состоянии, если можете.

## Зачем это в робототехнической системе

lock-файл /run/robot-flash.lock

## Синтаксис и контракт

```bash
trap 'rm -f $LOCK' EXIT
```

## Типичные ошибки

- trap, который игнорирует INT на опасной операции без сообщения
- нет lock — две прошивки сразу

## В Architecture Canvas

Процедура flash — алгоритм с отменой.

## Связанные разделы
- bash-strict
- cpp-gdb
- linux-processes
