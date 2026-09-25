---
id: cpp-templates
title: Шаблоны без боли
category: cpp
section: Шаблоны
order: 26
description: Драйвер на тип шины, не копипаста.
tags: [cpp, шаблоны]
technologies: [C++]
related: [cpp-headers, cpp-pid, cpp-hal]
---

# Шаблоны без боли

Шаблон `Crc<Poly>` ок. Шаблон на весь робот — нет. Следите за временем компиляции прошивки.

## Зачем это в робототехнической системе

Один код PID на float (симуляция) и Q15 (MCU) — осторожно, лучше явные типы.

## Синтаксис и контракт

```cpp
template<class Bus>
void ping(Bus& b){ b.send(0x00); }
```

## Типичные ошибки

- шаблон в каждый заголовок без необходимости
- ошибки на 200 строк instantiation в тике

## В Architecture Canvas

Общий алгоритм — текст в Canvas; специализации — технологии вложенных блоков.

## Связанные разделы
- cpp-headers
- cpp-pid
- cpp-hal
