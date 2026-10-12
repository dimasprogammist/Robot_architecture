---
id: python-files-json
title: JSON-файлы
category: python
section: Файлы с нуля
order: 218
description: Словари и списки в текстовом файле.
tags: [python, основы]
technologies: []
related: []
---

# JSON-файлы

**JSON** — текстовый формат для списков, словарей, чисел, строк и логических значений. Его читают и люди, и программы.

```python
import json

data = {"speed": 10, "name": "robot"}
with open("config.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open("config.json", encoding="utf-8") as f:
    loaded = json.load(f)
```

`ensure_ascii=False` оставляет русские буквы буквами, а не кодами `\u....`.

JSON не умеет хранить произвольный объект Python. Сначала соберите обычный словарь или список.
