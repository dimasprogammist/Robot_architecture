---
id: python-files-text
title: Текстовые файлы
category: python
section: Файлы с нуля
order: 216
description: Текст против байтов.
tags: [python, основы]
technologies: []
related: []
---

# Текстовые файлы

Текстовый режим (`"r"`, `"w"`, `"a"` без `b`) отдаёт строки `str`: буквы, а не сырые байты.

Двоичный режим (`"rb"`, `"wb"`) отдаёт `bytes`. Так читают картинки и любые файлы, где нет букв.

```python
with open("photo.png", "rb") as f:
    raw = f.read()
```

Не открывайте PNG как `encoding="utf-8"`: это не текст, и кодировка здесь ни при чём.
