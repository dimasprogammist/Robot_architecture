---
id: electronics-datasheet
title: Как читать datasheet
category: electronics
section: Практика
order: 3
description: Абсолютные максимумы ≠ рабочие.
tags: [electronics, практика]
technologies: [Electronics]
related: [electronics-levels, cpp-spi, app-docs]
---

# Как читать datasheet

Режимы SPI, Vih/Vil, потребление, thermal. Ссылка в Documentation компонента.

## Зачем это в робототехнической системе

IMU, драйвер, MCU. Не копируйте интернет в приложение — храните URL и свои заметки.

## Синтаксис и контракт

```text
Vih min, Vil max, abs max Vin
```

## Типичные ошибки

- питать 5 В пин 3.3 В MCU
- SPI 20 МГц при кабеле 30 см

## В Architecture Canvas

Документы: Official + Datasheet URL + My notes.

## Связанные разделы
- electronics-levels
- cpp-spi
- app-docs
