---
id: electronics-ground
title: Заземление и EMC
category: electronics
section: Сила
order: 11
description: Звезды, экраны, петли.
tags: [electronics, сила]
technologies: [Electronics]
related: [networking-l2]
---

# Заземление и EMC

Силовая земля отдельно от аналоговой, соединить в одной точке. Экраны камер.

## Зачем это в робототехнической системе

Сбросы MCU при старте мотора — классика петли.

## Синтаксис и контракт

```text
PGND vs AGND
```

## Типичные ошибки

- земля через Ethernet shield и силовую одновременно без плана
- разорванная земля трансивера

## В Architecture Canvas

Notes стойки/корпуса. Housing mechanical + electronics.

## Связанные разделы
- networking-l2
