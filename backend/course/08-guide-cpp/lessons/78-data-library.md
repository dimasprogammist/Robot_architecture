---
id: cpp-78
title: Мини-библиотека для работы с данными
module_id: cpp
module_title: C++
module_order: 8
order: 78
---

# Мини-библиотека для работы с данными

## Цель

Хорошая программа не должна превращаться в один огромный файл.

Если определённая логика нужна в нескольких местах, её можно выделить в отдельную библиотеку.

В этом уроке создадим небольшую библиотеку для работы с измерениями.

Она будет уметь:

```text
хранить измерения
добавлять значения
считать минимум
считать максимум
считать среднее
очищать данные
```

На практике мы объединим:

* классы;
* `.h` и `.cpp`;
* `std::vector`;
* `std::optional`;
* `const`;
* ссылки;
* алгоритмы STL;
* пространства имён;
* CMake;
* тестирование.

---

## Зачем нужна библиотека

Представим две программы:

```text
Monitor
Logger
```

Обе должны считать среднее значение.

Если код скопировать:

```text
Monitor → average()
Logger  → average()
```

получим дублирование.

Лучше создать:

```text
DataLibrary
      ↓
Monitor
Logger
```

Теперь алгоритм находится в одном месте.

---

## Структура проекта

Создадим:

```text
data_library/
├── CMakeLists.txt
├── include/
│   └── data/
│       └── measurement_buffer.h
├── src/
│   └── measurement_buffer.cpp
├── tests/
│   └── test_measurement_buffer.cpp
└── examples/
    └── main.cpp
```

Это уже напоминает структуру реальной библиотеки.

---

## Класс MeasurementBuffer

Начнём с интерфейса:

```cpp
#pragma once

#include <cstddef>
#include <optional>
#include <vector>

namespace data {

class MeasurementBuffer {
public:
    void add(double value);

    std::size_t size() const;

    std::optional<double> min() const;
    std::optional<double> max() const;
    std::optional<double> average() const;

    void clear();

private:
    std::vector<double> values;
};

}
```

---

## Почему namespace

Мы используем:

```cpp
namespace data
```

чтобы классы библиотеки не конфликтовали с другими именами.

Использование:

```cpp
data::MeasurementBuffer buffer;
```

---

## Реализация

В `.cpp`:

```cpp
#include "data/measurement_buffer.h"

#include <algorithm>
#include <numeric>

namespace data {

void MeasurementBuffer::add(double value) {
    values.push_back(value);
}

std::size_t MeasurementBuffer::size() const {
    return values.size();
}

void MeasurementBuffer::clear() {
    values.clear();
}

}
```

---

## Почему `const`

Метод:

```cpp
std::size_t size() const
```

не изменяет объект.

То же относится к:

```cpp
min()
max()
average()
```

Это позволяет вызывать их и у `const` объектов.

---

## Минимальное значение

Можно использовать:

```cpp
std::ranges::min_element
```

в современном C++, но для простоты можно начать с:

```cpp
auto it = std::min_element(
    values.begin(),
    values.end()
);
```

Если данных нет:

```cpp
return std::nullopt;
```

Иначе:

```cpp
return *it;
```

---

## Полная реализация `min`

```cpp
std::optional<double> MeasurementBuffer::min() const {
    if (values.empty()) {
        return std::nullopt;
    }

    auto it = std::min_element(
        values.begin(),
        values.end()
    );

    return *it;
}
```

---

## Максимум

Аналогично:

```cpp
std::optional<double> MeasurementBuffer::max() const {
    if (values.empty()) {
        return std::nullopt;
    }

    auto it = std::max_element(
        values.begin(),
        values.end()
    );

    return *it;
}
```

---

## Среднее

Сначала сумма:

```cpp
double sum = std::accumulate(
    values.begin(),
    values.end(),
    0.0
);
```

Затем:

```cpp
return sum / values.size();
```

Полностью:

```cpp
std::optional<double>
MeasurementBuffer::average() const {
    if (values.empty()) {
        return std::nullopt;
    }

    double sum = std::accumulate(
        values.begin(),
        values.end(),
        0.0
    );

    return sum / values.size();
}
```

---

## Почему `optional`

Что вернуть для пустого буфера?

Нельзя просто вернуть:

```cpp
0.0
```

Потому что:

```text
0.0
```

может быть настоящим измерением.

`std::optional<double>` позволяет отличить:

```text
значение существует
```

от:

```text
значения нет
```

---

## Использование

```cpp
#include "data/measurement_buffer.h"

#include <iostream>

int main() {
    data::MeasurementBuffer buffer;

    buffer.add(10.0);
    buffer.add(20.0);
    buffer.add(30.0);

    auto average = buffer.average();

    if (average) {
        std::cout << *average << '\n';
    }
}
```

---

## `value_or`

Можно написать:

```cpp
std::cout
    << buffer.average().value_or(0.0)
    << '\n';
```

Но нужно понимать смысл.

