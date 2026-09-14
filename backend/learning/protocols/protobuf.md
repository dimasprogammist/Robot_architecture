---
id: protocols-protobuf
title: Protobuf/IDL
category: protocols
section: Контракты
order: 12
description: Схема вместо свободного JSON.
tags: [protocols, контракты]
technologies: [Protocols]
related: [protocols-versioning, python-struct, cpp-struct]
---

# Protobuf/IDL

Версионируемые поля. Генерация Python и C++ из одного .proto.

## Зачем это в робототехнической системе

Команды Twist между сервисами. На MCU часто всё же packed struct — не тащите protobuf на M0 без нужды.

## Синтаксис и контракт

```text
message Twist { float vx = 1; float wz = 2; }
```

## Типичные ошибки

- ломать field numbers
- proto на 32k RAM MCU

## В Architecture Canvas

Файл .proto — attached doc компонента. Версия в Protocol.

## Связанные разделы
- protocols-versioning
- python-struct
- cpp-struct
