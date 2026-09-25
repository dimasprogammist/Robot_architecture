---
id: cpp-map
title: map и unordered_map
category: cpp
section: STL
order: 11
description: Словари id→объект, стоимость.
tags: [cpp, stl]
technologies: [C++]
related: [cpp-vector, cpp-embedded]
---

# map и unordered_map

`unordered_map` для id узлов. В ISR не ходите в map. На MCU часто таблица фиксированного размера.

## Зачем это в робототехнической системе

id сервопривода Dynamixel → состояние. На Linux-шлюзе map; на MCU — массив 0..N.

## Синтаксис и контракт

```cpp
std::unordered_map<int, Joint> joints;
```

## Типичные ошибки

- map в realtime без пула
- string-ключи в горячем контуре

## В Architecture Canvas

Каталог суставов — таблица/документ компонента, код только зеркало.

## Связанные разделы
- cpp-vector
- cpp-embedded
