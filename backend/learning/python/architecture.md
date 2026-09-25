---
id: python-architecture
title: Как резать Python-систему
category: python
section: Поставка
order: 58
description: Границы пакетов = блоки холста.
tags: [python, поставка]
technologies: [Python]
related: [python-modules, python-composition]
---

# Как резать Python-систему

Правило: зависимость в коде есть только если есть связь на архитектуре. Новый импорт — повод добавить Connection.

## Зачем это в робототехнической системе

drivers / domain / api / tools. Domain не импортирует FastAPI. API не считает PID.

## Синтаксис и контракт

```python
# robot/api зависит от robot.supervisor
# robot.supervisor зависит от robot.drivers
# drivers не зависят от api
```

## Типичные ошибки

- общий util на 80 хелперов, который связывает всё со всем
- копипаста парсера протокола в трёх сервисах

## В Architecture Canvas

Вложенный холст Python-бэкенда: API, Supervisor, Drivers. Это и есть карта пакетов.

## Связанные разделы
- python-modules
- python-composition
