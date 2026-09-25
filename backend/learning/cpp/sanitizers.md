---
id: cpp-sanitizers
title: ASan, UBSan, TSan
category: cpp
section: Качество
order: 39
description: Host-сборки парсеров и очередей.
tags: [cpp, качество]
technologies: [C++]
related: [cpp-ub, cpp-testing, cpp-cmake]
---

# ASan, UBSan, TSan

Не прошьёте ASan в M0. Соберите `parser_tests` на x86_64 с санитайзерами.

## Зачем это в робототехнической системе

Кольцевой буфер и CRC — идеальные цели UBSan.

## Синтаксис и контракт

```cpp
cmake -DSANITIZE=ON ...
# -fsanitize=address,undefined
```

## Типичные ошибки

- отключить санитайзер потому что «тест красный» без понимания
- TSan на коде с отключёнными атомиками

## В Architecture Canvas

CI — часть архитектуры поставки (будущий блок CI). Пока — документ MCU/tests.

## Связанные разделы
- cpp-ub
- cpp-testing
- cpp-cmake
