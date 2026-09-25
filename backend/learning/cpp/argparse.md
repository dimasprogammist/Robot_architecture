---
id: cpp-argparse
title: CLI Linux-узла
category: cpp
section: Инструменты+
order: 37
description: Порт, iface, конфиг.
tags: [cpp, инструменты+]
technologies: [C++]
related: [cpp-cmake, linux-systemd, python-argparse]
---

# CLI Linux-узла

Как в Python: изделие не пересобирают ради can0 vs can1. Флаги/конфиг.

## Зачем это в робототехнической системе

`gateway --can can0 --mqtt mqtt://...`

## Синтаксис и контракт

```cpp
if (arg == "--can") iface = argv[++i];
```

## Типичные ошибки

- обязательный дебаг-флаг, который забыли в systemd unit
- парсинг без проверки argc

## В Architecture Canvas

Команда запуска — в README компонента gateway.

## Связанные разделы
- cpp-cmake
- linux-systemd
- python-argparse
