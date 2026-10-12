---
id: python-files-write
title: Запись в файл
category: python
section: Файлы с нуля
order: 212
description: Режим w заменяет содержимое.
tags: [python, основы]
technologies: []
related: []
---

# Запись в файл

Режим `"w"` создаёт файл, если его не было, и **стирает** старый текст, если был.

```python
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("первая строка\n")
    f.write("вторая строка\n")
```

`\n` — перевод строки. Без него обе фразы склеятся в одну линию.

`write` не добавляет перевод строки сам. Это не `print`.
