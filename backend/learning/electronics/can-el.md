---
id: electronics-can-el
title: CAN физика
category: electronics
section: Сигналы
order: 8
description: 120 Ом, stub, экран.
tags: [electronics, сигналы]
technologies: [Electronics]
related: [cpp-can, protocols-can, electronics-ground]
---

# CAN физика

Два терминатора на концах. Не на каждом узле. Витая пара.

## Зачем это в робототехнической системе

Приводы в шине.

## Синтаксис и контракт

```text
CANH/CANL, 120Ω
```

## Типичные ошибки

- терминатор на каждом серво
- питание трансивера откуда попало

## В Architecture Canvas

Протокол CAN + notes шины.

## Связанные разделы
- cpp-can
- protocols-can
- electronics-ground
