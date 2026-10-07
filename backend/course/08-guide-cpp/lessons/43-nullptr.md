---
id: cpp-43
title: nullptr
module_id: cpp
module_title: C++
module_order: 8
order: 43
---

# nullptr

## Цель

В C++ указатель может не указывать ни на какой объект. Для обозначения такого состояния в современном C++ используется `nullptr`.

После урока вы должны понимать:

* что такое нулевой указатель;
* зачем нужен `nullptr`;
* почему старый `NULL` хуже;
* чем `nullptr` отличается от обычного числа `0`;
* как проверять указатели;
* как `nullptr` влияет на перегрузку функций;
* почему разыменовывать `nullptr` нельзя.

---

# Что такое nullptr

Рассмотрим указатель:

```cpp
int* pointer = nullptr;
```

Это означает:

> указатель существует, но сейчас не указывает на объект `int`.

Можно представить это так:

```text
pointer
   │
   ▼
nullptr
```

Указатель не содержит адрес полезного объекта.

---

# Зачем нужен нулевой указатель

Иногда программе нужно явно показать, что объекта нет.

Например:

```cpp
int* sensor = nullptr;
```

Пока датчик не найден, указатель не указывает на него.

Позже:

```cpp
int value = 25;

sensor = &value;
```

Теперь:

```text
sensor
   │
   ▼
value
```

---

# Проверка указателя

Указатель можно проверить обычным `if`:

```cpp
if (sensor) {
    std::cout << "Sensor exists\n";
}
```

Если указатель равен `nullptr`, условие ложно.

Можно написать и явно:

```cpp
if (sensor != nullptr) {
    std::cout << "Sensor exists\n";
}
```

Оба варианта корректны.

---

# nullptr вместо NULL

В старом C и старом C++ часто использовали:

```cpp
int* pointer = NULL;
```

или:

```cpp
int* pointer = 0;
```

В современном C++ используется:

```cpp
int* pointer = nullptr;
```

`nullptr` специально предназначен для обозначения нулевого указателя.

---

# Почему 0 неидеален

В C++ число `0` может использоваться как нулевой указатель:

```cpp
int* pointer = 0;
```

Но `0` — это всё-таки целочисленная константа.

`nullptr` имеет специальный тип:

```cpp
std::nullptr_t
```

Поэтому он однозначно означает именно нулевой указатель.

---

# Перегрузка функций

Разница особенно заметна при перегрузке:

```cpp
void process(int value) {
    std::cout << "int\n";
}

void process(int* pointer) {
    std::cout << "pointer\n";
}
```

Если написать:

```cpp
process(0);
```

будет выбран вариант с `int`.

А:

```cpp
process(nullptr);
```

выберет вариант с указателем:

```text
pointer
```

Это одна из причин, почему `nullptr` был добавлен в современный C++.

---

# nullptr не является адресом объекта

Нельзя считать, что:

```cpp
nullptr
```

это обычный адрес, по которому можно обращаться.

Например:

```cpp
int* pointer = nullptr;
```

Нельзя делать:

```cpp
std::cout << *pointer;
```

Потому что разыменование требует существующего объекта.

---

# Разыменование nullptr

Рассмотрим:

```cpp
int* pointer = nullptr;

*pointer = 10;
```

Программа обращается к объекту, которого нет.

Это неопределённое поведение.

Поэтому перед использованием указателя нужно убедиться, что он указывает на действительный объект:

```cpp
if (pointer != nullptr) {
    *pointer = 10;
}
```

---

# nullptr и функции

Функция может принимать указатель:

```cpp
void printValue(const int* value) {
    if (value == nullptr) {
        std::cout << "No value\n";
        return;
    }

    std::cout << *value << '\n';
}
```

Теперь можно передать:

```cpp
int number = 42;

printValue(&number);
printValue(nullptr);
```

Первый вызов передаст адрес числа.

Второй сообщит функции:

> значения нет.

---

# nullptr как отсутствие объекта

Представим поиск устройства:

```cpp
struct Device {
    std::string name;
};
```

Функция может вернуть указатель:

```cpp
Device* findDevice();
```

Если устройство найдено:

```cpp
return &device;
```

Если нет:

