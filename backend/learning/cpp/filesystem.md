---
id: cpp-filesystem
title: filesystem на Linux
category: cpp
section: Ввод-вывод
order: 35
description: Калибровки и карты на диске.
tags: [cpp, ввод-вывод]
technologies: [C++]
related: [cpp-logging, linux-systemd, python-files]
---

# filesystem на Linux

На IPC сохраняйте атомарно. На MCU файлов нет — калибровка в Flash/EEPROM.

## Зачем это в робототехнической системе

Калибровка IMU yaml рядом с сервисом. Версия файла = version вложенного блока Calibration.

## Синтаксис и контракт

```cpp
std::filesystem::path p{"/var/lib/robot/imu.yaml"};
```

## Типичные ошибки

- запись по относительному пути из systemd без WorkingDirectory
- нет fsync на критичном last_pose

## В Architecture Canvas

Attached files в Canvas — инженерные. Runtime path — в документации Linux-сервиса.

## Связанные разделы
- cpp-logging
- linux-systemd
- python-files
