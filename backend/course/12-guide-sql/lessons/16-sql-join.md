---
id: sql-join
title: JOIN
module_id: sql
module_title: SQL и базы данных
module_order: 12
order: 16
---

# JOIN

Нормализованные таблицы не содержат имя пользователя в каждой задаче. JOIN склеивает строки по условию. INNER — только пары. LEFT — все слева плюс совпадения справа (или NULL). Без `ON` получится декартово произведение.

```text
users                tasks
id name              id user_id title
1  Ann               10 1       A
2  Bob               11 1       B
3  Cia               12 2       C
```

```sql
SELECT u.name, t.title
FROM users u
INNER JOIN tasks t ON t.user_id = u.id
ORDER BY u.name, t.id;
```

Три строки: Ann/A, Ann/B, Bob/C. Cia не попала — у неё нет задач, INNER отбрасывает левую строку без пары.

```sql
SELECT u.name, t.title
FROM users u
LEFT JOIN tasks t ON t.user_id = u.id
ORDER BY u.id, t.id;
```

Четыре строки: три прежние плюс Cia с `title NULL`. LEFT сохраняет «пользователя без задач».

Ловушка: условие на правую таблицу в `WHERE` превращает LEFT в INNER.

```sql
SELECT u.name, t.title
FROM users u
LEFT JOIN tasks t ON t.user_id = u.id
WHERE t.title IS NOT NULL;
```

Cia снова исчезла: `WHERE` отфильтровал NULL. Фильтр по правой таблице, который должен оставить «пустых», пишут в `ON` или проверяют `IS NULL` осознанно.

```sql
SELECT u.name, t.title
FROM users u, tasks t;
```

Запятая без `ON` — декартово: 3×3 = 9 строк, бессмысленные пары Ann с чужими задачами. Так не пишут.

Планировщик выбирает nested loop, hash или merge join. Вам важно условие соединения и тип JOIN, а не имя алгоритма на первом шаге.

## Практика

### Задание 1. Без ON

Что вернёт `FROM users u INNER JOIN tasks t` без `ON` в вашей СУБД? Сколько строк на учебном наборе?

### Задание 2. Пользователи без задач

Напишите LEFT JOIN, который оставляет только пользователей без задач (`t.id IS NULL`). Кто останется?

```sql task id=sql-join-02 check=none
SELECT ...
```

### Задание 3. WHERE vs ON

Объясните, почему `LEFT JOIN ... WHERE t.title IS NOT NULL` совпадает с INNER. Как оставить Cia и отфильтровать чужие title иначе?

### Задание 4. Два JOIN

Добавьте таблицу `comments(id, task_id, body)`. Набросайте INNER JOIN users → tasks → comments для комментариев Ann. Сколько строк, если у A один комментарий, у B ни одного?

## Типичные ошибки

- JOIN без условия.
- Фильтр `WHERE` по правому столбцу, который тихо превращает LEFT в INNER.
- Дубли строк, когда справа несколько совпадений, а ждали «по одной на пользователя».

## Что запомнить

JOIN собирает связанную картину. INNER — пересечение, LEFT — «все слева».

Дальше GROUP BY: посчитать по корзинам.
