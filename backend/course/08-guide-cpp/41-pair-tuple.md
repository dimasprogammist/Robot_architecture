---
id: cpp-41
title: std::pair и std::tuple
module_id: cpp
module_title: C++
module_order: 8
order: 41
---

# std::pair и std::tuple

## Цель

В этом уроке разберём два стандартных типа C++, которые позволяют объединять несколько значений в один объект: `std::pair` и `std::tuple`.

После урока вы должны понимать:

* зачем объединять несколько значений в одну структуру;
* что такое `std::pair`;
* как получать `first` и `second`;
* как создавать пары;
* что такое `std::tuple`;
* как работать с несколькими значениями разных типов;
* как использовать `std::get`;
* как распаковывать `pair` и `tuple`;
* когда лучше использовать эти типы, а когда создать собственную структуру.

---

## Зачем объединять несколько значений

Иногда функция или часть программы должна работать сразу с несколькими связанными значениями.

Например, положение робота можно представить двумя координатами:

```cpp
double x = 10.5;
double y = 20.3;
```

Можно хранить их в отдельных переменных, но иногда удобнее объединить их в один объект.

Один из вариантов — собственная структура:

```cpp
struct Position {
    double x;
    double y;
};
```

Это хороший подход, если `Position` является важным понятием программы.

Но иногда нам нужно просто временно объединить два значения. Для этого существует `std::pair`.

---

# std::pair

`std::pair` хранит ровно два значения.

Типы значений могут быть разными:

```cpp
#include <utility>

std::pair<int, double> sensor{10, 23.5};
```

Здесь:

* `first` имеет тип `int`;
* `second` имеет тип `double`.

Получить значения можно так:

```cpp
std::cout << sensor.first << '\n';
std::cout << sensor.second << '\n';
```

Результат:

```text
10
23.5
```

---

## Создание pair

Можно явно указать тип:

```cpp
std::pair<std::string, int> device{"Motor", 12};
```

Получается:

```text
first  -> "Motor"
second -> 12
```

Можно использовать `std::make_pair`:

```cpp
auto device = std::make_pair("Motor", 12);
```

Однако в современном C++ часто достаточно обычной инициализации:

```cpp
std::pair<std::string, int> device{"Motor", 12};
```

---

## Изменение значений

`pair` является обычным объектом, поэтому его элементы можно изменять:

```cpp
std::pair<int, double> sensor{10, 23.5};

sensor.first = 11;
sensor.second = 24.1;
```

Теперь:

```text
first  = 11
second = 24.1
```

---

# pair как возвращаемое значение

Функция может вернуть сразу два значения:

```cpp
std::pair<int, int> getPosition() {
    return {100, 200};
}
```

Использование:

```cpp
auto position = getPosition();

std::cout << position.first << '\n';
std::cout << position.second << '\n';
```

Это удобно для небольших вспомогательных функций.

---

# Structured bindings

В современном C++ пару можно сразу распаковать:

```cpp
std::pair<int, double> sensor{10, 23.5};

auto [id, value] = sensor;
```

Теперь существуют две переменные:

```text
id
value
```

Их значения:

```text
id    = 10
value = 23.5
```

Это называется **structured binding**.

Такой синтаксис особенно удобен при работе с контейнерами.

---

# pair и map

`std::pair` особенно часто встречается в стандартной библиотеке.

Например, элемент `std::map` представляет собой пару:

```cpp
std::map<std::string, int> devices;

devices["Motor"] = 10;
devices["Sensor"] = 20;
```

При переборе можно написать:

```cpp
for (const auto& item : devices) {
    std::cout << item.first
              << ": "
              << item.second
              << '\n';
}
```

Здесь:

```text
first  -> ключ
second -> значение
```

В современном C++ удобнее:

```cpp
for (const auto& [name, id] : devices) {
    std::cout << name
              << ": "
              << id
              << '\n';
}
```

---

# std::tuple

`std::tuple` похож на `pair`, но позволяет хранить больше двух значений.

Например:

```cpp
#include <tuple>

std::tuple<int, double, std::string> data{
    10,
    23.5,
    "Motor"
};
```

Здесь хранятся три значения:

```text
int
double
std::string
```

---

## Получение элементов tuple

Для доступа используется `std::get`:

```cpp
std::cout << std::get<0>(data) << '\n';
std::cout << std::get<1>(data) << '\n';
std::cout << std::get<2>(data) << '\n';
```

Результат:

```text
10
23.5
Motor
```

Индексация начинается с нуля.

---

## Изменение элементов

Если `tuple` не является `const`, его элементы можно изменять:

```cpp
std::get<0>(data) = 20;
std::get<1>(data) = 25.7;
```

---

# Tuple как возвращаемое значение

Функция может вернуть несколько разных значений:

```cpp
std::tuple<bool, double, std::string> readSensor() {
    return {
        true,
        24.7,
        "Temperature"
    };
}
```

Можно получить результат:

