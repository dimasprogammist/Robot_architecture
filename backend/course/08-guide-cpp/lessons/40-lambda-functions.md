---
id: cpp-40
title: Лямбда-функции
module_id: cpp
module_title: C++
module_order: 8
order: 40
---

# Лямбда-функции

## Цель

Лямбда-функции позволяют создавать небольшие функции непосредственно там, где они нужны. Особенно часто они используются вместе с алгоритмами STL, когда нужно передать условие поиска, сортировки или преобразования.

После урока вы должны понимать синтаксис lambda-функций, захват переменных, `const`, параметры и возвращаемое значение, а также уметь использовать lambda вместе с `std::sort`, `std::find_if`, `std::count_if` и `std::transform`.

---

## Зачем нужны lambda-функции

Представим, что нам нужно отсортировать числа по убыванию.

Можно создать отдельную функцию:

```cpp
bool greater(int a, int b) {
    return a > b;
}
```

А затем:

```cpp
std::sort(
    values.begin(),
    values.end(),
    greater
);
```

Это работает, но для маленького правила приходится создавать отдельную именованную функцию.

Lambda позволяет записать то же самое непосредственно в месте использования:

```cpp
std::sort(
    values.begin(),
    values.end(),
    [](int a, int b) {
        return a > b;
    }
);
```

Функция находится прямо рядом с алгоритмом.

---

## Базовый синтаксис

Общий вид:

```cpp
[capture](parameters) -> return_type {
    body
}
```

Например:

```cpp
[](int a, int b) {
    return a + b;
}
```

Здесь:

```text
[]          capture
(int a, int b) параметры
{ ... }     тело
```

Возвращаемый тип обычно можно не указывать.

Компилятор определит его автоматически.

---

## Простая lambda

Например:

```cpp
auto add = [](int a, int b) {
    return a + b;
};
```

Теперь `add` можно вызвать:

```cpp
std::cout << add(10, 20);
```

Результат:

```text
30
```

Здесь lambda фактически используется как объект, который можно вызвать как функцию.

---

## Почему auto

Тип lambda-функции имеет специальный уникальный тип, который программист обычно не пишет вручную.

Поэтому используется:

```cpp
auto
```

Например:

```cpp
auto square = [](int value) {
    return value * value;
};
```

---

## Lambda без параметров

Параметров может не быть:

```cpp
auto sayHello = []() {
    std::cout << "Hello\n";
};
```

Вызов:

```cpp
sayHello();
```

---

## Lambda с параметрами

Можно принимать несколько параметров:

```cpp
auto multiply = [](double a, double b) {
    return a * b;
};
```

Использование:

```cpp
double result = multiply(2.5, 4.0);
```

---

## Возвращаемый тип

Обычно компилятор сам определяет тип:

```cpp
auto square = [](int value) {
    return value * value;
};
```

Но его можно указать явно:

```cpp
auto square = [](int value) -> int {
    return value * value;
};
```

Стрелка:

```cpp
->
```

отделяет параметры от явно указанного возвращаемого типа.

---

## Lambda в std::sort

Это один из самых частых сценариев.

```cpp
std::vector<int> values = {
    10, 50, 20, 40, 30
};

std::sort(
    values.begin(),
    values.end(),
    [](int a, int b) {
        return a > b;
    }
);
```

Теперь значения отсортированы по убыванию.

---

## Сортировка объектов

Представим:

```cpp
struct Sensor {
    std::string name;
    double value;
};
```

Есть:

```cpp
std::vector<Sensor> sensors = {
    {"temperature", 24.5},
    {"pressure", 101.2},
    {"humidity", 45.0}
};
```

Можно отсортировать датчики по значению:

```cpp
std::sort(
    sensors.begin(),
    sensors.end(),
    [](const Sensor& a, const Sensor& b) {
        return a.value < b.value;
    }
);
```

Lambda говорит алгоритму:

> объект `a` должен идти перед `b`, если его значение меньше.

---

## Lambda в find_if

`std::find` ищет конкретное значение.

Но иногда нужно найти элемент по условию.

