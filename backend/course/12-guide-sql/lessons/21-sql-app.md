---
id: sql-app
title: Приложение и БД
module_id: sql
module_title: SQL и базы данных
module_order: 12
order: 21
---

# Приложение и БД

SELECT и транзакции уже были. В сервисе они живут не в вакууме: процесс открывает **соединение**, кладёт параметризованный SQL, читает строки, коммитит, отдаёт соединение.

Скрипт из десяти запросов может один раз `connect` и закрыть. HTTP-сервер так не делает: на каждый запрос новый TCP к PostgreSQL — дорого. Держат **пул**: взял соединение, поработал, вернул. ORM (SQLAlchemy) генерирует SQL, путь тот же: сессия → драйвер → СУБД.

Слои обычно: маршрут API → сервис → репозиторий с SQL → драйвер. UI-логику в SQL не тащат, SQL в обработчик кнопки — тоже нет. Иначе схему невозможно менять без фронта.

```python
def create_task(conn, user_id: int, title: str) -> int:
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO tasks(user_id, title, done) VALUES (?, ?, 0)",
        (user_id, title),
    )
    conn.commit()
    return cur.lastrowid


def list_open(conn, user_id: int) -> list[tuple]:
    cur = conn.cursor()
    cur.execute(
        "SELECT id, title FROM tasks WHERE user_id = ? AND done = 0",
        (user_id,),
    )
    return cur.fetchall()


def complete_task(conn, task_id: int) -> bool:
    cur = conn.cursor()
    cur.execute(
        "UPDATE tasks SET done = 1 WHERE id = ? AND done = 0",
        (task_id,),
    )
    if cur.rowcount != 1:
        conn.rollback()
        return False
    conn.commit()
    return True
```

Плейсхолдеры, не f-строка. Падение после INSERT до COMMIT: клиент задачи не увидит — так и должно быть. Исключение в `create_task` без rollback оставит соединение в грязном состоянии для следующего, кто возьмёт его из пула.

`complete_task` смотрит `rowcount`: уже закрыта или нет такого id — не успех. Транзакцию нельзя держать, пока ждёте чужой HTTP: таймаут соседа заблокирует строки у вас.

Дальше курс backend разберёт маршруты и слои сервиса уже как архитектуру, не как SQL.

## Практика

### Задание 1. rollback

Где в `create_task` нужен rollback при исключении после `execute` и до commit? Что будет, если забыть и вернуть соединение в пул?

### Задание 2. Уже закрыта

`complete_task` вернул `False`. Какие два смысла у «не одна строка»? Что отдать HTTP?

```python task id=sql-app-02 check=none
def complete_task(conn, task_id: int) -> bool:
    ...
```

### Задание 3. Пул

Зачем пул серверу на сотне запросов в секунду? Почему скрипту миграции из десяти команд он не обязателен?

### Задание 4. Чужой HTTP

Почему `BEGIN`, затем `requests.get(...)`, затем `COMMIT` — плохой шаблон? Чем это хуже «сначала сеть, потом короткая транзакция»?

Раздел SQL на этом сходится: от файла JSON до соединения в приложении.
