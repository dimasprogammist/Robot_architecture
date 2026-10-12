---
id: python-files-read
title: Чтение файла
category: python
section: Файлы с нуля
order: 211
description: read, readline и построчный цикл.
tags: [python, основы]
technologies: []
related: []
---

# Чтение файла

`read()` забирает весь текст одной строкой. Для короткой заметки этого достаточно.

```python
with open("notes.txt", encoding="utf-8") as f:
    text = f.read()
```

`readline()` читает одну строку, включая перевод строки в конце, если он был.

Цикл идёт по строкам и не обязан держать в памяти огромный файл целиком:

```python
with open("notes.txt", encoding="utf-8") as f:
    for line in f:
        print(line.rstrip("\n"))
```

`rstrip` убирает символ конца строки, чтобы `print` не делал пустую строку сверху.
