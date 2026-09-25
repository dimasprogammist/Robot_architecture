---
id: software-architecture-integration
title: Интеграция с заводом/IT
category: software-architecture
section: Практика
order: 11
description: OPC UA, MES, люди.
tags: [software-architecture, практика]
technologies: [Software Architecture]
related: [protocols-opcua, linux-firewall]
---

# Интеграция с заводом/IT

Шлюз наружу, не прошивка. ACL. Имена из Canvas совпадают с тегами SCADA если можете.

## Зачем это в робототехнической системе

Цех хочет статус робота.

## Синтаксис и контракт

```text
OT vs IT DMZ
```

## Типичные ошибки

- дать MES писать PWM
- разные имена статусов

## В Architecture Canvas

Блок External Service. Протокол OPC UA/HTTP.

## Связанные разделы
- protocols-opcua
- linux-firewall
