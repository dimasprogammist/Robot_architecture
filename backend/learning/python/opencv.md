---
id: python-opencv
title: OpenCV кратко
category: python
section: Наука и железо
order: 45
description: Камера, калибровка, не весь CV.
tags: [python, наука и железо]
technologies: [Python]
related: [python-numpy, python-threading, robotics-sensors]
---

# OpenCV кратко

OpenCV читает кадр, undistort, детектор маркера. Тяжёлую сеть вынесите отдельно (часто другой процесс/NPU).

## Зачем это в робототехнической системе

Камера CSI на Pi: отдельный процесс, очередь последних кадров, чтобы не блокировать MQTT.

## Синтаксис и контракт

```python
ok, frame = cap.read()
gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
```

## Типичные ошибки

- обработка в GUI-потоке
- игнор калибровки camera_matrix

## В Architecture Canvas

Блок Camera + вложенный алгоритм «undistort → detect → pose». Файл калибровки — attached note/file.

## Связанные разделы
- python-numpy
- python-threading
- robotics-sensors
