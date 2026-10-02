---
id: cpp-39
title: Алгоритмы STL
module_id: cpp
module_title: C++
module_order: 8
order: 39
---

# Алгоритмы STL

## Цель

До этого мы изучили контейнеры STL и итераторы. Теперь объединим эти знания с третьей важной частью STL — стандартными алгоритмами.

После урока вы должны понимать, как использовать `std::sort`, `std::find`, `std::count`, `std::reverse`, `std::min_element`, `std::max_element`, `std::copy` и другие алгоритмы вместо написания большого количества циклов вручную.

---

## Что такое алгоритм STL

Контейнер отвечает на вопрос:

> Где и как хранятся данные?

Итератор отвечает на вопрос:

> Как обратиться к диапазону элементов?

Алгоритм отвечает на вопрос:

> Что сделать с этими элементами?

Например:

```cpp
std::sort(
    values.begin(),
    values.end()
);
```

Контейнер:

```cpp
values
```

Итераторы:

```cpp
values.begin()
values.end()
```

Алгоритм:

```cpp
std::sort()
```

Это одна из фундаментальных идей STL.

---

## Подключение алгоритмов

Для большинства стандартных алгоритмов используется:

```cpp
#include <algorithm>
```

Например:

```cpp
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values = {
        40, 10, 30, 20
    };

    std::sort(
        values.begin(),
        values.end()
    );

    for (int value : values) {
        std::cout << value << ' ';
    }
}
```

Результат:

```text
10 20 30 40
```

---

## std::sort

`std::sort` сортирует диапазон.

```cpp
std::sort(
    values.begin(),
    values.end()
);
```

По умолчанию используется сортировка по возрастанию.

Можно сортировать по убыванию:

```cpp
std::sort(
    values.begin(),
    values.end(),
    std::greater<>()
);
```

Для этого понадобится:

```cpp
#include <functional>
```

---

## Своя функция сравнения

Можно передать собственное правило:

```cpp
std::sort(
    values.begin(),
    values.end(),
    [](int a, int b) {
        return a > b;
    }
);
```

Здесь используется lambda-функция.

Мы подробнее разберём лямбды в следующем уроке.

---

## std::find

`std::find` ищет значение в диапазоне:

```cpp
auto it = std::find(
    values.begin(),
    values.end(),
    30
);
```

Если значение найдено, возвращается итератор на него.

Если нет:

```cpp
it == values.end()
```

Проверка:

```cpp
if (it != values.end()) {
    std::cout << "Found\n";
}
```

---

## std::count

`std::count` считает количество элементов, равных заданному значению.

```cpp
std::vector<int> values = {
    10, 20, 10, 30, 10
};

int count = std::count(
    values.begin(),
    values.end(),
    10
);
```

Теперь:

```text
count == 3
```

Это намного проще, чем вручную писать цикл со счётчиком.

---

## std::count_if

Иногда нужно считать не конкретное значение, а элементы, соответствующие условию.

Например:

```cpp
int count = std::count_if(
    values.begin(),
    values.end(),
    [](int value) {
        return value > 20;
    }
);
```

Алгоритм посчитает элементы, которые больше `20`.

---

## std::reverse

Для разворота диапазона:

```cpp
std::reverse(
    values.begin(),
    values.end()
);
```

Например:

```text
10 20 30 40
```

станет:

```text
40 30 20 10
```

---

## std::min_element и max_element

Чтобы найти минимальный элемент:

```cpp
auto minIt = std::min_element(
    values.begin(),
    values.end()
);
```

Максимальный:

```cpp
auto maxIt = std::max_element(
    values.begin(),
    values.end()
);
```

После этого можно получить значение:

```cpp
std::cout << *minIt << '\n';
std::cout << *maxIt << '\n';
```

---

## std::minmax_element

Если нужны оба значения:

```cpp
auto [minIt, maxIt] =
    std::minmax_element(
        values.begin(),
        values.end()
    );
```

После этого:

```cpp
std::cout << *minIt << '\n';
std::cout << *maxIt << '\n';
```

---

## std::all_of

Проверяет, соответствуют ли **все** элементы условию.

```cpp
bool result = std::all_of(
    values.begin(),
    values.end(),
    [](int value) {
        return value > 0;
    }
);
```

Если все значения положительные, `result` будет `true`.

---

## std::any_of

Проверяет, есть ли хотя бы один подходящий элемент:

```cpp
bool result = std::any_of(
    values.begin(),
    values.end(),
    [](int value) {
        return value < 0;
    }
);
```

Это удобно, например, для проверки наличия ошибочного значения.

---

## std::none_of

Проверяет, что ни один элемент не удовлетворяет условию:

```cpp
bool result = std::none_of(
    values.begin(),
    values.end(),
    [](int value) {
        return value < 0;
    }
);
```

---

## std::for_each

Можно выполнить действие для каждого элемента:

```cpp
std::for_each(
    values.begin(),
    values.end(),
    [](int value) {
        std::cout << value << '\n';
    }
);
```

Однако для простого вывода range-based `for` часто читается лучше.

`for_each` становится интереснее, когда алгоритм является частью более общего STL-кода.

---

## std::transform

