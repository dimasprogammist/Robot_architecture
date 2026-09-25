---
id: cpp-ctor
title: Конструкторы, деструкторы, rule of 5
category: cpp
section: ООП
order: 18
description: Владение ресурсом таймера/сокета.
tags: [cpp, ооп]
technologies: [C++]
related: [cpp-raii, cpp-ownership, cpp-move]
---

# Конструкторы, деструкторы, rule of 5

Если определили один из пяти — определите все или delete. Драйвер с raw-указателем DMA без delete копий.

## Зачем это в робототехнической системе

Класс `DmaBuf` копировать нельзя: unique ownership буфера.

## Синтаксис и контракт

```cpp
DmaBuf(const DmaBuf&) = delete;
DmaBuf& operator=(const DmaBuf&) = delete;
```

## Типичные ошибки

- копирование объекта, держащего DMA
- пустой деструктор и утечка descriptor

## В Architecture Canvas

Ресурс компонента = объект с lifetime = lifetime блока (пока питание есть).

## Связанные разделы
- cpp-raii
- cpp-ownership
- cpp-move
