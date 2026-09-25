---
id: cpp-headers
title: Заголовки и ODR
category: cpp
section: Основы
order: 4
description: #pragma once, что можно в .h.
tags: [cpp, основы]
technologies: [C++]
related: [cpp-build-model, cpp-namespaces, cpp-templates]
---

# Заголовки и ODR

Заголовок — контракт. Реализации — в .cpp. Шаблоны и constexpr — исключение, но не свалка.

## Зачем это в робототехнической системе

can_frame.hpp видят gateway и app. Железо-регистры bxcan.hpp не тащите в Python-биндинги.

## Синтаксис и контракт

```cpp
#pragma once
#include <cstdint>
void can_send(std::uint32_t id, const std::uint8_t* d, int n);
```

## Типичные ошибки

- using namespace std в заголовке
- статические переменные в header без inline

## В Architecture Canvas

Публичный заголовок драйвера = поле API компонента MCU.

## Связанные разделы
- cpp-build-model
- cpp-namespaces
- cpp-templates
