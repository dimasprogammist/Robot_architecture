---
id: cpp-44
title: Range-based for
module_id: cpp
module_title: C++
module_order: 8
order: 44
---

# Range-based for

## Цель

В C++ существует специальная форма цикла `for`, предназначенная для последовательного перебора элементов контейнера или другого диапазона.

Она называется range-based `for`.

После урока вы должны понимать:

* как работает range-based `for`;
* чем он отличается от обычного `for`;
* как перебирать `vector`, `array`, `string` и `map`;
* зачем нужны `auto`, ссылки и `const`;
* когда использовать копию элемента;
* когда использовать `const auto&`;
* когда нужна обычная ссылка `auto&`;
* как изменять элементы контейнера;
* в каких случаях обычный `for` всё ещё удобнее.

---

# Обычный for

Ранее мы могли перебирать массив так:

```cpp
int values[5]{
    10, 20, 30, 40, 50
};

for (int i = 0; i < 5; ++i) {
    std::cout << values[i] << '\n';
}
```

Здесь программист самостоятельно управляет индексом:

```text
i
```

и условием:

```cpp
i < 5
```

Для простого перебора всех элементов это часто лишняя работа.

---

# Range-based for

Можно написать:

```cpp
for (int value : values) {
    std::cout << value << '\n';
}
```

Программа сама последовательно получает каждый элемент.

Читается буквально:

> для каждого `value` в `values`.

---

# std::vector

Range-based `for` особенно часто используется со стандартными контейнерами:

```cpp
std::vector<int> values{
    10, 20, 30, 40
};

for (int value : values) {
    std::cout << value << '\n';
}
```

Результат:

```text
10
20
30
40
```

---

# auto

Если тип элемента уже очевиден, можно использовать `auto`:

```cpp
for (auto value : values) {
    std::cout << value << '\n';
}
```

Если `values` имеет тип:

```cpp
std::vector<int>
```

то `value` будет `int`.

---

# Копия элемента

Важный момент:

```cpp
for (auto value : values)
```

создаёт копию каждого элемента.

Для `int` это почти незаметно:

```cpp
std::vector<int> values{
    10, 20, 30
};
```

Но если контейнер содержит большие объекты:

```cpp
std::vector<std::string> names;
```

копирование каждой строки уже может быть лишним.

---

# const auto&

Поэтому для чтения элементов часто используется:

```cpp
for (const auto& value : values) {
    std::cout << value << '\n';
}
```

Здесь:

* `const` запрещает изменение элемента;
* `&` означает ссылку;
* копирование элемента не выполняется.

Это один из самых распространённых вариантов range-based `for`.

---

# Изменение элементов

Если нужно изменить элементы контейнера, используется обычная ссылка:

```cpp
for (auto& value : values) {
    value *= 2;
}
```

Например:

```cpp
std::vector<int> values{
    1, 2, 3, 4
};

for (auto& value : values) {
    value *= 2;
}
```

После цикла:

```text
2 4 6 8
```

Без `&` изменения происходили бы только с копиями:

```cpp
for (auto value : values) {
    value *= 2;
}
```

Сам контейнер при этом не изменился бы.

---

# Сравнение вариантов

Можно запомнить три основных формы.

### Только чтение простых значений

```cpp
for (auto value : values)
```

Создаётся копия.

### Чтение объектов без копирования

```cpp
for (const auto& value : values)
```

Создаётся константная ссылка.

### Изменение элементов

```cpp
for (auto& value : values)
```

Получается ссылка на настоящий элемент.

---

# std::string

Строку тоже можно перебирать:

```cpp
std::string text = "Robot";

for (char symbol : text) {
    std::cout << symbol << '\n';
}
```

Результат:

```text
R
o
b
o
t
```

Если нужно изменить символы:

```cpp
for (char& symbol : text) {
    symbol = '*';
}
```

После этого:

```text
*****
```

---

# std::array

```cpp
std::array<double, 3> position{
    10.5,
    20.0,
    30.2
};

for (double value : position) {
    std::cout << value << '\n';
}
```

Никаких индексов вручную не требуется.

---

# Обычный массив

Range-based `for` работает и с обычными массивами:

```cpp
int values[]{
    10, 20, 30
};

for (int value : values) {
    std::cout << value << '\n';
}
```

---

# std::map

Интересный случай — `std::map`.

Например:

```cpp
std::map<std::string, int> devices{
    {"Motor", 10},
    {"Sensor", 20},
    {"Camera", 30}
};
```

Каждый элемент `map` является парой.

Можно написать:

```cpp
for (const auto& item : devices) {
    std::cout << item.first
              << ": "
              << item.second
              << '\n';
}
```

