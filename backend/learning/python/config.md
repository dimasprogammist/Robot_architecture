---
id: python-config
title: Конфигурация YAML/TOML
category: python
section: Инструменты
order: 30
description: Схема конфига, overlay для робота №3.
tags: [python, инструменты]
technologies: [Python]
related: [python-files, python-dataclasses]
---

# Конфигурация YAML/TOML

Код не содержит магических PID-коэффициентов. Конфиг версионируется. Overlay: `base.yaml` + `robot-03.yaml`.

## Зачем это в робототехнической системе

Колёсная база, CPR, topic prefix, can bitrate — конфиг. Алгоритм PID — код + числа в конфиге.

## Синтаксис и контракт

```python
cfg = yaml.safe_load(Path('robot.yaml').read_text())
wheel_base_m = cfg['mech']['wheel_base_m']
```

## Типичные ошибки

- yaml.load без safe
- секреты Wi-Fi в git

## В Architecture Canvas

Параметры механики дублируйте в Mechanical Data блока шасси, чтобы BOM и код не разъехались.

## Связанные разделы
- python-files
- python-dataclasses
