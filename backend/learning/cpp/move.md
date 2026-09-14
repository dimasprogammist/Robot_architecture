---
id: cpp-move
title: Move-семантика
category: cpp
section: Память+
order: 21
description: Передача буфера без копии.
tags: [cpp, память+]
technologies: [C++]
related: [cpp-vector, cpp-ownership, cpp-queues]
---

# Move-семантика

`std::move` кадра в очередь. После move исходный vector пуст — не читайте его.

## Зачем это в робототехнической системе

Камера заполняет buffer, move в lock-free очередь к детектору.

## Синтаксис и контракт

```cpp
q.push(std::move(frame));
```

## Типичные ошибки

- move и повторное использование без reset
- return std::move(local) мешая NRVO

## В Architecture Canvas

data_flow «кадр» — семантика move на границе компонентов.

## Связанные разделы
- cpp-vector
- cpp-ownership
- cpp-queues