```cpp
auto result = readSensor();

std::cout << std::get<0>(result) << '\n';
std::cout << std::get<1>(result) << '\n';
std::cout << std::get<2>(result) << '\n';
```

Но ещё удобнее сразу распаковать:

```cpp
auto [ok, value, name] = readSensor();

if (ok) {
    std::cout << name
              << ": "
              << value
              << '\n';
}
```

---

# std::tie

До появления structured bindings для распаковки `pair` и `tuple` часто использовали `std::tie`.

Например:

```cpp
std::pair<int, double> sensor{10, 23.5};

int id;
double value;

std::tie(id, value) = sensor;
```

Теперь:

```text
id = 10
value = 23.5
```

Для `tuple` это тоже работает:

```cpp
std::tuple<int, double, std::string> data{
    10,
    23.5,
    "Motor"
};

int id;
double value;
std::string name;

std::tie(id, value, name) = data;
```

В современном коде structured bindings обычно читаются лучше:

```cpp
auto [id, value, name] = data;
```

---

# Pair против собственной структуры

Допустим, есть координаты:

```cpp
std::pair<double, double> position{10.5, 20.3};
```

Такой код работает, но через некоторое время может стать непонятно, что именно означает `first`, а что `second`.

С собственной структурой:

```cpp
struct Position {
    double x;
    double y;
};
```

код становится понятнее:

```cpp
Position position{10.5, 20.3};

std::cout << position.x << '\n';
std::cout << position.y << '\n';
```

Поэтому `pair` хорошо подходит для небольших локальных задач, а именованные структуры часто лучше подходят для важных сущностей программы.

---

# Когда использовать pair

`std::pair` хорошо подходит, когда:

* нужно временно объединить два значения;
* значения связаны между собой;
* используется ключ и значение;
* функция возвращает два небольших результата;
* создаётся промежуточный объект.

Например:

```cpp
std::pair<int, std::string> device{
    10,
    "Motor"
};
```

---

# Когда использовать tuple

`std::tuple` подходит, когда:

* нужно объединить несколько значений;
* структура используется локально;
* создание отдельного типа было бы избыточным;
* значения не требуют сложной логики.

Например:

```cpp
std::tuple<int, double, bool> result{
    10,
    25.5,
    true
};
```

---

# Когда лучше создать struct

Если данные представляют самостоятельную сущность программы, лучше создать именованный тип.

Не очень удобно:

```cpp
std::tuple<
    int,
    double,
    double,
    bool,
    std::string
> robot;
```

Гораздо понятнее:

```cpp
struct RobotState {
    int id;
    double x;
    double y;
    bool active;
    std::string name;
};
```

Теперь смысл каждого поля виден непосредственно из программы.

---

# Практический пример

Создадим функцию поиска устройства:

```cpp
#include <iostream>
#include <map>
#include <string>
#include <utility>

std::pair<bool, int> findDevice(
    const std::map<std::string, int>& devices,
    const std::string& name
) {
    auto it = devices.find(name);

    if (it == devices.end()) {
        return {false, 0};
    }

    return {true, it->second};
}

int main() {
    std::map<std::string, int> devices{
        {"Motor", 10},
        {"Sensor", 20},
        {"Camera", 30}
    };

    auto [found, id] = findDevice(devices, "Sensor");

    if (found) {
        std::cout << "Device ID: "
                  << id
                  << '\n';
    }
}
```

Здесь `pair` хорошо подходит: функция возвращает два связанных значения — факт нахождения устройства и его идентификатор.

---

# Главное

`std::pair` объединяет **два значения**:

```cpp
std::pair<int, std::string>
```

`std::tuple` объединяет **несколько значений**:

```cpp
std::tuple<int, double, std::string>
```

Для доступа к `pair` используются:

```cpp
.first
.second
```

Для `tuple`:

```cpp
std::get<0>()
std::get<1>()
std::get<2>()
```

В современном C++ удобно использовать structured bindings:

```cpp
auto [id, name] = device;
```

Если данные имеют самостоятельный смысл и используются в разных частях программы, чаще лучше создать собственный `struct`.

---

# Практика

### Задание 1

Создайте:

```cpp
std::pair<std::string, int>
```

для хранения имени устройства и его идентификатора.

Выведите оба значения.

### Задание 2

Напишите функцию:

```cpp
std::pair<double, double> getPosition()
```

которая возвращает координаты объекта.

Распакуйте результат через structured bindings.

### Задание 3

Создайте `std::tuple`, содержащий:

```text
имя устройства
температуру
состояние устройства
```

Получите все значения через `std::get`.

### Задание 4

Создайте `std::map<std::string, int>` с несколькими устройствами.

Переберите его через structured bindings и выведите имя и идентификатор каждого устройства.

### Задание 5

Создайте функцию, возвращающую `tuple` из трёх значений:

```text
bool — устройство включено
double — скорость
double — температура
```

Распакуйте результат через:

```cpp
auto [enabled, speed, temperature] = ...;
```

Подумайте, в какой момент вместо `tuple` было бы лучше создать `struct`.