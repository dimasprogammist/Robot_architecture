---
id: cpp-raii
title: RAII
category: cpp
section: Память+
order: 19
description: Ресурс привязан к объекту.
tags: [cpp, память+]
technologies: [C++]
related: [cpp-ownership, cpp-mutex, cpp-spi]
---

# RAII

Файл, сокет, lock, mmap — закрываются деструктором. На MCU RAII — это «пин в безопасное состояние».

## Зачем это в робототехнической системе

`LockGuard` вокруг SPI-транзакции. При ошибке CRC lock всё равно отпустится.

## Синтаксис и контракт

```cpp
std::lock_guard<std::mutex> g(spi_mu_);
spi_.xfer(buf, n);
```

## Типичные ошибки

- ручной lock/unlock с early return
- RAII, который в деструкторе делает I2C

## В Architecture Canvas

Интерфейсы компонента: кто владеет шиной. На холсте одна шина — один владелец, остальные клиенты.

## Связанные разделы
- cpp-ownership
- cpp-mutex
- cpp-spi
