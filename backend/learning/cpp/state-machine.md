---
id: cpp-state-machine
title: Автомат прошивки
category: cpp
section: Управление
order: 57
description: Те же состояния, что у супервизора.
tags: [cpp, управление]
technologies: [C++]
related: [cpp-enums-class, python-state-machine, cpp-safety]
---

# Автомат прошивки

Прошивка не должна ехать, если супервизор в FAULT — но ESTOP локальный. Таблица переходов компактная.

## Зачем это в робототехнической системе

События: cmd, timeout, estop, bus-off. Не MQTT внутри MCU.

## Синтаксис и контракт

```cpp
Mode step(Mode m, Ev e);
```

## Типичные ошибки

- состояние только флагами bool без таблицы
- рассинхрон имён с Python

## В Architecture Canvas

Заполните states/transitions MCU 1:1 с кодом. Иначе AI-экспорт соврёт прошивке.

## Связанные разделы
- cpp-enums-class
- python-state-machine
- cpp-safety
