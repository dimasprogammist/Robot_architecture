---
id: electronics-levels
title: Уровни логики
category: electronics
section: Практика
order: 4
description: 3.3 vs 5 vs 24.
tags: [electronics, практика]
technologies: [Electronics]
related: [electronics-pullup]
---

# Уровни логики

Сдвиги уровней. ПЛК 24 В не втыкать в UART MCU.

## Зачем это в робототехнической системе

Датчик 5 В TTL → UART 3.3: делитель/трансивер.

## Синтаксис и контракт

```text
Vih, Vil, Voh
```

## Типичные ошибки

- общий GND забыт при «сдвиге»
- оптопара без расчёта скорости

## В Architecture Canvas

Связь UART заметки про трансивер. Блок level shifter при необходимости.

## Связанные разделы
- electronics-pullup
