---
id: python-logging
title: logging
category: python
section: Наблюдаемость
order: 28
description: Уровни, логгер на модуль, без print.
tags: [python, наблюдаемость]
technologies: [Python]
related: [python-exceptions, linux-journalctl, python-asyncio]
---

# logging

`print` пропадает в systemd. `logging` даёт уровень, время, компонент.

## Зачем это в робототехнической системе

На роботе: INFO — смена режима, WARNING — повтор кадра, ERROR — FAULT. DEBUG — сырые регистры, только на стенде.

## Синтаксис и контракт

```python
log = logging.getLogger(__name__)
log.info('mode=%s', mode)
```

## Типичные ошибки

- логировать каждые 5 мс IMU в INFO
- конкатенация f-string до проверки уровня в горячем цикле — терпимо, но не гигантские дампы

## В Architecture Canvas

Наблюдаемость — часть архитектуры. Документ «логи» у сервиса: куда journald/файл/MQTT.

## Связанные разделы
- python-exceptions
- linux-journalctl
- python-asyncio
