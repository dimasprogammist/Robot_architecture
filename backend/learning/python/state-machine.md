---
id: python-state-machine
title: Конечный автомат
category: python
section: Управление
order: 56
description: Режимы робота явно, переходы таблицей.
tags: [python, управление]
technologies: [Python]
related: [python-enums, python-if, python-testing]
---

# Конечный автомат

Автомат: состояния + события + side-effects. Неразбериха if-ов — источник самопроизвольного старта.

## Зачем это в робототехнической системе

TELEOP + event ESTOP → FAULT. AUTO не доступен без localization_ok.

## Синтаксис и контракт

```python
TRANS = {('IDLE','START'): 'AUTO', ('ANY','ESTOP'): 'FAULT'}
```

## Типичные ошибки

- неявные переходы в обработчиках MQTT
- состояние только в UI, бэкенд не знает

## В Architecture Canvas

В инспекторе заполните states и transitions — это та же семантика, что код автомата.

## Связанные разделы
- python-enums
- python-if
- python-testing
