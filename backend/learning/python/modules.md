---
id: python-modules
title: Модули и пакеты
category: python
section: Модульность
order: 21
description: import, пакеты, границы компонентов.
tags: [python, модульность]
technologies: [Python]
related: [python-venv, python-packaging, python-architecture]
---

# Модули и пакеты

Пакет = граница модуля архитектуры. `robot.drivers.can` не должен импортировать `robot.ui`.

## Зачем это в робототехнической системе

Соответствие холсту: блок «CAN-драйвер» ≈ пакет drivers, блок «Навигация» ≈ пакет nav.

## Синтаксис и контракт

```python
from robot.drivers.can import CanBus
bus = CanBus(iface='can0')
```

## Типичные ошибки

- циклические импорты как симптом комка
- from x import * в сервисе

## В Architecture Canvas

Имена пакетов держите рядом с именами блоков. Вложенный холст = подпакет.

## Связанные разделы
- python-venv
- python-packaging
- python-architecture
