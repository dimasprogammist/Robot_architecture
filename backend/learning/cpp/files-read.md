---
id: cpp-files-read
title: Чтение текстового файла
category: cpp
section: Файлы с нуля
order: 211
description: getline и оператор >>.
tags: [cpp, основы]
technologies: []
related: []
---

# Чтение текстового файла

Строка целиком:

```cpp
#include <fstream>
#include <iostream>
#include <string>

std::ifstream in("notes.txt");
std::string line;
while (std::getline(in, line)) {
    std::cout << line << "\n";
}
```

Цикл заканчивается, когда строк больше нет.

Оператор `>>` читает одно слово или число и останавливается на пробеле. Для целой строки заметок он неудобен: пробел разрежет фразу. Для строки берите `getline`.
