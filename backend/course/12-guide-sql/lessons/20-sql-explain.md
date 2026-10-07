---
id: sql-explain
title: EXPLAIN
module_id: sql
module_title: SQL и базы данных
module_order: 12
order: 20
---

# EXPLAIN

Индекс и JOIN уже были. EXPLAIN показывает **план**: seq scan или index scan, оценка строк, соединения. `EXPLAIN` — план без выполнения; в PostgreSQL `EXPLAIN ANALYZE` ещё и гоняет запрос (осторожно на записи).

Ищите Sequential Scan на большой таблице при селективном `WHERE` — кандидат на индекс. План не вечен: статистика меняется.

SQLite:

```sql
EXPLAIN QUERY PLAN
SELECT id, title FROM tasks WHERE user_id = 5;

CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);

EXPLAIN QUERY PLAN
SELECT id, title FROM tasks WHERE user_id = 5;
```

До индекса движок часто пишет `SCAN tasks`. После — `SEARCH tasks USING INDEX idx_tasks_user`. На десяти строках разницы нет; на миллионе — есть.

```sql
EXPLAIN QUERY PLAN
SELECT u.name, t.title
FROM users u
JOIN tasks t ON t.user_id = u.id
WHERE u.name = 'Ann';
```

Смотрите, с какой таблицы начинают и используют ли индекс по `user_id` / `name`. Неверный порядок или отсутствие индекса даёт вложенный перебор.

```sql
SELECT * FROM tasks WHERE user_id = 5;
```

`SELECT *` мешает покрывающему индексу: даже найдя id через `idx_tasks_user`, движок ходит в таблицу за остальными столбцами. Если API нужны только `id, title`, перечислите их — шанс, что индекс покроет запрос.

Стоимость в плане — условные единицы планировщика, не миллисекунды. Не оптимизируйте микросекунды на 100 строках.

## Практика

### Задание 1. До и после

Снимите план `WHERE user_id = 5` до индекса и после. Что изменилось в тексте плана?

```sql task id=sql-explain-01 check=none
EXPLAIN QUERY PLAN ...
```

### Задание 2. SELECT *

Почему `SELECT *` мешает покрывающим индексам? Какие два столбца вы бы выбрали для списка задач пользователя?

### Задание 3. Неселективный предикат

`WHERE done = 0`, если открыто 90% строк. Имеет ли смысл индекс только по `done`? Почему планировщик может выбрать seq scan?

### Задание 4. ANALYZE

Чем `EXPLAIN ANALYZE` опаснее обычного EXPLAIN на `DELETE`? Что делать на копии данных?

## Типичные ошибки

- Оптимизировать микросекунды на 100 строках.
- Слепо добавлять индексы после первого EXPLAIN.
- Путать оценку планировщика с wall-clock.

## Что запомнить

EXPLAIN отвечает «как СУБД будет искать». Сначала селективность и индексы, потом тонкая настройка.

Дальше — как приложение открывает соединение и кладёт SQL в репозиторий.
