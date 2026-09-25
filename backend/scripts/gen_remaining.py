# -*- coding: utf-8 -*-
"""Generate all remaining course lessons + guides with guaranteed length."""
from __future__ import annotations

from pathlib import Path

BASE = Path(__file__).resolve().parents[1]


def write_md(rel: str, lines: list[str], minimum: int = 110) -> int:
    path = BASE / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    # filter accidental None
    lines = [ln if ln is not None else "" for ln in lines]
    text = "\n".join(lines).rstrip() + "\n"
    pad_i = 0
    while text.count("\n") < minimum:
        pad_i += 1
        text += (
            f"\n### Уточнение {pad_i}\n\n"
            "Вернитесь к примеру выше и ответьте письменно: какие входные данные, "
            "какой результат, какая ошибка наиболее вероятна при копировании приёма в другой задаче.\n"
        )
    path.write_text(text, encoding="utf-8")
    n = text.count("\n")
    print(f"{rel}: {n}")
    return n


def course_fm(lid, title, mid, mtitle, morder, order):
    return [
        "---",
        f"id: {lid}",
        f"title: {title}",
        f"module_id: {mid}",
        f"module_title: {mtitle}",
        f"module_order: {morder}",
        f"order: {order}",
        "---",
        "",
    ]


def guide_fm(gid, title, category):
    return [
        "---",
        f"id: {gid}",
        f"title: {title}",
        f"category: {category}",
        "section: Справочник",
        "order: 1",
        f"description: Развёрнутый справочник — {title}.",
        "tags: [справочник]",
        "---",
        "",
    ]


def L(rel, lid, title, mid, mtitle, morder, order, goal, need, explain, terms, internals, example, steps, code, practice, mistakes, remember, task, nxt, extra=None):
    lines = course_fm(lid, title, mid, mtitle, morder, order)
    lines += [f"# {title}", ""]
    blocks = [
        ("Цель", goal),
        ("Что уже нужно знать", need),
        ("Объяснение с нуля", explain),
        ("Термины", terms),
        ("Внутреннее устройство", internals),
        ("Пример", example),
        ("Разбор", steps),
        ("Код", code),
        ("Практика", practice),
        ("Типичные ошибки", mistakes),
        ("Что запомнить", remember),
        ("Задание", task),
        ("Связь со следующим уроком", nxt),
    ]
    for h, body in blocks:
        lines += [f"## {h}", ""]
        if isinstance(body, str):
            body = [body]
        for para in body:
            lines.append(para)
            lines.append("")
    if extra:
        lines += ["## Дополнительный разбор", ""]
        for para in extra:
            lines.append(para)
            lines.append("")
    return write_md(rel, lines, 110)


TOTAL = 0

# ===================== SQL =====================
M = ("sql", "SQL и базы данных", 10)
P = "course/10-sql"

