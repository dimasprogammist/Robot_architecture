---
id: robotics-sensors
title: Сенсоры
category: robotics
section: Ощущение
order: 6
description: Модель ошибки, не «есть лидар».
tags: [robotics, ощущение]
technologies: [Robotics]
related: [python-opencv, robotics-frames, cpp-watchdog]
---

# Сенсоры

Частота, шум, слепые зоны, калибровка. Камера не замена концевику безопасности.

## Зачем это в робототехнической системе

IMU, энкодер, лидар, ток.

## Синтаксис и контракт

```text
rate, range, frame, calib file
```

## Типичные ошибки

- один сенсор на безопасность и SLAM без redundancy
- нет timeout кадра

## В Architecture Canvas

Блоки Sensor/Camera/Lidar. Docs datasheet. data_flow частоты.

## Связанные разделы
- python-opencv
- robotics-frames
- cpp-watchdog
