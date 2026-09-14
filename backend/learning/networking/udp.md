---
id: networking-udp
title: UDP
category: networking
section: L4
order: 5
description: Потоки сенсоров, потеря — норма.
tags: [networking, l4]
technologies: [Networking]
related: [networking-tcp, robotics-slam, python-struct]
---

# UDP

Лидар/видео часто UDP. Контроль потерь на прикладном уровне (seq).

## Зачем это в робототехнической системе

Потеря кадра — хуже, чем джиттер TCP 200 мс для телеметрии UI? Зависит. Для SLAM иногда drop лучше stall.

## Синтаксис и контракт

```text
socat - UDP:192.168.10.20:2368
```

## Типичные ошибки

- считать UDP «ненадёжным значит бесполезным»
- нет seq и вы собираете облако из разных оборотов

## В Architecture Canvas

data_flow Lidar: UDP, частота, что при потере.

## Связанные разделы
- networking-tcp
- robotics-slam
- python-struct
