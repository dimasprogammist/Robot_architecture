---
id: cpp-48
title: std::unique_ptr
module_id: cpp
module_title: C++
module_order: 8
order: 48
---

# std::unique_ptr

## Цель

`std::unique_ptr` — основной инструмент современного C++ для представления уникального владения динамическим объектом.

Он позволяет отказаться от ручного `delete` и сделать модель владения объектом явной.

После урока вы должны понимать:

* как работает `std::unique_ptr`;
* зачем нужен уникальный владелец;
* как создавать `unique_ptr`;
* почему его нельзя копировать;
* как передавать владение через `std::move`;
* как использовать `get`, `reset` и `release`;
* как хранить `unique_ptr` в контейнерах;
* как использовать его с полиморфизмом;
* когда `unique_ptr` вообще не нужен.

---

# Что такое unique_ptr

Рассмотрим обычный указатель:

```cpp
int* value = new int(10);
```

Здесь программист отвечает за освобождение памяти:

```cpp
delete value;
```

С `unique_ptr`:

```cpp
auto value =
    std::make_unique<int>(10);
```

объект автоматически освобождается при уничтожении `value`.

---

# Уникальное владение

Главная идея `unique_ptr`:

> одновременно существует только один владелец объекта.

Например:

```cpp
auto sensor =
    std::make_unique<int>(25);
```

Схематично:

```text
sensor
  │
  ▼
[25]
```

Если `sensor` уничтожается, объект тоже уничтожается.

---

# Нельзя копировать unique_ptr

Такой код запрещён:

```cpp
auto a = std::make_unique<int>(10);

auto b = a;
```

Почему?

Получилось бы:

```text
a ──┐
    ├──► [10]
b ──┘
```

Два владельца не могут одновременно управлять одним объектом.

---

# Перемещение unique_ptr

Владение можно передать:

```cpp
auto a =
    std::make_unique<int>(10);

auto b = std::move(a);
```

Теперь:

```text
a -> nullptr
b -> [10]
```

`a` больше не владеет объектом.

---

# Проверка unique_ptr

Можно проверить:

```cpp
if (sensor) {
    std::cout << *sensor << '\n';
}
```

Или:

```cpp
if (sensor != nullptr) {
    // ...
}
```

После перемещения:

```cpp
auto other = std::move(sensor);
```

`sensor` становится пустым.

---

# Доступ к объекту

Если есть:

```cpp
auto value =
    std::make_unique<int>(10);
```

можно получить значение:

```cpp
std::cout << *value << '\n';
```

Для объекта:

```cpp
class Sensor {
public:
    double value;
};
```

можно написать:

```cpp
auto sensor =
    std::make_unique<Sensor>();

sensor->value = 25.5;
```

Оператор `->` используется так же, как для обычного указателя.

---

# get()

Метод:

```cpp
get()
```

возвращает обычный указатель на объект.

Например:

```cpp
auto sensor =
    std::make_unique<Sensor>();

Sensor* pointer = sensor.get();
```

Важно:

`get()` не передаёт владение.

После:

```cpp
Sensor* pointer = sensor.get();
```

владельцем остаётся `sensor`.

---

# Почему нельзя delete после get

Нельзя:

```cpp
auto sensor =
    std::make_unique<Sensor>();

Sensor* pointer = sensor.get();

delete pointer;
```

Потому что `sensor` всё ещё считает себя владельцем объекта.

Когда `sensor` уничтожится, он попытается освободить уже освобождённую память.

Это приведёт к ошибке.

---

# reset()

Метод:

```cpp
reset()
```

заменяет или удаляет управляемый объект.

Например:

```cpp
auto value =
    std::make_unique<int>(10);

value.reset();
```

Теперь объект уничтожен, а:

```cpp
value == nullptr
```

Если передать новый указатель:

```cpp
value.reset(new int(20));
```

создастся новый управляемый объект.

Однако современный код обычно предпочитает `make_unique`, а не ручной `new`.

---

# release()

Метод:

```cpp
release()
```

отказывается от владения объектом.

Например:

```cpp
auto value =
    std::make_unique<int>(10);

int* pointer = value.release();
```

Теперь:

```text
value -> nullptr
pointer -> объект 10
```

Но `pointer` теперь обычный указатель.

Ответственность за `delete` снова лежит на программисте:

```cpp
delete pointer;
```

Поэтому `release()` нужно использовать осторожно.

---

# Передача unique_ptr в функцию

Если функция должна получить владение:

```cpp
void store(
    std::unique_ptr<int> value
) {
    // value владеет объектом
}
```

Передача:

```cpp
auto value =
    std::make_unique<int>(10);

store(std::move(value));
```

После вызова:

```text
value -> nullptr
```

Функция получила владение.

---

# Передача без передачи владения

Если функция просто должна использовать объект, не нужно передавать `unique_ptr` по значению.

Можно передать ссылку:

```cpp
void printValue(const int& value) {
    std::cout << value << '\n';
}
```

И вызвать:

```cpp
auto value =
    std::make_unique<int>(10);

printValue(*value);
```

Или обычный указатель:

