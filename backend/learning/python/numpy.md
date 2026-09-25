---
id: python-numpy
title: NumPy для сенсоров
category: python
section: Наука и железо
order: 44
description: Векторы, маски, не Python-циклы по облаку.
tags: [python, наука и железо]
technologies: [Python]
related: [python-opencv, python-generators, robotics-slam]
---

# NumPy для сенсоров

Облако точек и IMU-батчи — numpy. Control на 100 Гц с 10 числами — обычный float, без numpy-оверкида.

## Зачем это в робототехнической системе

`ranges[ranges < 0.05] = np.nan` перед SLAM. Не пишите for i in range(len(points)) на 30к точках в CPython.

## Синтаксис и контракт

```python
import numpy as np
r = np.asarray(scan, dtype=np.float32)
r[r < 0.05] = np.nan
```

## Типичные ошибки

- смешать dtype float64/float32 без нужды на Pi
- немые оси без комментария frame

## В Architecture Canvas

Perception — отдельный блок. Связь Lidar → Perception: UDP/USB + формат облака.

## Связанные разделы
- python-opencv
- python-generators
- robotics-slam
