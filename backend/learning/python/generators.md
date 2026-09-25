---
id: python-generators
title: Генераторы и yield
category: python
section: Итерации
order: 39
description: Поток кадров без гигантского списка.
tags: [python, итерации]
technologies: [Python]
related: [python-for, python-asyncio, python-opencv]
---

# Генераторы и yield

Генератор отдаёт кадры камеры/лидара по мере появления. Не копить минуту облаков в RAM.

## Зачем это в робототехнической системе

SBC 4 ГБ: необрезанный 10 Гц / 64k точек уедет в swap и убьёт control loop.

## Синтаксис и контракт

```python
def frames(cam):
    while True:
        ok, img = cam.read()
        if not ok:
            break
        yield img
```

## Типичные ошибки

- генератор с скрытым состоянием железа без close
- list(generator) «чтобы было удобно» на бесконечном потоке

## В Architecture Canvas

Поток данных на холсте — Connection kind data_flow: Camera → Perception.

## Связанные разделы
- python-for
- python-asyncio
- python-opencv
