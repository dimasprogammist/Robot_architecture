---
id: cpp-files-write
title: Запись и добавление
category: cpp
section: Файлы с нуля
order: 212
description: ofstream заменяет файл, app дописывает.
tags: [cpp, основы]
technologies: []
related: []
---

# Запись и добавление

```cpp
#include <fstream>

std::ofstream out("notes.txt");
out << "первая строка\n";
```

Так файл создаётся или **переписывается**. Старый текст пропадёт.

Дописать в конец:

```cpp
std::ofstream out("log.txt", std::ios::app);
out << "ещё событие\n";
```

`std::ios::app` — режим добавления. Без него каждая новая программа начнёт файл заново.
