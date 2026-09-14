---
id: protocols-versioning
title: Версии протоколов
category: protocols
section: Основы
order: 2
description: Несовместимость как событие.
tags: [protocols, основы]
technologies: [Protocols]
related: [cpp-struct, git-commit, protocols-intro]
---

# Версии протоколов

Байт version в кадре или major в topic. Шлюз отвергает неизвестное.

## Зачем это в робототехнической системе

Прошили MCU v2, шлюз v1 — лучше FAULT, чем тихий разбор не туда.

## Синтаксис и контракт

```text
struct { uint8_t ver; ...}
```

## Типичные ошибки

- молча игнорировать лишние байты без версии
- один топик на v1 и v2 JSON разной формы

## В Architecture Canvas

Поле version у Protocol. Связь указывает протокол.

## Связанные разделы
- cpp-struct
- git-commit
- protocols-intro