```cpp
return nullptr;
```

Использование:

```cpp
Device* device = findDevice();

if (device == nullptr) {
    std::cout << "Device not found\n";
    return;
}

std::cout << device->name << '\n';
```

Это распространённый паттерн низкоуровневого C++ кода.

---

# Оператор ->

Если есть указатель на объект:

```cpp
Device* device;
```

можно обратиться к полю через:

```cpp
device->name
```

Это эквивалентно:

```cpp
(*device).name
```

Но если:

```cpp
device == nullptr
```

оператор `->` использовать нельзя.

---

# nullptr и массивы

Можно создать массив указателей:

```cpp
int* values[3]{
    nullptr,
    nullptr,
    nullptr
};
```

Позже некоторые элементы можно связать с объектами:

```cpp
int a = 10;
int b = 20;

values[0] = &a;
values[2] = &b;
```

Теперь:

```text
values[0] -> a
values[1] -> nullptr
values[2] -> b
```

---

# nullptr и очистка указателя

После удаления объекта указатель нельзя оставлять как будто он всё ещё действителен.

Например:

```cpp
int* value = new int(10);

delete value;
value = nullptr;
```

После `delete` сам указатель всё ещё существует, но объект уничтожен.

Присваивание:

```cpp
value = nullptr;
```

позволяет явно показать, что указатель больше никуда не указывает.

В современном C++ ручной `new/delete` обычно заменяется умными указателями, которые мы разберём позже.

---

# Несколько указателей

Несколько указателей могут одновременно быть `nullptr`:

```cpp
int* sensor = nullptr;
int* motor = nullptr;
int* camera = nullptr;
```

Это нормальное состояние.

Позже:

```cpp
int sensorValue = 25;

sensor = &sensorValue;
```

Теперь только `sensor` указывает на объект.

---

# nullptr и логика программы

Очень полезно воспринимать `nullptr` как состояние:

```text
объект отсутствует
```

Например:

```cpp
Device* activeDevice = nullptr;
```

Это означает:

```text
активное устройство не выбрано
```

После выбора:

```cpp
activeDevice = &motor;
```

Теперь объект выбран.

---

# Практический пример

```cpp
#include <iostream>
#include <string>

struct Sensor {
    std::string name;
    double value;
};

void printSensor(const Sensor* sensor) {
    if (sensor == nullptr) {
        std::cout << "Sensor is not available\n";
        return;
    }

    std::cout << sensor->name
              << ": "
              << sensor->value
              << '\n';
}

int main() {
    Sensor temperature{
        "Temperature",
        24.5
    };

    Sensor* sensor = &temperature;

    printSensor(sensor);

    sensor = nullptr;

    printSensor(sensor);
}
```

Результат:

```text
Temperature: 24.5
Sensor is not available
```

Здесь `nullptr` используется как состояние «датчик недоступен».

---

# Главное

Современный C++ использует:

```cpp
nullptr
```

для обозначения нулевого указателя.

Проверка:

```cpp
if (pointer == nullptr)
```

или:

```cpp
if (!pointer)
```

Использовать `nullptr` безопаснее и понятнее, чем старые:

```cpp
NULL
0
```

Главное правило:

> `nullptr` можно проверять, но нельзя разыменовывать.

Нельзя:

```cpp
*pointer
```

если:

```cpp
pointer == nullptr
```

---

# Практика

### Задание 1

Создайте:

```cpp
int* value = nullptr;
```

Проверьте его через `if`.

### Задание 2

Создайте число:

```cpp
int value = 100;
```

Создайте указатель на него.

Проверьте указатель и выведите значение через разыменование.

### Задание 3

Создайте функцию:

```cpp
void printValue(const int* value)
```

Она должна:

* вывести число, если указатель действителен;
* вывести сообщение, если передан `nullptr`.

### Задание 4

Создайте две перегруженные функции:

```cpp
process(int)
process(int*)
```

Проверьте разницу между:

```cpp
process(0);
process(nullptr);
```

### Задание 5

Создайте структуру `Sensor` и функцию:

```cpp
Sensor* findSensor(bool available)
```

Если датчик доступен — вернуть указатель на объект.

Если недоступен — вернуть `nullptr`.