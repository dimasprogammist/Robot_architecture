---
id: python-files-paths
title: Пути и каталоги
category: python
section: Файлы с нуля
order: 219
description: Относительный путь, папки и os.
tags: [python, основы]
technologies: []
related: []
---

# Пути и каталоги

**Относительный путь** считается от текущей папки запуска программы, не от папки, где лежит `.py`, если вы сами так не посчитали.

`notes.txt` значит «файл notes.txt в текущей папке». `data/notes.txt` — файл внутри папки `data`.

Создать папку и узнать, есть ли путь:

```python
import os

os.makedirs("data", exist_ok=True)
print(os.path.exists("data/notes.txt"))
print(os.listdir("data"))
```

`exist_ok=True` не падает, если папка уже есть.

На Windows в путях часто `\`, на Linux `/`. В строках Python лучше не склеивать разделители руками.
