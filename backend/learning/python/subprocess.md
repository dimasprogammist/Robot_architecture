---
id: python-subprocess
title: subprocess и прошивки
category: python
section: Система
order: 53
description: Вызов avrdude, esptool, systemctl.
tags: [python, система]
technologies: [Python]
related: [python-argparse, linux-systemd, python-exceptions]
---

# subprocess и прошивки

Сервис может триггерить прошивку, но не должен делать это синхронно из HTTP без job.

## Зачем это в робототехнической системе

`esptool.py write_flash ...` с таймаутом. Логи — в файл артефакта версии.

## Синтаксис и контракт

```python
subprocess.run(['systemctl', 'restart', 'robot'], check=True, timeout=15)
```

## Типичные ошибки

- shell=True с конкатенацией пути
- нет timeout

## В Architecture Canvas

Блок Tooling / Firmware flash. Связь с MCU — не runtime UART, а процедура обслуживания.

## Связанные разделы
- python-argparse
- linux-systemd
- python-exceptions
