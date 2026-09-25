---
id: cpp-ownership
title: unique_ptr и shared_ptr
category: cpp
section: Память+
order: 20
description: Владение на Linux; на MCU чаще static.
tags: [cpp, память+]
technologies: [C++]
related: [cpp-move, cpp-raii, cpp-ros2]
---

# unique_ptr и shared_ptr

`unique_ptr` для драйвера камеры на IPC. `shared_ptr` — редкость (иногда ROS2). Циклические shared — утечка.

## Зачем это в робототехнической системе

Узел perception владеет камерой uniquely. Другие читают сообщения, не shared Camera.

## Синтаксис и контракт

```cpp
auto cam = std::make_unique<V4L2>();
```

## Типичные ошибки

- shared_ptr как привычка «чтобы не думать»
- unique_ptr в ISR

## В Architecture Canvas

Связь на холсте не равна shared_ptr. Это поток данных, не совместное владение железом.

## Связанные разделы
- cpp-move
- cpp-raii
- cpp-ros2
