---
id: python-variables
title: Переменные и имена
category: python
section: Основы
order: 4
description: Имена, присваивание, ссылки на объекты.
tags: [python, основы]
technologies: [Python]
related: [python-types-numbers, python-lists, python-copy]
---

# Переменные и имена

В Python имя ссылается на объект. `a = b` не копирует список телеметрии — оба имени смотрят на один буфер.

## Зачем это в робототехнической системе

Буфер IMU, переданный в поток публикации MQTT и в PID, должен либо копироваться, либо защищаться блокировкой.

## Синтаксис и контракт

```python
samples = [0.1, 0.2]
view = samples
view.append(0.3)  # samples тоже вырос
```

## Типичные ошибки

- ожидать copy-on-assign как в C++
- однобуквенные имена в публичном API сервиса

## В Architecture Canvas

В заметках компонента фиксируйте, какие структуры разделяются между потоками.

## Связанные разделы
- python-types-numbers
- python-lists
- python-copy