Если данных нет, `0.0` будет значением по умолчанию только для вывода.

Это не означает, что среднее реально равно нулю.

---

## Ограничение размера

Для промышленного приложения может быть нужен ограниченный буфер.

Например:

```text
последние 100 измерений
```

Тогда класс можно расширить:

```cpp
std::size_t maxSize;
```

и при добавлении удалять старые данные.

---

## Скользящее окно

Например:

```text
100
101
102
103
104
```

Храним только последние:

```text
3
```

После добавления:

```text
105
```

получаем:

```text
103
104
105
```

Такой буфер полезен для:

```text
датчиков
телеметрии
фильтрации
мониторинга
```

---

## Фильтрация

Позже библиотеку можно расширить:

```cpp
std::optional<double> average() const;
std::optional<double> median() const;
double standardDeviation() const;
```

Но библиотека должна расширяться постепенно.

Не нужно добавлять десятки функций без необходимости.

---

## Тестируемость

Класс хорошо тестируется.

Например:

```text
пустой буфер
один элемент
несколько элементов
отрицательные значения
нулевые значения
большие значения
```

---

## Пример теста

Без конкретного тестового фреймворка можно начать даже с:

```cpp
#include <cassert>

int main() {
    data::MeasurementBuffer buffer;

    buffer.add(10.0);
    buffer.add(20.0);

    assert(buffer.size() == 2);
    assert(buffer.average().value() == 15.0);
}
```

Позже можно использовать Catch2, GoogleTest или другой тестовый фреймворк.

---

## CMake

Библиотеку можно описать:

```cmake
cmake_minimum_required(VERSION 3.20)

project(data_library
    VERSION 1.0
    LANGUAGES CXX
)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(data_library
    src/measurement_buffer.cpp
)

target_include_directories(data_library
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)
```

---

## Почему `PUBLIC`

Потребитель библиотеки должен видеть:

```text
include/data/measurement_buffer.h
```

Поэтому include-директория является частью публичного интерфейса.

---

## Пример программы

Добавим:

```cmake
add_executable(example
    examples/main.cpp
)

target_link_libraries(example
    PRIVATE
        data_library
)
```

Теперь:

```text
data_library
       ↑
       │
    example
```

---

## Почему библиотека лучше копирования

Допустим, мы нашли ошибку:

```text
average()
```

Если код был скопирован в 5 приложений:

```text
5 мест для исправления
```

Если используется библиотека:

```text
1 место
```

После обновления библиотеки все приложения могут использовать исправление.

---

## Публичный и внутренний код

Хорошая библиотека разделяет:

```text
public API
```

и:

```text
implementation details
```

Пользователю не нужно знать:

```cpp
std::vector<double> values;
```

Он знает:

```cpp
buffer.add(10);
buffer.average();
```

Это называется абстракцией.

---

## Стабильный интерфейс

Если пользователи библиотеки пишут:

```cpp
buffer.average();
```

не стоит без необходимости менять этот интерфейс.

Можно менять внутреннюю реализацию:

```text
vector
deque
ring buffer
```

не меняя внешний API.

---

## Ошибки библиотеки

Библиотека должна иметь понятное поведение.

Например:

```cpp
average()
```

для пустого буфера:

```text
std::nullopt
```

Это лучше, чем:

```text
деление на ноль
```

или:

```text
неопределённое значение
```

---

## Документирование API

Даже маленькой библиотеке нужны понятные имена.

Например:

```cpp
void add(double value);
```

понятнее:

```cpp
void doSomething(double x);
```

Хороший API должен объяснять себя именами.

---

## Версионирование

У библиотеки может быть версия:

```text
1.0.0
```

Если изменился только внутренний код:

```text
1.0.1
```

Если добавлена совместимая возможность:

```text
1.1.0
```

Если изменён публичный API:

```text
2.0.0
```

Это общая идея семантического версионирования.

---

## Главное

Небольшая библиотека показывает важную архитектурную идею:

```text
Reusable logic
      ↓
Library
      ↓
Applications
```

Хорошая библиотека:

* имеет небольшой понятный API;
* скрывает детали реализации;
* проверяет входные данные;
* легко тестируется;
* не зависит без необходимости от конкретного приложения.

---

## Практика

### Задание 1

Добавьте метод:

```cpp
std::optional<double> last() const;
```

который возвращает последнее измерение.

---

### Задание 2

Добавьте:

```cpp
bool empty() const;
```

---

### Задание 3

Добавьте ограничение размера:

```text
maxSize
```

---

### Задание 4

Создайте тесты для:

```text
empty
one value
multiple values
negative values
zero
```

---

### Задание 5

Добавьте пример программы через CMake.

Структура должна быть:

```text
include/
src/
tests/
examples/
```

---

### Задание 6

Подумайте, какие функции должны быть частью публичного API, а какие лучше оставить внутренними.

---

## Что дальше

В следующем уроке мы объединим потоки, синхронизацию и сбор данных в практический **многопоточный монитор**.