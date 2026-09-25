---
id: cpp-namespaces
title: Пространства имён
category: cpp
section: Основы
order: 5
description: Границы как пакеты Python.
tags: [cpp, основы]
technologies: [C++]
related: [cpp-headers, cpp-classes]
---

# Пространства имён

`drv::can`, `app::supervisor`. Не `using namespace` в заголовках.

## Зачем это в робототехнической системе

Совпадение с вложенным холстом прошивки: Drivers / App / RTOS glue.

## Синтаксис и контракт

```cpp
namespace drv::can {
void send(std::uint32_t id);
}
```

## Типичные ошибки

- анонимный namespace в header
- гигантский namespace robot на всё

## В Architecture Canvas

Имена namespace = имена вложенных блоков MCU.

## Связанные разделы
- cpp-headers
- cpp-classes
