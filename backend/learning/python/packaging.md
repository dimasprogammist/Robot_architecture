---
id: python-packaging
title: Сборка пакета и точка входа
category: python
section: Поставка
order: 57
description: pyproject, console_scripts, версия.
tags: [python, поставка]
technologies: [Python]
related: [python-venv, python-modules]
---

# Сборка пакета и точка входа

Сервис ставится как пакет: `robot-svc`. Версия пакета = версия компонента на холсте.

## Зачем это в робототехнической системе

Образ Docker `pip install .` и entrypoint `robot-svc`. Совпадение с полем version блока.

## Синтаксис и контракт

```python
# pyproject.toml
[project.scripts]
robot-svc = 'robot.service:main'
```

## Типичные ошибки

- версия только в UI Canvas, в коде 0.0.0
- editable install как способ деплоя на изделие

## В Architecture Canvas

Поле version компонента синхронизируйте с git tag. Экспорт для AI тогда честный.

## Связанные разделы
- python-venv
- python-modules
