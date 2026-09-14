---
id: python-repl
title: REPL, скрипты, -m
category: python
section: Основы
order: 3
description: Интерактивная оболочка против пакета службы.
tags: [python, основы]
technologies: [Python]
related: [python-install, python-modules, python-logging]
---

# REPL, скрипты, -m

REPL удобен, чтобы пощупать датчик. Служба робота — это пакет с `__main__`, а не набор файлов, которые запускают с абсолютными путями вручную.

## Зачем это в робототехнической системе

Инженер на стенде: `python -i tools/probe_imu.py`. На изделии: `python -m robot.service`.

## Синтаксис и контракт

```python
if __name__ == '__main__':
    raise SystemExit(main())
```

## Типичные ошибки

- бизнес-логика на верхнем уровне модуля (импорт начинает крутить мотор)
- отсутствие `if __name__`

## В Architecture Canvas

Алгоритм компонента «стендовые утилиты» отделите от алгоритма «runtime». Это разные вложенные блоки.

## Связанные разделы
- python-install
- python-modules
- python-logging
