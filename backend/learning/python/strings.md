---
id: python-strings
title: Строки и Unicode
category: python
section: Типы
order: 6
description: str, f-string, кодировки UART.
tags: [python, типы]
technologies: [Python]
related: [python-bytes, python-json, python-mqtt]
---

# Строки и Unicode

Строки неизменяемы. Для бинарного протокола используйте `bytes`, не `str`. UART 115200 часто несёт кадры, а не текст.

## Зачем это в робототехнической системе

MQTT topic — строка UTF-8. Payload датчика — JSON или protobuf-байты. Не клеить кадры CAN в f-string без hex.

## Синтаксис и контракт

```python
topic = f'robot/{robot_id}/imu'
payload = b'\x01\x02'
```

## Типичные ошибки

- decode без обработки ошибок на шумной линии
- логировать бинарь как текст

## В Architecture Canvas

В протоколе связи укажите encoding и пример payload. Это поле Connection, не «заметка где-то».

## Связанные разделы
- python-bytes
- python-json
- python-mqtt
