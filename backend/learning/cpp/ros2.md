---
id: cpp-ros2
title: C++ и ROS2 (обзор)
category: cpp
section: Экосистема
order: 59
description: Нода как компонент, топики как связи.
tags: [cpp, экосистема]
technologies: [C++]
related: [cpp-threads, python-mqtt]
---

# C++ и ROS2 (обзор)

ROS2-нода ≠ вся архитектура. Это вариант IPC-компонента. MCU всё равно за протоколом.

## Зачем это в робототехнической системе

Блок Localization (rclcpp) ↔ MCU через micro-ROS или свой UART. Не прячьте MCU «внутри ROS».

## Синтаксис и контракт

```cpp
// rclcpp::Node("loc")
// pub /odom
```

## Типичные ошибки

- весь control в Python-ноде 10 Гц и ожидание чуда
- один mega-node на всё

## В Architecture Canvas

Топики ROS — это Connections с протоколом DDS/ROS. Имена топиков в protocol notes.

## Связанные разделы
- cpp-threads
- python-mqtt
