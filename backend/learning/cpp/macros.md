---
id: cpp-macros
title: Препроцессор
category: cpp
section: Инструменты
order: 27
description: Include guards, условная компиляция платформ.
tags: [cpp, инструменты]
technologies: [C++]
related: [cpp-const, cpp-hal]
---

# Препроцессор

`#ifdef BOARD_REV2` для разводки. Не `#define` функции. Конфиг плат — отдельный header, не россыпь.

## Зачем это в робототехнической системе

REV2 поменял пин STEP. Архитектура та же, hardware revision — поле компонента + ifdef.

## Синтаксис и контракт

```cpp
#if BOARD_REV>=2
#define STEP_PIN 14
#else
#define STEP_PIN 7
#endif
```

## Типичные ошибки

- скрытый ifdef, который меняет семантику протокола
- макрос min/max ломающий std::min

## В Architecture Canvas

Ревизия платы — в Hardware Data. Не держите только в макросе без холста.

## Связанные разделы
- cpp-const
- cpp-hal
