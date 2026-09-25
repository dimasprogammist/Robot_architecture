---
id: python-intro
title: Введение и роль Python
category: python
section: Основы
order: 1
description: Где Python стоит в стеке робота и чего от него ждать.
tags: [python, основы]
technologies: [Python]
related: [python-install, python-venv, python-fastapi]
---

# Введение и роль Python

Python — интерпретируемый язык с богатой экосистемой. Он плохо подходит как единственный realtime-контур на MCU, но отлично закрывает оркестрацию, бэкенд, тесты, обработку логов, ROS2-узлы и инструменты калибровки.

## Зачем это в робототехнической системе

Типичное место: сервис на SBC (Raspberry Pi) или ПК, который говорит с прошивкой по UART/CAN/MQTT и отдаёт API операторскому интерфейсу.

## Синтаксис и контракт

```python
print('Architecture Canvas + Python')
python --version
```

## Типичные ошибки

- пытаться крутить 1 кГц PID на CPython без RTOS/C++
- смешивать скрипт настройки и боевой контур в одном процессе без очередей

## В Architecture Canvas

Добавьте блок «Python-бэкенд». В документации укажите: владеет API, не владеет ШИМ моторов. Связь с MCU — отдельный протокол.

## Связанные разделы
- python-install
- python-venv
- python-fastapi
