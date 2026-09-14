---
id: docker-multi
title: Multi-stage
category: docker
section: Образы
order: 9
description: Сборка C++ отдельно от runtime.
tags: [docker, образы]
technologies: [Docker]
related: [cpp-cmake, docker-file, docker-sec]
---

# Multi-stage

builder с g++, runtime slim. Меньше CVE поверхность.

## Зачем это в робототехнической системе

gateway бинарник копируется в distroless/slim.

## Синтаксис и контракт

```dockerfile
FROM debian AS build
FROM debian-slim
```

## Типичные ошибки

- оставить compiler в prod
- разные glibc builder/runtime без проверки

## В Architecture Canvas

Таргеты CMake совпадают со стадиями.

## Связанные разделы
- cpp-cmake
- docker-file
- docker-sec
