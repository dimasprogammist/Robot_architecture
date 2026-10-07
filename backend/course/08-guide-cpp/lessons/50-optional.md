---
id: cpp-50
title: std::optional
module_id: cpp
module_title: C++
module_order: 8
order: 50
---

# std::optional

## Цель

В этом уроке разберём `std::optional` — тип современного C++, который позволяет явно представить ситуацию, когда функция **может вернуть значение, а может его не вернуть**.

После урока вы должны понимать:

* зачем нужен `std::optional`;
* чем он отличается от указателя;
* как проверить наличие значения;
* как получить значение безопасно;
* что делают `has_value()`, `value()`, `value_or()` и `*`;
* где `optional` полезен в прикладных программах.

---

## Проблема отсутствующего значения

Представим функцию, которая ищет устройство по идентификатору:

```cpp
int find_device_id(const std::string& name);
```

Что вернуть, если устройство не найдено?

Можно договориться, что `-1` означает ошибку:

```cpp
int find_device_id(const std::string& name) {
    if (name == "motor") {
        return 42;
    }

    return -1;
}
```

Но теперь `-1` имеет специальное значение, о котором программист должен помнить.

Такие значения называют **сигнальными**. Например:

* `-1` — объект не найден;
* `0` — данных нет;
* пустая строка — значение отсутствует;
* `nullptr` — объект отсутствует.

Проблема в том, что обычный тип `int` сам по себе не говорит, что `-1` означает отсутствие результата.

`std::optional` позволяет выразить это непосредственно в типе.

---

## Что такое std::optional

`std::optional<T>` может находиться в одном из двух состояний:

1. значение типа `T` присутствует;
2. значения нет.

Например:

```cpp
#include <optional>

std::optional<int> find_device_id(const std::string& name) {
    if (name == "motor") {
        return 42;
    }

    return std::nullopt;
}
```

Теперь тип функции сам говорит:

> функция может вернуть `int`, но результата может не быть.

`std::nullopt` означает отсутствие значения.

---

## Подключение заголовочного файла

Для `std::optional` нужен:

```cpp
#include <optional>
```

Обычно используется C++17 и новее.

Простейший пример:

```cpp
#include <iostream>
#include <optional>

int main() {
    std::optional<int> value = 42;

    std::cout << value.value() << '\n';
}
```

---

## Optional может быть пустым

Можно создать пустой `optional`:

```cpp
std::optional<int> value;
```

Или явно:

```cpp
std::optional<int> value = std::nullopt;
```

Проверить наличие значения можно через `has_value()`:

```cpp
if (value.has_value()) {
    std::cout << "Значение есть\n";
} else {
    std::cout << "Значения нет\n";
}
```

---

## Проверка через if

У `std::optional` есть удобное преобразование к `bool`.

Поэтому можно написать короче:

```cpp
if (value) {
    std::cout << "Значение есть\n";
}
```

Или:

```cpp
if (!value) {
    std::cout << "Значения нет\n";
}
```

На практике такой вариант используется очень часто.

---

## Получение значения

Если значение точно присутствует, его можно получить через `value()`:

```cpp
std::optional<int> value = 42;

std::cout << value.value() << '\n';
```

Но если `optional` пустой:

```cpp
std::optional<int> value;

std::cout << value.value() << '\n';
```

будет выброшено исключение `std::bad_optional_access`.

Поэтому перед `value()` обычно проверяют состояние.

---

## Получение значения через *

Если `optional` содержит значение, его можно получить через оператор `*`:

```cpp
std::optional<int> value = 42;

std::cout << *value << '\n';
```

Это похоже на разыменование указателя.

Но здесь также важно понимать состояние объекта.

Нельзя бездумно делать:

```cpp
std::optional<int> value;

std::cout << *value << '\n';
```

Если значения нет, такое использование некорректно.

---

## value_or()

Очень полезный метод — `value_or()`.

Он позволяет указать значение по умолчанию:

```cpp
std::optional<int> value;

int result = value.value_or(100);

std::cout << result << '\n';
```

Результат:

```text
100
```

Если значение существует:

```cpp
std::optional<int> value = 42;

int result = value.value_or(100);
```

то `result` будет равен `42`.

То есть:

```cpp
value.value_or(default_value)
```

означает:

> вернуть значение из optional, а если его нет — использовать `default_value`.

---

## Функция поиска

Теперь можно написать нормальную функцию поиска:

```cpp
#include <iostream>
#include <optional>
#include <string>

std::optional<int> find_device_id(const std::string& name) {
    if (name == "motor") {
        return 42;
    }

    if (name == "sensor") {
        return 15;
    }

    return std::nullopt;
}

int main() {
    auto device = find_device_id("motor");

    if (device) {
        std::cout << "ID устройства: " << *device << '\n';
    } else {
        std::cout << "Устройство не найдено\n";
    }
}
```

