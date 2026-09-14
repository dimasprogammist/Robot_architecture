---
id: python-files
title: Файлы и pathlib
category: python
section: Ввод-вывод
order: 25
description: Текст, бинарь, атомарная запись конфигов.
tags: [python, ввод-вывод]
technologies: [Python]
related: [python-json, python-config, python-logging]
---

# Файлы и pathlib

Конфиг и карты лучше писать атомарно (write temp + replace), иначе отключение питания оставит обрезанный YAML.

## Зачем это в робототехнической системе

Карта occupancy, калибровка камеры, last_pose — файлы на SBC. STL механики в Canvas — не этот слой, но версия калибровки — да.

## Синтаксис и контракт

```python
from pathlib import Path
Path('data/last_pose.json').write_text(payload, encoding='utf-8')
```

## Типичные ошибки

- относительные пути от неизвестного cwd
- запись JSON вручную конкатенацией

## В Architecture Canvas

Attached files в Canvas — инженерные артефакты. Runtime-файлы опишите в документации сервиса.

## Связанные разделы
- python-json
- python-config
- python-logging
