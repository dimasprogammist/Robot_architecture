---
id: python-context
title: Контекстные менеджеры
category: python
section: Надёжность
order: 24
description: with, ресурс, GPIO, сокеты, файлы.
tags: [python, надёжность]
technologies: [Python]
related: [python-serial, python-files, python-classes]
---

# Контекстные менеджеры

`with` гарантирует закрытие. Для GPIO/serial это единственный приличный путь не оставить линию в UNKNOWN.

## Зачем это в робототехнической системе

Открытие serial: при краше калибровки порт должен закрыться, иначе прошивка не переоткроется.

## Синтаксис и контракт

```python
with Serial('/dev/ttyACM0', 115200) as port:
    port.write(b'PING\n')
```

## Типичные ошибки

- открыть порт в __init__ и забыть close
- вложенные with без таймаута

## В Architecture Canvas

Ресурсы перечислите во входах компонента: tty, can0, camera /dev.

## Связанные разделы
- python-serial
- python-files
- python-classes