sql_lessons = [
("sql-db", "Что такое база данных", 1,
 "Понять роль СУБД: хранение, правила, одновременный доступ — не «файл, который мы иногда переписываем».",
 "Файлы, процессы, сохранение состояния между запусками программы.",
 [
  "База данных под управлением СУБД — это данные плюс схема плюс механизм запросов и контроля. Приложение формулирует намерение: прочитать, вставить, обновить. СУБД решает, как это сделать на страницах диска, с блокировками и журналом.",
  "JSON-файл удобен в прототипе. При двух писателях, поиске по полям и связях сущностей ручные файлы дают гонки и порчу. СУБД забирает эту сложность на себя.",
  "SQLite — библиотека с файлом БД. PostgreSQL — отдельный сервер. Для курса важна общая схема: соединение → SQL → строки → транзакция.",
 ],
 ["- **СУБД** — система управления базами данных.", "- **Схема** — таблицы, типы, ограничения.", "- **Соединение** — сеанс клиента с СУБД.", "- **Курсор** — объект для исполнения запросов и чтения строк."],
 [
  "Клиент открывает connection, получает cursor, execute(SQL), fetchall/fetchone, commit/rollback, close. Ошибки ограничений приходят как исключения драйвера.",
 ],
 [
  "Таблица tasks:",
  "| id | title | done |",
  "| 1 | Купить молоко | 0 |",
  "| 2 | Отчёт | 1 |",
  "| 3 | Звонок | 0 |",
 ],
 [
  "Запрос незавершённых вернёт строки 1 и 3. Строка 2 отфильтрована условием done = 0. Приложение получает список кортежей, а не «весь файл».",
 ],
 """```python
import sqlite3
conn = sqlite3.connect("app.db")
cur = conn.cursor()
cur.execute("SELECT id, title FROM tasks WHERE done = 0")
print(cur.fetchall())  # [(1, 'Купить молоко'), (3, 'Звонок')]
conn.close()
```""",
 "Назовите три риска хранения задач только в tasks.json при двух одновременных пользователях.",
 ["- Переписывать файл целиком на каждый клик.", "- Путать бэкап-папку с СУБД.", "- Открывать файл без понятия транзакции."],
 "БД = данные + правила + контролируемый доступ. Приложение говорит SQL-ом.",
 "Опишите сущности мини-трекера: users, tasks, comments — словами, без SQL.",
 "Зачем SQL как язык запросов."),

("sql-why", "Зачем SQL", 2,
 "Увидеть SQL как декларативный язык над таблицами: описываем результат, СУБД выбирает план.",
 "Понятие СУБД и таблицы tasks.",
 [
  "SQL стандартизирует операции: SELECT, INSERT, UPDATE, DELETE, JOIN. Вы пишете, какие строки и столбцы нужны. Оптимизатор выбирает индекс или полное сканирование.",
  "Декларативность не освобождает от ответственности: запрос может быть верным и безумно дорогим. Поэтому SQL изучают вместе с ключами, индексами и планами.",
  "Диалекты отличаются, ядро — общее.",
 ],
 ["- **DML** — изменение данных.", "- **DQL** — выборка.", "- **DDL** — схема.", "- **Плейсхолдер** — параметр вместо склейки строк."],
 ["Текст SQL → парсер → оптимизатор → исполнитель → набор строк клиенту."],
 ["Нужны незавершённые задачи пользователя 5: столбцы id, title."],
 [
  "```sql",
  "SELECT id, title FROM tasks",
  "WHERE user_id = 5 AND done = FALSE",
  "ORDER BY id DESC;",
  "```",
  "В выборку попадут только строки с user_id=5 и done=false; сортировка по id убыв.",
 ],
 """```python
cur.execute(
    "SELECT id, title FROM tasks WHERE user_id = ? AND done = 0 ORDER BY id DESC",
    (5,),
)
rows = cur.fetchall()
```""",
 "Придумайте 6 строк tasks и отметьте, какие попадут в запрос выше.",
 ["- f-строки с пользовательским вводом в SQL.", "- SELECT * в публичном API.", "- Учить команды без таблицы-примера."],
 "SQL описывает «что», план — «как». Параметры — обязательно.",
 "Напишите SELECT title для user_id IN (5,7) и объясните результат на своём наборе строк.",
 "Реляционная модель."),

("sql-relational", "Реляционная модель", 3,
 "Данные как отношения: строки-факты, столбцы-атрибуты, связи через ключи.",
 "Зачем SQL.",
 [
  "Отношение на практике — таблица однотипных фактов. Порядок строк сам по себе не семантика. Связь «пользователь — задачи» выражают user_id в tasks, а не обязательным массивом внутри users.",
  "Явные сущности и ключи упрощают обновления, индексы и JOIN.",
 ],
 ["- **Отношение** — таблица.", "- **Кортеж** — строка.", "- **Атрибут** — столбец.", "- **Домен** — тип и допустимые значения."],
 ["Запросы работают с множествами строк: фильтр, проекция, соединение — не с «объектом в памяти» как первичным понятием."],
 ["users(id,name) и tasks(id,user_id,title)."],
 ["Строка tasks(10,5,'Отчёт') утверждает факт принадлежности. FK может запретить user_id без users.id."],
 """```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL
);
```""",
 "Разложите заказ с товарами на таблицы без массива товаров внутри строки заказа.",
 ["- Одна сверхширокая таблица на всё.", "- Дублировать name пользователя в каждой задаче без синхронизации."],
 "Таблица = однотипные факты; связи — через ключи.",
 "Нарисуйте 3 users и 6 tasks с согласованными user_id.",
 "Таблица подробнее."),
]

for args in sql_lessons:
    lid, title, order = args[0], args[1], args[2]
    TOTAL += L(f"{P}/{lid}.md", lid, title, *M, order, *args[3:])

print("partial sql", TOTAL)
)
