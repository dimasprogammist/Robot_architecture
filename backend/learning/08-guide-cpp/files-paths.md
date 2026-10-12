---
id: cpp-files-paths
title: Пути
category: cpp
section: Файлы с нуля
order: 215
description: Строка пути и std::filesystem.
tags: [cpp, основы]
technologies: []
related: []
---

# Пути

Пока путь — строка `"notes.txt"`, файл ищется в текущей папке процесса. Это не всегда папка с исходником `.cpp`.

`std::filesystem` (C++17) умеет собирать путь и проверять, что он есть:

```cpp
#include <filesystem>

std::filesystem::path p = std::filesystem::path("data") / "notes.txt";
bool exists = std::filesystem::exists(p);
```

Оператор `/` соединяет части. Создать каталог: `std::filesystem::create_directories("data")`.

В строковых литералах Windows-путь пишут с удвоенным слэшем `"C:\\data\\notes.txt"` или через `std::filesystem::path`.
