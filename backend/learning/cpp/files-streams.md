---
id: cpp-files-streams
title: Файловые потоки
category: cpp
section: Файлы с нуля
order: 210
description: ifstream и ofstream: что такое поток.
tags: [cpp, основы]
technologies: []
related: []
---

# Файловые потоки

В C++ файл читают и пишут через **поток**: объект, из которого забирают данные или в который их отправляют.

Подключите заголовок:

```cpp
#include <fstream>
```

`std::ifstream` — входной поток из файла (чтение). `std::ofstream` — выходной (запись). `std::fstream` умеет оба направления, но пока хватает первых двух.

Поток нужно проверить: файл мог не открыться.

```cpp
std::ifstream in("notes.txt");
if (!in) {
    return 1;
}
```
