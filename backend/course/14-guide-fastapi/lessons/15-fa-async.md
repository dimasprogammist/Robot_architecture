---
id: fa-async
title: Async в FastAPI
module_id: fastapi
module_title: FastAPI
module_order: 14
order: 15
---

# Async в FastAPI

## Цель

Понять, когда async полезен и чем опасен блокирующий код.

## Что уже нужно знать

БД.

## Объяснение с нуля

async def handler позволяет ждать сеть/БД без блокировки event loop, если драйвер асинхронный. sync def выносится в threadpool. Психо: «везде async» без async-драйвера не ускоряет, а вреден при блокировках.

Для учебного сервиса sync SQLAlchemy допустим; для высокой конкуренции I/O — async стек.

## Термины

- **async/await**.
- **threadpool для sync**.

## Внутреннее устройство

await db.execute(...) в async-сессии.

## Пример

1000 параллельных ожидания сети vs 1000 sleep в async.

## Разбор

Блокирующий sleep замораживает loop.

## Код

```python
@router.get("/notes")
async def list_notes():
    # await session.execute(...)  # с async-драйвером
    return []
```

## Практика

Как проверить, что библиотека async-safe?

## Типичные ошибки

- async def + requests.get sync.
- CPU-bound в async без процессов.

## Что запомнить

Async помогает на ожидании; блокировки губительны.

## Задание

Перечислите блокирующие вызовы, которые нельзя в async-роуте.

## Связь со следующим уроком

Ошибки.

### Закрепление 1

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».