```cpp
void printValue(const int* value) {
    if (value) {
        std::cout << *value << '\n';
    }
}
```

Вызов:

```cpp
printValue(value.get());
```

Владение при этом остаётся у `unique_ptr`.

---

# unique_ptr в vector

`unique_ptr` отлично подходит для хранения полиморфных объектов:

```cpp
std::vector<std::unique_ptr<Device>> devices;
```

Добавить объект:

```cpp
devices.push_back(
    std::make_unique<Motor>()
);
```

Копировать `unique_ptr` нельзя, но `vector` может перемещать их.

Это позволяет хранить множество объектов с уникальным владением.

---

# Полиморфизм

Рассмотрим:

```cpp
class Device {
public:
    virtual void start() = 0;
    virtual ~Device() = default;
};
```

Наследник:

```cpp
class Motor : public Device {
public:
    void start() override {
        std::cout << "Motor started\n";
    }
};
```

Можно написать:

```cpp
std::unique_ptr<Device> device =
    std::make_unique<Motor>();
```

Хотя указатель имеет тип:

```cpp
std::unique_ptr<Device>
```

реальный объект:

```text
Motor
```

Вызов:

```cpp
device->start();
```

использует виртуальный полиморфизм.

---

# Почему виртуальный деструктор важен

Если базовый класс используется полиморфно:

```cpp
class Device {
public:
    virtual ~Device() = default;
};
```

виртуальный деструктор гарантирует корректное уничтожение объекта производного типа через указатель на базовый класс.

Например:

```cpp
std::unique_ptr<Device> device =
    std::make_unique<Motor>();
```

Когда `device` уничтожается, корректно уничтожается и `Motor`.

---

# unique_ptr и массивы

`unique_ptr` может управлять массивом:

```cpp
auto values =
    std::make_unique<int[]>(100);
```

Использование:

```cpp
values[0] = 10;
values[1] = 20;
```

Но для большинства задач вместо динамического массива лучше использовать:

```cpp
std::vector<int>
```

или:

```cpp
std::array<int, 100>
```

---

# Когда unique_ptr не нужен

Не следует автоматически использовать `unique_ptr` для каждого объекта.

Если достаточно:

```cpp
Sensor sensor;
```

не нужно делать:

```cpp
auto sensor =
    std::make_unique<Sensor>();
```

Локальный объект проще и безопаснее.

`unique_ptr` нужен, когда действительно требуется:

* динамическое время жизни;
* передача владения;
* полиморфное хранение;
* объект должен пережить текущую область видимости;
* объект создаётся условно и управляется как ресурс.

---

# Практический пример

Создадим контроллер устройств:

```cpp
#include <iostream>
#include <memory>
#include <string>
#include <vector>

class Device {
public:
    virtual void start() = 0;
    virtual ~Device() = default;
};

class Motor : public Device {
private:
    std::string name;

public:
    explicit Motor(std::string name)
        : name(std::move(name)) {
    }

    void start() override {
        std::cout << name
                  << " started\n";
    }
};

class Sensor : public Device {
private:
    std::string name;

public:
    explicit Sensor(std::string name)
        : name(std::move(name)) {
    }

    void start() override {
        std::cout << name
                  << " activated\n";
    }
};

int main() {
    std::vector<std::unique_ptr<Device>> devices;

    devices.push_back(
        std::make_unique<Motor>("Motor 1")
    );

    devices.push_back(
        std::make_unique<Sensor>("Temperature")
    );

    for (const auto& device : devices) {
        device->start();
    }
}
```

`vector` владеет всеми устройствами.

Когда `devices` уничтожается, каждый `unique_ptr` автоматически уничтожает свой объект.

---

# Главное

`std::unique_ptr` представляет уникальное владение объектом.

Создание:

```cpp
auto object =
    std::make_unique<Type>();
```

Копирование запрещено:

```cpp
auto b = a;
```

Передача владения:

```cpp
auto b = std::move(a);
```

Получение обычного указателя без передачи владения:

```cpp
a.get();
```

Удаление управляемого объекта:

```cpp
a.reset();
```

Отказ от владения:

```cpp
a.release();
```

В современном C++ `unique_ptr` обычно является первым выбором, если объект действительно должен находиться в динамической памяти с одним владельцем.

---

# Практика

### Задание 1

Создайте:

```cpp
std::unique_ptr<int>
```

через:

```cpp
std::make_unique
```

и выведите значение.

### Задание 2

Попробуйте скопировать `unique_ptr`.

Объясните, почему компилятор запрещает такую операцию.

### Задание 3

Создайте два `unique_ptr` и передайте владение через:

```cpp
std::move
```

Проверьте состояние исходного указателя.

### Задание 4

Создайте класс `Device` и два наследника.

Храните их в:

```cpp
std::vector<std::unique_ptr<Device>>
```

и вызовите виртуальный метод для каждого объекта.

### Задание 5

Напишите функцию:

```cpp
std::unique_ptr<Device> createDevice()
```

которая возвращает созданный объект-наследник.

Получите результат в `main`.

### Задание 6

Объясните разницу между:

```cpp
device.get()
```

и:

```cpp
device.release()
```

Особенно важно понять, что происходит с владением.