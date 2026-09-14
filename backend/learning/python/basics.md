---
id: python-basics
title: Основы Python
category: python
order: 1
description: С чего начать работу с языком.
tags: [python, basics]
technologies: [Python]
related: [python-functions]
---

# Основы Python

Python — интерпретируемый язык с выразительным синтаксисом. Для Architecture Canvas его обычно используют как бэкенд, скрипты контроллера и обработку данных с датчиков.

## Переменные и типы

```python
name = "robot"
speed = 1.5
enabled = True
points = [1, 2, 3]
```

## Условия и циклы

```python
if speed > 1:
    print("fast")
for p in points:
    print(p)
```

## Типичные ошибки

- смешивание `is` и `==`;
- изменяемые значения по умолчанию в аргументах функций.

Связанные темы: функции, SQL, архитектура сервисов.