Здесь отсутствие устройства не является исключительной ситуацией.

Это нормальный результат поиска, и `optional` хорошо подходит для его представления.

---

## Optional со строкой

`optional` может содержать практически любой обычный тип.

Например:

```cpp
std::optional<std::string> find_name(bool available) {
    if (available) {
        return "Motor A";
    }

    return std::nullopt;
}
```

Использование:

```cpp
auto name = find_name(true);

if (name) {
    std::cout << *name << '\n';
}
```

---

## Optional с объектом

Можно хранить и пользовательские типы:

```cpp
struct Device {
    int id;
    std::string name;
};
```

Функция:

```cpp
std::optional<Device> find_device(int id) {
    if (id == 10) {
        return Device{10, "Motor"};
    }

    return std::nullopt;
}
```

Использование:

```cpp
auto device = find_device(10);

if (device) {
    std::cout << device->name << '\n';
}
```

Здесь появился интересный синтаксис:

```cpp
device->name
```

Для `optional` оператор `->` позволяет обращаться к полям содержащегося объекта.

---

## Optional не является указателем

Это важное различие.

`std::optional<T>` представляет **значение, которое может отсутствовать**.

Указатель представляет **адрес объекта или отсутствие адреса**.

Например:

```cpp
std::optional<int> value = 42;
```

и:

```cpp
int number = 42;
int* pointer = &number;
```

решают разные задачи.

`optional` особенно хорошо подходит для результатов поиска и функций, где отсутствие результата является нормальным состоянием.

---

## Практический пример: поиск датчика

Представим систему управления роботом:

```cpp
#include <iostream>
#include <optional>
#include <string>
#include <vector>

struct Sensor {
    int id;
    std::string name;
};

std::optional<Sensor> find_sensor(
    const std::vector<Sensor>& sensors,
    const std::string& name
) {
    for (const auto& sensor : sensors) {
        if (sensor.name == name) {
            return sensor;
        }
    }

    return std::nullopt;
}

int main() {
    std::vector<Sensor> sensors = {
        {1, "temperature"},
        {2, "pressure"},
        {3, "distance"}
    };

    auto sensor = find_sensor(sensors, "distance");

    if (sensor) {
        std::cout << "Найден датчик: "
                  << sensor->name
                  << ", ID: "
                  << sensor->id
                  << '\n';
    } else {
        std::cout << "Датчик не найден\n";
    }
}
```

Здесь `optional` делает интерфейс функции понятным:

```cpp
std::optional<Sensor>
```

означает:

> поиск может вернуть `Sensor`, но может ничего не найти.

---

## Когда использовать optional

`std::optional` особенно полезен, когда:

* значение действительно может отсутствовать;
* отсутствие значения является нормальной ситуацией;
* не хочется использовать специальные значения вроде `-1`;
* функция выполняет поиск;
* параметр может быть необязательным;
* результат вычисления может отсутствовать.

Например:

```cpp
std::optional<double> read_temperature();
```

Такой интерфейс явно сообщает, что температура может быть недоступна.

---

## Когда optional не нужен

Не стоит использовать `optional` просто потому, что это современный C++.

Если функция гарантированно возвращает значение:

```cpp
double calculate_temperature();
```

то обычного `double` достаточно.

Если ошибка принципиально отличается от отсутствующего значения, могут использоваться другие подходы, например исключения или отдельный тип результата.

---

## Практика

### Задание 1

Создайте функцию:

```cpp
std::optional<int> find_number(
    const std::vector<int>& values,
    int target
);
```

Она должна вернуть найденное число или `std::nullopt`.

---

### Задание 2

Создайте функцию:

```cpp
std::optional<double> find_sensor_value(
    const std::string& name
);
```

Для `"temperature"` верните `24.5`, для `"pressure"` — `1.2`, для остальных датчиков верните `std::nullopt`.

---

### Задание 3

Используйте `value_or()` для получения значения по умолчанию:

```cpp
std::optional<int> speed;
```

Если скорость отсутствует, программа должна использовать `100`.

---

### Задание 4

Создайте:

```cpp
struct Motor {
    int id;
    std::string name;
};
```

Напишите функцию поиска двигателя по ID, возвращающую `std::optional<Motor>`.

---

## Главное

`std::optional<T>` позволяет представить два состояния:

```text
значение есть
значения нет
```

Основные операции:

```cpp
std::optional<int> value = 42;

if (value) {
    std::cout << *value;
}
```

```cpp
value.has_value();
```

```cpp
value.value();
```

```cpp
value.value_or(100);
```

```cpp
std::nullopt;
```

Главная идея проста: **если значение может отсутствовать, это отсутствие лучше явно выразить в типе программы, чем прятать его за специальным числом или строкой.**