Для этого есть:

```cpp
std::find_if
```

Например:

```cpp
auto it = std::find_if(
    values.begin(),
    values.end(),
    [](int value) {
        return value > 100;
    }
);
```

Алгоритм найдёт первый элемент, который больше `100`.

---

## Lambda в count_if

Мы уже использовали:

```cpp
std::count_if
```

Теперь можно передать lambda:

```cpp
int count = std::count_if(
    values.begin(),
    values.end(),
    [](int value) {
        return value > 50;
    }
);
```

Получаем количество значений больше `50`.

---

## Lambda в transform

Можно преобразовать данные:

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

Каждый элемент будет умножен на два.

---

## Что такое capture

Теперь самая интересная часть.

Рассмотрим:

```cpp
int limit = 50;

auto check = [](int value) {
    return value > limit;
};
```

Такой код не скомпилируется.

Почему?

Потому что lambda не имеет доступа к локальной переменной `limit`.

Чтобы передать переменную внутрь lambda, используется **capture**.

---

## Захват по значению

Запись:

```cpp
[limit]
```

означает:

> захватить `limit` по значению.

Например:

```cpp
int limit = 50;

auto check = [limit](int value) {
    return value > limit;
};
```

Теперь:

```cpp
check(60);
```

вернёт:

```text
true
```

Внутри lambda находится собственная копия `limit`.

---

## Захват по ссылке

Можно захватить переменную по ссылке:

```cpp
int limit = 50;

auto check = [&limit](int value) {
    return value > limit;
};
```

Теперь lambda обращается к исходной переменной.

Это означает, что изменение переменной снаружи будет видно внутри lambda.

---

## Пример изменения переменной

```cpp
int counter = 0;

auto increment = [&counter]() {
    ++counter;
};

increment();
increment();

std::cout << counter << '\n';
```

Результат:

```text
2
```

Lambda захватила `counter` по ссылке.

---

## Захват всех переменных по значению

Можно написать:

```cpp
[=]
```

Это означает:

> захватить используемые локальные переменные по значению.

Например:

```cpp
int min = 10;
int max = 100;

auto check = [=](int value) {
    return value >= min &&
           value <= max;
};
```

---

## Захват всех переменных по ссылке

Можно использовать:

```cpp
[&]
```

Например:

```cpp
int min = 10;
int max = 100;

auto check = [&](int value) {
    return value >= min &&
           value <= max;
};
```

Теперь lambda использует ссылки на внешние переменные.

---

## Смешанный захват

Можно явно указать разные способы:

```cpp
int limit = 100;
int counter = 0;

auto check = [limit, &counter](int value) {
    ++counter;
    return value < limit;
};
```

Здесь:

```text
limit   → копия
counter → ссылка
```

---

## const lambda

По умолчанию operator() у lambda не позволяет изменять захваченные по значению переменные.

Например:

```cpp
int value = 10;

auto test = [value]() {
    // value = 20;
};
```

Так изменить копию нельзя.

Если нужно изменять состояние самой lambda, используется `mutable`:

```cpp
int value = 10;

auto test = [value]() mutable {
    ++value;
    std::cout << value << '\n';
};
```

Важно понимать, что изменяется **копия внутри lambda**, а не исходный `value`.

---

## Lambda и const reference

При работе с объектами часто используется:

```cpp
[](const Sensor& sensor) {
    return sensor.value > 30.0;
}
```

Это хороший вариант, когда объект не нужно копировать и менять.

Такой стиль особенно важен для больших структур и классов.

---

## Lambda с несколькими условиями

Например, нужно найти датчик с температурой от `20` до `30` градусов:

```cpp
auto it = std::find_if(
    sensors.begin(),
    sensors.end(),
    [](const Sensor& sensor) {
        return sensor.value >= 20.0 &&
               sensor.value <= 30.0;
    }
);
```

Условие находится прямо рядом с операцией поиска.

---

## Lambda возвращает объект

Lambda может возвращать не только число или `bool`.

Например:

