---
id: python-files-with
title: with open
category: python
section: Файлы с нуля
order: 214
description: Почему файл закрывают через with.
tags: [python, основы]
technologies: []
related: []
---

# with open

После работы файл нужно закрыть: отпустить доступ и дописать то, что ещё сидело в буфере. Если забыть `close()`, часть текста может не попасть на диск, а другой программе файл будет «занят».

`with` закрывает файл сам, даже если внутри случилась ошибка:

```python
with open("notes.txt", encoding="utf-8") as f:
    text = f.read()
```

После выхода из блока переменная `text` остаётся, а файл уже закрыт. Читать из `f` снаружи `with` не нужно.
