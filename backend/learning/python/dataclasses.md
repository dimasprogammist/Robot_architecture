---
id: python-dataclasses
title: Dataclasses
category: python
section: ООП
order: 33
description: Сообщения, команды, телеметрия.
tags: [python, ооп]
technologies: [Python]
related: [python-typing, python-json, python-pydantic]
---

# Dataclasses

Dataclass — контракт сообщения. Его поля = JSON API = колонки, если пишете в БД.

## Зачем это в робототехнической системе

`Command(vx, wz, timeout_s)` от UI к супервизору. Валидация диапазонов — отдельно.

## Синтаксис и контракт

```python
@dataclass
class Twist:
    vx: float
    wz: float
```

## Типичные ошибки

- мутабельный dataclass как ключ dict
- 100 полей в одном Twist

## В Architecture Canvas

Таблица `commands` в ER должна повторять поля dataclass, иначе экспорт SQL разъедется с кодом.

## Связанные разделы
- python-typing
- python-json
- python-pydantic