```cpp
auto createSensor = [](std::string name) {
    return Sensor{
        name,
        0.0
    };
};
```

Теперь:

```cpp
Sensor sensor = createSensor("temperature");
```

---

## Практический пример: фильтрация датчиков

Представим:

```cpp
struct Sensor {
    std::string name;
    double value;
};
```

И:

```cpp
std::vector<Sensor> sensors = {
    {"temperature", 24.5},
    {"pressure", 101.2},
    {"motor_temp", 75.0}
};
```

Найдём перегретый датчик:

```cpp
auto it = std::find_if(
    sensors.begin(),
    sensors.end(),
    [](const Sensor& sensor) {
        return sensor.value > 70.0;
    }
);

if (it != sensors.end()) {
    std::cout << "Warning: "
              << it->name
              << '\n';
}
```

Lambda здесь делает программу очень читаемой:

```text
найти первый Sensor,
у которого value > 70
```

---

## Lambda как параметр функции

Lambda можно передавать в собственные функции.

Например:

```cpp
#include <functional>
#include <iostream>

void process(
    int value,
    const std::function<bool(int)>& condition
) {
    if (condition(value)) {
        std::cout << "Accepted\n";
    }
}
```

Теперь:

```cpp
process(
    50,
    [](int value) {
        return value > 20;
    }
);
```

Здесь lambda становится параметром функции.

На практике для обобщённых шаблонных функций часто можно обойтись без `std::function`, но это будет отдельной темой.

---

## Lambda — это объект

Очень важно не воспринимать lambda как просто «анонимную функцию».

В C++ lambda создаёт объект специального типа.

Например:

```cpp
auto check = [](int value) {
    return value > 10;
};
```

`check` — объект, у которого есть оператор вызова.

Поэтому его можно использовать так:

```cpp
check(20);
```

Именно это позволяет lambda хранить захваченное состояние.

---

## Почему lambda особенно важны в STL

STL построен вокруг идеи:

```text
контейнер
    ↓
итераторы
    ↓
алгоритм
    ↓
условие / действие
```

Например:

```cpp
std::sort(
    sensors.begin(),
    sensors.end(),
    [](const Sensor& a, const Sensor& b) {
        return a.value < b.value;
    }
);
```

Здесь:

* `vector` хранит датчики;
* итераторы задают диапазон;
* `sort` выполняет алгоритм;
* lambda задаёт правило сравнения.

Это один из типичных стилей современного C++.

---

## Главное

Lambda-функция имеет общий вид:

```cpp
[capture](parameters) {
    // body
}
```

Например:

```cpp
[](int value) {
    return value > 10;
}
```

Переменные можно захватывать:

```cpp
[value]
```

по значению или:

```cpp
[&value]
```

по ссылке.

Также существуют:

```cpp
[=]
[&]
```

для автоматического захвата используемых переменных.

Lambda особенно часто используется с:

```cpp
std::sort
std::find_if
std::count_if
std::transform
std::all_of
std::any_of
std::none_of
```

---

## Практика

### Задание 1

Создайте lambda:

```cpp
isEven
```

которая принимает `int` и возвращает `true`, если число чётное.

### Задание 2

Отсортируйте `std::vector<int>` по убыванию через lambda.

### Задание 3

Создайте вектор температур и найдите первую температуру выше `30` через `std::find_if`.

### Задание 4

Посчитайте количество отрицательных значений через `std::count_if`.

### Задание 5

Создайте:

```cpp
int limit = 100;
```

и lambda, которая проверяет, не превышает ли значение этот лимит. Используйте захват `limit` по значению.

### Задание 6

Создайте счётчик:

```cpp
int counter = 0;
```

и lambda, которая увеличивает его на единицу. Используйте захват по ссылке.

### Задание 7

Создайте структуру:

```cpp
struct Device {
    std::string name;
    double temperature;
};
```

Создайте несколько устройств и отсортируйте их по температуре через lambda.

### Задание 8

Напишите программу, которая получает список значений датчиков и с помощью `std::any_of` и lambda определяет, есть ли хотя бы один датчик с критическим значением.