`std::transform` позволяет преобразовать элементы.

Например, умножить все значения на два:

```cpp
std::transform(
    values.begin(),
    values.end(),
    values.begin(),
    [](int value) {
        return value * 2;
    }
);
```

Если было:

```text
1 2 3 4
```

станет:

```text
2 4 6 8
```

---

## std::copy

Можно скопировать диапазон:

```cpp
std::vector<int> source = {
    10, 20, 30
};

std::vector<int> destination;

std::copy(
    source.begin(),
    source.end(),
    std::back_inserter(destination)
);
```

Для `back_inserter` нужен:

```cpp
#include <iterator>
```

---

## std::remove

Здесь есть важный нюанс.

Алгоритм:

```cpp
std::remove()
```

сам по себе не уменьшает размер `vector`.

Например:

```cpp
std::remove(
    values.begin(),
    values.end(),
    10
);
```

перестраивает диапазон, но размер контейнера остаётся прежним.

Обычно используется идиома:

```cpp
values.erase(
    std::remove(
        values.begin(),
        values.end(),
        10
    ),
    values.end()
);
```

Она удаляет все элементы, равные `10`.

---

## Почему алгоритмы лучше ручных циклов

Предположим, нужно найти максимальное значение.

Можно написать:

```cpp
int maximum = values[0];

for (int value : values) {
    if (value > maximum) {
        maximum = value;
    }
}
```

Но можно использовать:

```cpp
auto it = std::max_element(
    values.begin(),
    values.end()
);
```

Второй вариант показывает **намерение программы**:

> найти максимальный элемент.

Это делает код проще для чтения.

---

## Алгоритмы работают с диапазонами

Большинство алгоритмов принимает:

```cpp
begin
end
```

Например:

```cpp
std::sort(
    values.begin(),
    values.end()
);
```

Можно обработать только часть контейнера:

```cpp
std::sort(
    values.begin(),
    values.begin() + 3
);
```

Будут отсортированы только первые три элемента.

---

## Алгоритмы не привязаны к vector

Например, `std::find` можно использовать с `std::vector`:

```cpp
std::find(
    vector.begin(),
    vector.end(),
    value
);
```

и с `std::set`:

```cpp
std::find(
    set.begin(),
    set.end(),
    value
);
```

Но у `set` уже есть собственный `find()`, который обычно предпочтительнее:

```cpp
set.find(value);
```

Это показывает важную идею: не каждый алгоритм одинаково оптимален для каждого контейнера.

---

## Практический пример: контроль датчиков

Представим значения датчиков:

```cpp
std::vector<double> temperatures = {
    21.5, 22.1, 35.7, 23.0, 19.8
};
```

Проверим, есть ли перегрев:

```cpp
bool overheating = std::any_of(
    temperatures.begin(),
    temperatures.end(),
    [](double value) {
        return value > 30.0;
    }
);
```

Теперь:

```cpp
if (overheating) {
    std::cout << "Warning!\n";
}
```

Код непосредственно описывает задачу:

> существует ли хотя бы один датчик с температурой выше 30 градусов?

---

## Комбинирование алгоритмов

Сила STL особенно хорошо проявляется, когда алгоритмы используются вместе.

Например:

```cpp
std::sort(
    values.begin(),
    values.end()
);

auto it = std::find(
    values.begin(),
    values.end(),
    50
);
```

Первый алгоритм сортирует данные.

Второй ищет элемент.

Такой код можно собирать из небольших стандартных операций.

---

## C++20 и ranges

В C++20 появился более современный интерфейс:

```cpp
#include <ranges>
```

Например:

```cpp
std::ranges::sort(values);
```

Вместо:

```cpp
std::sort(
    values.begin(),
    values.end()
);
```

`std::ranges` делает работу с диапазонами более удобной и является важной частью современного C++.

Мы ещё вернёмся к этому в уроках по современному C++.

---

## Главное

Алгоритмы STL позволяют выполнять стандартные операции над диапазонами данных.

Особенно полезно знать:

```cpp
std::sort
std::find
std::count
std::count_if
std::reverse
std::min_element
std::max_element
std::all_of
std::any_of
std::none_of
std::for_each
std::transform
std::copy
```

Большинство алгоритмов принимает диапазон:

```cpp
begin
end
```

Это позволяет использовать один и тот же алгоритм с разными контейнерами.

---

## Практика

### Задание 1

Отсортируйте вектор:

```text
50 10 40 20 30
```

по возрастанию.

### Задание 2

Найдите максимальное и минимальное значение через:

```cpp
std::min_element()
std::max_element()
```

### Задание 3

Посчитайте количество значений, которые больше `100`, используя `std::count_if`.

### Задание 4

Проверьте через `std::all_of`, что все значения температуры находятся в допустимом диапазоне:

```text
0 ≤ temperature ≤ 100
```

### Задание 5

Проверьте через `std::any_of`, есть ли среди значений датчиков хотя бы одно отрицательное.

### Задание 6

Используйте `std::transform`, чтобы перевести значения расстояний из метров в миллиметры.

### Задание 7

Удалите все нулевые элементы из `std::vector<int>` через комбинацию `remove()` и `erase()`.