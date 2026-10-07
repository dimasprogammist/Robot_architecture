---
id: sql-write
title: INSERT UPDATE DELETE
module_id: sql
module_title: SQL и базы данных
module_order: 12
order: 15
---

# INSERT UPDATE DELETE

Чтение уже было. Запись опаснее: `UPDATE` и `DELETE` без `WHERE` трогают всю таблицу. Смотрите, **сколько строк** затронули (`rowcount`), и держите изменения в транзакции.

INSERT добавляет строки. UPDATE меняет существующие. DELETE удаляет. В PostgreSQL `RETURNING` отдаёт изменённые строки API; в SQLite тоже есть `RETURNING` в новых версиях.

```sql
INSERT INTO tasks (id, user_id, title, done, priority)
VALUES (6, 5, 'Новая', 0, 2);
```

Одна новая строка. Если `id` — первичный ключ и 6 уже есть, вставка упадёт, а не «перезапишет молча».

```sql
UPDATE tasks
SET done = 1
WHERE id = 3;
```

Ожидаемый `rowcount` — 1. Если 0, id не существовал: это сигнал для API, а не успех.

```sql
UPDATE tasks
SET title = 'Звонок клиенту'
WHERE id = 3 AND done = 0;
```

Условие «только открытая» защищает от гонки: закрытую задачу не переименуют. Если строка 3 уже `done = 1`, `rowcount = 0`.

```sql
DELETE FROM tasks
WHERE done = 1;
```

Все завершённые. На учебном наборе это строки 2 и 5 — две штуки. Без `WHERE` удалилась бы вся таблица.

```python
cur.execute("UPDATE tasks SET done = 1 WHERE id = ?", (3,))
print(cur.rowcount)  # 1
conn.commit()
cur.execute("DELETE FROM tasks WHERE done = 1")
print(cur.rowcount)
conn.commit()
```

Плейсхолдер `?` (или `%s` в драйвере PostgreSQL) обязателен: значения не склеивают в SQL-строку.

Изменения живут в транзакции. Пока нет `COMMIT`, другие сессии могут не видеть запись — зависит от изоляции (следующий блок уроков уже дал ACID).

UPSERT (`INSERT ... ON CONFLICT` / `ON CONFLICT DO UPDATE`) — отдельный диалектный приём: вставить или обновить по ключу.

## Практика

### Задание 1. Безопасный UPDATE

Напишите `UPDATE title` только если задача не `done`. Предскажите `rowcount` для id=2 на учебном наборе из урока SELECT.

### Задание 2. Транзакция

В одной транзакции: вставить задачу и строку в `audit`. Что увидит другой клиент, если вы сделаете `ROLLBACK` после вставки задачи?

### Задание 3. DELETE без WHERE

Чем опасна опечатка `DELETE FROM tasks WHERE done = 1` → забытый `WHERE`? Как проверять на копии / в транзакции до COMMIT?

### Задание 4. INSERT дубликата

Повторите INSERT с тем же `id`. Какое ограничение сработает? Нужен ли вам UPSERT или ошибка «уже есть»?

## Типичные ошибки

- UPDATE/DELETE без WHERE.
- Игнорировать `rowcount = 0`.
- Склеивать SQL через f-строку.

## Что запомнить

Любая запись — проверьте условие и число строк, затем COMMIT.

Дальше JOIN: собрать картину из нескольких таблиц.
