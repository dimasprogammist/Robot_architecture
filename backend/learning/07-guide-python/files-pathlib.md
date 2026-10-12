---
id: python-files-pathlib
title: pathlib
category: python
section: Файлы с нуля
order: 220
description: Путь как объект, а не строка.
tags: [python, основы]
technologies: []
related: []
---

# pathlib

`pathlib` описывает путь объектом `Path`. Так реже путают слэши.

```python
from pathlib import Path

folder = Path("data")
folder.mkdir(exist_ok=True)
path = folder / "notes.txt"
path.write_text("привет\n", encoding="utf-8")
print(path.read_text(encoding="utf-8"))
```

`/` здесь не деление, а соединение частей пути. `Path` сам подставляет разделитель вашей системы.

`read_text` и `write_text` открывают и закрывают файл сами. Для длинной обработки по строкам по-прежнему удобен `with path.open(...)`.
