---
id: python-json
title: JSON
category: python
section: Ввод-вывод
order: 26
description: Сериализация телеметрии и API.
tags: [python, ввод-вывод]
technologies: [Python]
related: [python-dicts, python-fastapi, python-mqtt]
---

# JSON

JSON удобен между бэкендом и UI. Для MCU на 115200 он тяжёл — там бинарный кадр.

## Зачем это в робототехнической системе

Пример: `{ "wheel_L": 1.2, "stamp": 1710000000.1 }`. Числа — SI. Время — monotonic или epoch, но документируйте.

## Синтаксис и контракт

```python
json.dumps({'temp_c': 36.6}, separators=(',', ':'))
```

## Типичные ошибки

- NaN в JSON (не стандарт)
- datetime без timezone

## В Architecture Canvas

data_example связи HTTP/MQTT заполните реальным JSON. Это золото для AI-экспорта.

## Связанные разделы
- python-dicts
- python-fastapi
- python-mqtt