Но в современном C++ удобнее structured bindings:

```cpp
for (const auto& [name, id] : devices) {
    std::cout << name
              << ": "
              << id
              << '\n';
}
```

---

# std::unordered_map

Для `unordered_map` используется такой же синтаксис:

```cpp
std::unordered_map<std::string, double> sensors{
    {"Temperature", 24.5},
    {"Pressure", 101.2}
};

for (const auto& [name, value] : sensors) {
    std::cout << name
              << ": "
              << value
              << '\n';
}
```

---

# Условия внутри цикла

Range-based `for` можно использовать вместе с `if`:

```cpp
for (const auto& value : values) {
    if (value > 100) {
        std::cout << value << '\n';
    }
}
```

Можно пропускать элементы:

```cpp
for (const auto& value : values) {
    if (value < 0) {
        continue;
    }

    std::cout << value << '\n';
}
```

Можно остановить цикл:

```cpp
for (const auto& value : values) {
    if (value == 0) {
        break;
    }

    std::cout << value << '\n';
}
```

---

# Когда обычный for лучше

Range-based `for` отлично подходит, когда нужно пройти по всем элементам.

Но иногда нужен индекс:

```cpp
for (std::size_t i = 0; i < values.size(); ++i) {
    std::cout << i
              << ": "
              << values[i]
              << '\n';
}
```

Например, если нужно сравнить соседние элементы:

```cpp
for (std::size_t i = 0; i + 1 < values.size(); ++i) {
    if (values[i] > values[i + 1]) {
        // ...
    }
}
```

В таком случае обычный `for` естественнее.

---

# Range-based for и функции

Можно передать контейнер в функцию:

```cpp
void printValues(
    const std::vector<double>& values
) {
    for (const auto& value : values) {
        std::cout << value << '\n';
    }
}
```

Здесь:

```cpp
const std::vector<double>&
```

не копирует весь контейнер.

А:

```cpp
const auto& value
```

не копирует отдельные элементы.

---

# Практический пример

Представим набор датчиков робота:

```cpp
#include <iostream>
#include <string>
#include <vector>

struct Sensor {
    std::string name;
    double value;
    bool enabled;
};

int main() {
    std::vector<Sensor> sensors{
        {"Temperature", 24.5, true},
        {"Pressure", 101.2, true},
        {"Camera", 0.0, false}
    };

    for (const auto& sensor : sensors) {
        if (!sensor.enabled) {
            continue;
        }

        std::cout << sensor.name
                  << ": "
                  << sensor.value
                  << '\n';
    }
}
```

Здесь range-based `for` хорошо показывает намерение программы:

> пройти по всем датчикам и обработать каждый доступный датчик.

Не нужно вручную управлять индексом.

---

# Вложенные циклы

Range-based `for` можно использовать во вложенных циклах.

Например, матрица:

```cpp
std::vector<std::vector<int>> matrix{
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

for (const auto& row : matrix) {
    for (const auto& value : row) {
        std::cout << value << ' ';
    }

    std::cout << '\n';
}
```

Результат:

```text
1 2 3
4 5 6
7 8 9
```

---

# Главное

Range-based `for` предназначен для последовательного перебора элементов диапазона.

Базовый вариант:

```cpp
for (const auto& value : values) {
    // ...
}
```

Если нужно изменить элементы:

```cpp
for (auto& value : values) {
    // ...
}
```

Если копирование допустимо:

```cpp
for (auto value : values) {
    // ...
}
```

Для простого перебора контейнера range-based `for` обычно лучше обычного индексного цикла.

Обычный `for` остаётся полезным, когда нужен индекс, сложная логика перемещения по диапазону или работа с несколькими позициями одновременно.

---

# Практика

### Задание 1

Создайте `std::vector<int>` из нескольких чисел.

Выведите все элементы через range-based `for`.

### Задание 2

Создайте `std::vector<double>` с температурами.

Найдите максимальную температуру через range-based `for`.

### Задание 3

Создайте `std::vector<int>`.

Умножьте каждый элемент на два через:

```cpp
for (auto& value : values)
```

### Задание 4

Создайте строку:

```cpp
std::string text = "robot";
```

Переберите её и замените все символы на заглавные.

### Задание 5

Создайте:

```cpp
std::map<std::string, int>
```

с несколькими устройствами.

Выведите данные через:

```cpp
for (const auto& [name, id] : devices)
```

### Задание 6

Создайте `std::vector<Sensor>` и выведите только включённые датчики.

Используйте:

```cpp
const auto& sensor
```

и `continue`.