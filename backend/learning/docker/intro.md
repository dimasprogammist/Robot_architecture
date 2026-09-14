---
id: docker-intro
title: Контейнер ≠ виртуальный MCU
category: docker
section: Основы
order: 1
description: Изоляция Linux-сервисов.
tags: [docker, основы]
technologies: [Docker]
related: [docker-file, docker-devices, linux-intro]
---

# Контейнер ≠ виртуальный MCU

Docker пакует шлюз, брокер, UI. Прошивку STM32 он не заменяет. RT-потоки внутри контейнера требуют --privileged/device аккуратно.

## Зачем это в робототехнической системе

compose: mosquitto, robot-svc, web. MCU снаружи, проброшен /dev/robot-mcu.

## Синтаксис и контракт

```dockerfile
FROM python:3.11-slim
```

## Типичные ошибки

- контейнеризовать всё включая hard realtime без измерения
- привилегии всем подряд

## В Architecture Canvas

Блок Docker как модуль ПО или notes runtime у Backend.

## Связанные разделы
- docker-file
- docker-devices
- linux-intro
