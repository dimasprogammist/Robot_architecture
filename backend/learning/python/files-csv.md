---
id: python-files-csv
title: CSV
category: python
section: Файлы с нуля
order: 217
description: Таблица в текстовом файле.
tags: [python, основы]
technologies: []
related: []
---

# CSV

**CSV** — текст, где каждая строка файла — строка таблицы, а значения разделены запятой (иногда точкой с запятой).

```python
import csv

with open("points.csv", newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)
```

`row` — список строк. Числа из CSV тоже приходят строками: `"10"` — это не число `10`, пока вы не напишете `int(row[0])`.

`newline=""` нужен модулю `csv`, чтобы он сам разбирал концы строк и не двоил их на Windows.
