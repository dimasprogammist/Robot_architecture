---
id: python-venv
title: venv и зависимости
category: python
section: Модульность
order: 22
description: Изоляция, pin версий, extras.
tags: [python, модульность]
technologies: [Python]
related: [python-install, python-packaging]
---

# venv и зависимости

Один сервис — один venv или один контейнер. Зафиксируйте `requirements.txt` или `uv.lock`.

## Зачем это в робототехнической системе

На роботе образ без компилятора: колёса ставьте заранее. numpy/opencv лучше в Docker.

## Синтаксис и контракт

```python
pip install -r requirements.txt
# fastapi==0.115.12
```

## Типичные ошибки

- pip install в prod без pin
- два сервиса, один site-packages, конфликт protobuf

## В Architecture Canvas

В документации бэкенда: runtime (venv/docker) и файл зависимостей. Это не мелочь.

## Связанные разделы
- python-install
- python-packaging
