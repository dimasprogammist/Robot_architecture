---
id: linux-intro
title: Linux на роботе
category: linux
section: Основы
order: 1
description: Зачем Linux на SBC и IPC.
tags: [linux, основы]
technologies: [Linux]
related: [linux-fs, linux-systemd, linux-realtime]
---

# Linux на роботе

Linux — ОС SBC и промышленных ПК: сеть, файлы, процессы, контейнеры. Это не RTOS. Жёсткий 1 кГц лучше на MCU.

## Зачем это в робототехнической системе

Raspberry Pi / IPC крутит шлюз, SLAM, UI. STM32 крутит PWM. Граница — UART/CAN.

## Синтаксис и контракт

```bash
uname -a
cat /etc/os-release
```

## Типичные ошибки

- ждать от Pi PREEMT_RT без настройки и измерения
- root для всего сервиса

## В Architecture Canvas

Блок SBC: ОС в Hardware Data. Алгоритмы Linux-сервисов — отдельные software-блоки.

## Связанные разделы
- linux-fs
- linux-systemd
- linux-realtime
