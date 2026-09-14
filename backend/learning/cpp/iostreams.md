---
id: cpp-iostreams
title: Потоки I/O
category: cpp
section: Ввод-вывод
order: 36
description: Отладка vs горячий путь.
tags: [cpp, ввод-вывод]
technologies: [C++]
related: [cpp-logging, cpp-argparse, cpp-testing]
---

# Потоки I/O

`std::cout` не для 1 кГц. Для стенда — ок. В прошивке — ITM/RTT.

## Зачем это в робототехнической системе

Утилита калибровки на ПК читает csv. Прошивка не парсит csv.

## Синтаксис и контракт

```cpp
std::ofstream out("enc.csv");
out << t << ',' << ticks << '\n';
```

## Типичные ошибки

- flush каждый сэмпл на SD, убивая dt
- смешать locale и числа протокола

## В Architecture Canvas

Стендовые утилиты — отдельные блоки OTHER.

## Связанные разделы
- cpp-logging
- cpp-argparse
- cpp-testing
