---
id: python-argparse
title: CLI и argparse
category: python
section: Инструменты
order: 29
description: Утилиты калибровки и сервис.
tags: [python, инструменты]
technologies: [Python]
related: [python-repl, python-config, python-serial]
---

# CLI и argparse

Один пакет — несколько команд: `robot serve`, `robot calibrate-imu`, `robot flash`.

## Зачем это в робототехнической системе

Стенд: оператор не должен править код, чтобы сменить порт `/dev/ttyACM0`.

## Синтаксис и контракт

```python
p = argparse.ArgumentParser()
p.add_argument('--port', default='/dev/ttyACM0')
```

## Типичные ошибки

- обязательный CLI-флаг без default на изделии
- парсинг argv в середине библиотеки

## В Architecture Canvas

Утилиты — отдельные блоки OTHER или вложенный холст «Tooling».

## Связанные разделы
- python-repl
- python-config
- python-serial
