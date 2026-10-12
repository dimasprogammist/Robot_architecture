---
id: cpp-files-binary
title: Бинарные файлы
category: cpp
section: Файлы с нуля
order: 214
description: ios::binary, read и write.
tags: [cpp, основы]
technologies: []
related: []
---

# Бинарные файлы

Картинка и файл с сырыми числами — не текст. Открывайте их с `std::ios::binary`, чтобы поток не подменял концы строк.

```cpp
std::ifstream in("photo.png", std::ios::binary);
char buf[4];
in.read(buf, 4);
```

`read` забирает ровно запрошенное число байтов, если они есть. `gcount()` говорит, сколько байтов прочиталось на самом деле.

Запись:

```cpp
std::ofstream out("data.bin", std::ios::binary);
char bytes[2] = {1, 2};
out.write(bytes, 2);
```

Так в файл попадают байты как есть, без перевода числа в десятичные цифры.
