---
id: cpp-ub
title: Неопределённое поведение
category: cpp
section: Качество
order: 38
description: Переполнения, висящие указатели, strict aliasing.
tags: [cpp, качество]
technologies: [C++]
related: [cpp-sanitizers, cpp-testing, cpp-span]
---

# Неопределённое поведение

UB на MCU выглядит как «иногда сбрасывается». Sanitizer на host-тестах парсера обязателен.

## Зачем это в робототехнической системе

Парсер кадра тестируйте на PC с ASan/UBSan теми же функциями, что в прошивке (без HAL).

## Синтаксис и контракт

```cpp
int16_t s = int16_t(uint16_t(hi)<<8 | lo); // явно
```

## Типичные ошибки

- сдвиг отрицательных
- выход за массив rx

## В Architecture Canvas

Требование на парсер: «неизвестный кадр отбрасывается, не падает». Тесты — к требованию.

## Связанные разделы
- cpp-sanitizers
- cpp-testing
- cpp-span
