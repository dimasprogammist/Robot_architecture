---
id: be-repository
title: Репозиторий
module_id: backend
module_title: Backend
module_order: 13
order: 20
---

# Репозиторий

## Цель

Изолировать SQL/ORM за интерфейсом репозитория.

## Что уже нужно знать

Сервисный слой.

## Объяснение с нуля

Репозиторий прячет детали таблицы: get, list_open, insert, mark_done. Сервис не пишет SQL-строки. Легче сменить SQLite на PostgreSQL и мокать в тестах.

Репозиторий не принимает решения «можно ли пользователю» — только данные.

## Термины

- **Repository / DAO**.
- **Persistence**.

## Внутреннее устройство

методы ↔ SQL. Маппинг row → dataclass.

## Пример

list_open(user_id) → SELECT ... WHERE user_id=? AND done=0

## Разбор

Пустой список — [] , не ошибка; отсутствие id в get — None.

## Код

```python
class TaskRepo:
    def __init__(self, conn):
        self.conn = conn

    def insert(self, user_id: int, title: str) -> int:
        cur = self.conn.execute(
            "INSERT INTO tasks(user_id, title, done) VALUES (?, ?, 0)",
            (user_id, title),
        )
        return cur.lastrowid
```

## Практика

Какие методы нужны для комментариев?

## Типичные ошибки

- Authz внутри repo.
- Леaking cursor наружу без нужды.

## Что запомнить

Репозиторий = доступ к данным, не бизнес-политика.

## Задание

Интерфейс TaskRepo на 6 методов.

## Связь со следующим уроком

Модуль FastAPI: как собрать HTTP API на Python.

### Закрепление 1

Сформулируйте инвариант урока своими словами и один сценарий поломки. Сверьтесь с примером кода выше.
