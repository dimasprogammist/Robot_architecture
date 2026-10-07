---
id: sql-group
title: GROUP BY и агрегаты
module_id: sql
module_title: SQL и базы данных
module_order: 12
order: 17
---

# GROUP BY и агрегаты

JOIN склеивает строки. Агрегат схлопывает множество в одно число. GROUP BY делит на корзины. `HAVING` фильтрует уже группы, `WHERE` — исходные строки.

Порядок логики: FROM / JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.

Учебные `tasks.user_id`: 1, 1, 2, 1, 2, 3 и `done`: 0, 1, 0, 0, 1, 0.

```sql
SELECT user_id, COUNT(*) AS cnt
FROM tasks
GROUP BY user_id;
```

Корзины: user 1 → 3, user 2 → 2, user 3 → 1.

```sql
SELECT user_id, COUNT(*) AS cnt
FROM tasks
GROUP BY user_id
HAVING COUNT(*) >= 2;
```

Остаются пользователи 1 и 2. `HAVING` смотрит на агрегат, не на отдельную строку задачи.

```sql
SELECT user_id, COUNT(*) AS open_cnt
FROM tasks
WHERE done = 0
GROUP BY user_id;
```

Сначала WHERE оставил открытые: у 1 две, у 2 одна, у 3 одна. Это не то же самое, что `HAVING` по всем задачам.

```sql
SELECT done, AVG(priority) AS avg_pr
FROM tasks
GROUP BY done;
```

Две корзины: открытые и закрытые, среднее `priority` в каждой.

Нельзя написать `SELECT user_id, title, COUNT(*)` без решения, что делать с `title`: он не в GROUP BY и не агрегат — в строгом SQL это ошибка.

```sql
SELECT user_id, COUNT(*) AS open_cnt
FROM tasks
WHERE done = 0
GROUP BY user_id
ORDER BY open_cnt DESC
LIMIT 3;
```

Топ пользователей по числу открытых задач — типичный отчёт.

## Практика

### Задание 1. WHERE vs HAVING

Чем отличается «открытые, потом посчитать» от «посчитать все, потом HAVING по COUNT»? Приведите числа на учебном наборе.

### Задание 2. Топ открытых

Напишите запрос топа пользователей по числу открытых задач.

```sql task id=sql-group-02 check=none
SELECT ...
```

### Задание 3. Лишний столбец

Почему `SELECT user_id, title, COUNT(*) FROM tasks GROUP BY user_id` некорректен? Как получить «одну title на группу», если очень нужно?

### Задание 4. COUNT и NULL

`COUNT(*)` vs `COUNT(title)` vs `COUNT(DISTINCT user_id)` — что считает каждый, если один `title` равен NULL?

## Типичные ошибки

- Столбец в SELECT не из GROUP BY и не агрегат.
- Путать WHERE и HAVING.
- `COUNT(column)` когда хотели число строк, а в столбце бывают NULL.

## Что запомнить

GROUP BY = корзины; агрегаты = метрики корзин; HAVING = фильтр корзин.

Дальше подзапросы: SELECT внутри SELECT.
