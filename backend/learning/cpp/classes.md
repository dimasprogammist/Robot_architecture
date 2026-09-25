---
id: cpp-classes
title: Классы и агрегация
category: cpp
section: ООП
order: 17
description: Драйвер = класс с явным init.
tags: [cpp, ооп]
technologies: [C++]
related: [cpp-ctor, cpp-raii, cpp-hal]
---

# Классы и агрегация

Конструктор не должен молча трогать GPIO до `init()`: иначе статический порядок инициализации убивает тактовую.

## Зачем это в робототехнической системе

`PwmTimer tim8; tim8.init(cfg);` после тактирования RCC. На холсте: MCU internals — RCC, TIM, DRV.

## Синтаксис и контракт

```cpp
class PwmTimer {
public:
  void init(const Cfg&);
  void set(uint16_t);
};
```

## Типичные ошибки

- работа в конструкторе до тактирования
- синглтон на каждый регистр

## В Architecture Canvas

Вложенный холст MCU: RCC, TIM, GPIO, App. Классы те же.

## Связанные разделы
- cpp-ctor
- cpp-raii
- cpp-hal
