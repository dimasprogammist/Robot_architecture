---
id: sql-cte
title: CTE
module_id: sql
module_title: SQL и базы данных
module_order: 12
order: 19
---

# CTE

CTE (common table expression) — `WITH имя AS (запрос)`: именованный промежуточный результат. Удобно для многошаговой логики и рекурсии по иерархии. Это не гарантия скорости: СУБД может материализовать CTE или встроить его.

Читают сверху вниз: сначала CTE, потом финальный SELECT.

```sql
WITH open_tasks AS (
  SELECT user_id, id
  FROM tasks
  WHERE done = FALSE
)
SELECT user_id, COUNT(*) AS cnt
FROM open_tasks
GROUP BY user_id;
```

Шаг 1: только открытые. Шаг 2: счётчик по пользователю.

```sql
WITH open_tasks AS (
  SELECT user_id, id FROM tasks WHERE done = FALSE
),
named AS (
  SELECT o.user_id, u.name, o.id
  FROM open_tasks o
  JOIN users u ON u.id = o.user_id
)
SELECT name, COUNT(*) AS open_cnt
FROM named
GROUP BY name
ORDER BY open_cnt DESC;
```

Два CTE: фильтр, затем имена, затем агрегат. Тот же отчёт подзапросами читается изнутри наружу — хуже для человека.

```sql
WITH RECURSIVE walk AS (
  SELECT id, parent_id, name, 0 AS depth
  FROM org
  WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.parent_id, c.name, w.depth + 1
  FROM org c
  JOIN walk w ON c.parent_id = w.id
)
SELECT * FROM walk;
```

Рекурсивный CTE: якорь (корни) + шаг (дети). Нужен явный выход, иначе цикл в данных раздует запрос. Для деревьев комментариев и оргструктур — рабочий приём; для графа с циклами — опасный.

CTE не замена временной таблицы, если нужен индекс на промежуток или несколько отдельных стейтментов.

## Практика

### Задание 1. Переписать подзапрос

Перепишите «задачи Ann» из прошлого урока в CTE: сначала `ann_ids`, потом `SELECT title`.

```sql task id=sql-cte-01 check=none
WITH ...
```

### Задание 2. Словами

Разбейте отчёт «топ открытых задач по имени пользователя» на 2–3 CTE. Не пишите SQL сразу — список шагов.

### Задание 3. Рекурсия

На дереве `id/parent_id`: 1←NULL, 2←1, 3←1, 4←2. Какие строки и `depth` даст рекурсивный обход из урока?

### Задание 4. Зачем не CTE

Когда простой `SELECT ... WHERE` лучше CTE? Когда временная таблица лучше CTE?

## Типичные ошибки

- CTE ради CTE на одном простом SELECT.
- Путать CTE с временной таблицей.
- Рекурсия без защиты от циклов.

## Что запомнить

CTE улучшает структуру запроса: шаги видны сверху вниз.

Дальше EXPLAIN: как СУБД будет искать строки.
