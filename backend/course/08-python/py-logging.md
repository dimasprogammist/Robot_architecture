---
id: py-logging
title: Логирование
module_id: python
module_title: Python
module_order: 8
order: 35
---

# Логирование

## Цель

Заменить отладочные print на logging с уровнями.

Смотреть на логи как на поток событий для диагностики.

## Что уже пройдено

Тесты фиксируют поведение; работающей программе нужно рассказывать о ходе исполнения.

Логи — структурированный след.

## Объяснение с нуля

print смешивает отладку с полезным выводом. logging: уровни DEBUG…CRITICAL, логгеры по именам, handlers, formatters.

Старт: basicConfig. В модулях: getLogger(__name__). logger.exception в except пишет traceback. Не логируйте секреты. Логирование — побочный эффект, не канал return.

## Термины

- **Логгер / уровень**.

- **Handler / Formatter**.

- **basicConfig**.

- **`__name__`**.

- **traceback в логе**.

- **LogRecord**.

- **Иерархия имён логгеров**.

## Внутреннее устройство

logger.info создаёт LogRecord и отдаёт handlers, если уровень пропускает.

Обычные объекты и вызовы; стоимость на горячем пути заметна — поэтому уровни.

## Пример

```python

import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

log = logging.getLogger("demo")

def div(a, b):

    log.info("div %s / %s", a, b)

    try:

        return a / b

    except ZeroDivisionError:

        log.exception("division failed")

        raise

div(1, 1)

try:

    div(1, 0)

except ZeroDivisionError:

    pass

```

## Разбор

info перед операцией; exception добавляет traceback.

%s заполняется с учётом уровня — привычный стиль logging.

## Ошибки

- Сотни print в библиотеке.

- Логировать токены.

- Хаотичный basicConfig из библиотеки.

- DEBUG в проде без нужды.

- Логи вместо return/raise.

## Что запомнить

logging = уровни + логгеры + handlers.

В модулях: getLogger(__name__).

exception пишет traceback.

## Задание

Скрипт с 2–3 print перепишите на logging INFO и одним exception.

Переключите уровень на WARNING и сравните объём.

## Связь со следующим уроком

Дальше — **Структура проекта**. Переходите, когда своими словами объясняете модель из «Внутреннее устройство» и выполняете задание без пошаговых подсказок.
