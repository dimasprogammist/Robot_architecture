---
id: networking-wifi
title: Wi-Fi
category: networking
section: Радио
order: 8
description: Не шина привода.
tags: [networking, радио]
technologies: [Networking]
related: [cpp-safety, networking-intro, protocols-mqtt]
---

# Wi-Fi

Телеметрия/UI. Роуминг, канал, индустриальные AP. 2.4 ГГц грязный.

## Зачем это в робототехнической системе

Операторский планшет. Не FOC.

## Синтаксис и контракт

```text
iw dev wlan0 link
```

## Типичные ошибки

- control ESTOP по Wi-Fi как единственный канал
- скрытая сеть без плана

## В Architecture Canvas

Связь Wi-Fi цвет/протокол. ESTOP — провод.

## Связанные разделы
- cpp-safety
- networking-intro
- protocols-mqtt
