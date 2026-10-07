---
id: sql-subquery
title: Подзапросы
module_id: sql
module_title: SQL и базы данных
module_order: 12
order: 18
---

# Подзапросы

Подзапрос — SELECT внутри SELECT. В `WHERE ... IN (...)`, в `FROM` как таблица, иногда как скаляр в сравнении. Часто его переписывают JOIN; читаемость и план зависят от случая.

Коррелированный подзапрос ссылается на внешнюю строку и логически выполняется «для каждой». Оптимизатор может переписать его в join — но вы должны понимать множество результата.

Пользователи: Ann id=1, Bob id=2. Задачи Ann: A, B; у Bob: C.

```sql
SELECT title
FROM tasks
WHERE user_id IN (SELECT id FROM users WHERE name = 'Ann');
```

Внутренний SELECT даёт `{1}`, внешний оставляет A и B.

```sql
SELECT u.name, t.title
FROM users u
INNER JOIN tasks t ON t.user_id = u.id
WHERE u.name = 'Ann';
```

Тот же смысл через JOIN: две строки Ann.

```sql
SELECT title, priority
FROM tasks
WHERE priority > (SELECT AVG(priority) FROM tasks);
```

Скалярный подзапрос: одно число — среднее. Строки с priority выше среднего. Если внутренний SELECT вернёт две строки, сравнение `>` упадёт.

```sql
SELECT u.name
FROM users u
WHERE EXISTS (
  SELECT 1 FROM tasks t
  WHERE t.user_id = u.id AND t.done = 0
);
```

Коррелированный `EXISTS`: пользователи, у которых есть хотя бы одна открытая задача. `EXISTS` останавливается на первом совпадении — удобно для «есть/нет», не для списка.

```sql
SELECT name
FROM (
  SELECT u.name, COUNT(*) AS cnt
  FROM users u
  JOIN tasks t ON t.user_id = u.id
  GROUP BY u.name
) s
WHERE cnt >= 2;
```

Подзапрос в FROM — производная таблица. Дальше это часто читаемее как CTE.

## Практика

### Задание 1. JOIN

Перепишите запрос задач Ann через JOIN. Сверьте множество title.

### Задание 2. Выше среднего

Найдите задачи с `priority` выше среднего. Нарисуйте среднее на пяти числах 1,2,3,1,2 и отметьте, какие строки проходят.

```sql task id=sql-subquery-02 check=none
SELECT ...
```

### Задание 3. Скаляр vs множество

Что случится, если в `priority > (SELECT priority FROM tasks)` внутренний запрос вернёт несколько строк? Как исправить через `IN` или агрегат?

### Задание 4. EXISTS

Напишите `NOT EXISTS` для пользователей без задач. Сравните с LEFT JOIN ... `t.id IS NULL`.

## Типичные ошибки

- Несколько строк там, где ждут скаляр.
- Коррелированный подзапрос на больших данных без нужды.
- `IN (SELECT ...)` с NULL внутри множества — трёхзначная логика неожиданно режет строки.

## Что запомнить

Подзапрос — вложенный SELECT с понятным множеством: скаляр, список или таблица.

Дальше CTE: именовать шаги через WITH.
