---
id: cpp-49
title: std::shared_ptr и std::weak_ptr
module_id: cpp
module_title: C++
module_order: 8
order: 49
---

# std::shared_ptr и std::weak_ptr

## Цель

`std::unique_ptr` подходит для ситуации, когда объект имеет одного владельца. Но иногда несколько частей программы должны совместно владеть одним объектом.

Для этого существует `std::shared_ptr`.

Вместе с ним используется `std::weak_ptr`, который позволяет наблюдать за объектом без владения.

После урока вы должны понимать:

* как работает `shared_ptr`;
* что такое совместное владение;
* как работает счётчик ссылок;
* зачем нужен `use_count()`;
* почему `shared_ptr` можно копировать;
* как работает `reset()`;
* что такое `weak_ptr`;
* почему `weak_ptr` не владеет объектом;
* как предотвращаются циклические ссылки;
* почему `shared_ptr` не следует использовать автоматически.

---

# shared_ptr

`std::shared_ptr` предназначен для совместного владения объектом.

Например:

```cpp
auto sensor =
    std::make_shared<int>(25);
```

Теперь `sensor` владеет объектом.

Можно создать ещё одного владельца:

```cpp
auto copy = sensor;
```

Теперь:

```text
sensor ──┐
         ├──► [25]
copy ────┘
```

Оба указателя управляют одним объектом.

---

# Счётчик владельцев

`shared_ptr` хранит счётчик владельцев.

Например:

```cpp
auto a =
    std::make_shared<int>(10);
```

Количество владельцев:

```text
1
```

После:

```cpp
auto b = a;
```

становится:

```text
2
```

Можно проверить:

```cpp
std::cout << a.use_count() << '\n';
```

Результат:

```text
2
```

---

# Уничтожение владельца

Рассмотрим:

```cpp
auto a =
    std::make_shared<int>(10);

auto b = a;

b.reset();
```

После `reset()` указатель `b` больше не владеет объектом.

Количество владельцев снова:

```text
1
```

Когда уничтожается последний `shared_ptr`, объект освобождается.

---

# Копирование shared_ptr

В отличие от `unique_ptr`, `shared_ptr` можно копировать:

```cpp
auto a =
    std::make_shared<int>(10);

auto b = a;
auto c = b;
```

Теперь:

```text
a ──┐
b ──┼──► [10]
c ──┘
```

Количество владельцев:

```text
3
```

Это и есть shared ownership — совместное владение.

---

# Когда shared_ptr полезен

`shared_ptr` подходит, когда объект действительно должен иметь несколько владельцев.

Например, несколько компонентов программы могут совместно использовать один объект конфигурации:

```text
Controller ──┐
Logger ──────┼──► Config
Monitor ─────┘
```

Если каждый компонент владеет конфигурацией независимо, можно использовать `shared_ptr`.

Но если существует один естественный владелец, лучше использовать `unique_ptr`.

---

# shared_ptr не означает «просто удобный указатель»

Нельзя считать:

```cpp
std::shared_ptr<T>
```

универсальной заменой:

```cpp
T
```

или:

```cpp
std::unique_ptr<T>
```

`shared_ptr` добавляет механизм подсчёта владельцев и дополнительную инфраструктуру управления временем жизни.

Поэтому его следует использовать только тогда, когда совместное владение действительно является частью архитектуры.

---

# make_shared

Создавать объект рекомендуется через:

```cpp
auto sensor =
    std::make_shared<Sensor>();
```

Например:

```cpp
auto sensor =
    std::make_shared<Sensor>(
        "Temperature",
        24.5
    );
```

Это предпочтительнее ручного:

```cpp
std::shared_ptr<Sensor>(
    new Sensor(...)
);
```

---

# shared_ptr и функции

Если функция должна создать нового владельца:

```cpp
void registerSensor(
    std::shared_ptr<Sensor> sensor
) {
    // функция хранит shared ownership
}
```

Вызов:

```cpp
auto sensor =
    std::make_shared<Sensor>();

registerSensor(sensor);
```

Теперь и вызывающий код, и функция могут владеть объектом.

---

# Если функция только использует объект

Если функция не должна становиться владельцем, не обязательно принимать `shared_ptr`.

Например:

```cpp
void printSensor(
    const Sensor& sensor
) {
    std::cout << sensor.value;
}
```

Вызов:

```cpp
printSensor(*sensor);
```

Это показывает важный принцип:

> способ передачи объекта должен отражать смысл владения.

---

# weak_ptr

Теперь представим, что нужно получить доступ к объекту, которым владеет `shared_ptr`, но не становиться его владельцем.

Для этого используется:

```cpp
std::weak_ptr
```

Например:

```cpp
auto sensor =
    std::make_shared<int>(25);

std::weak_ptr<int> observer = sensor;
```

Схематично:

```text
sensor   ──shared──► [25]
observer ──weak────► [25]
```

`observer` не увеличивает количество владельцев.

---

# use_count и weak_ptr

Рассмотрим:

```cpp
auto sensor =
    std::make_shared<int>(25);

std::weak_ptr<int> observer = sensor;

std::cout << sensor.use_count();
```

Результат:

```text
1
```

Создание `weak_ptr` не превращает его в владельца.

---

# Почему weak_ptr нельзя разыменовать

Нельзя написать:

```cpp
std::cout << *observer;
```

`weak_ptr` не предоставляет прямого доступа к объекту.

Причина проста:

объект мог уже быть уничтожен.

Например:

```cpp
std::weak_ptr<int> observer;

{
    auto value =
        std::make_shared<int>(10);

    observer = value;
}
```

После завершения блока:

```text
value уничтожен
объект уничтожен
observer всё ещё существует
```

Но `observer` больше не может получить объект, потому что владения нет.

---

# lock()

Чтобы безопасно получить доступ к объекту через `weak_ptr`, используется:

```cpp
lock()
```

Например:

```cpp
auto value =
    std::make_shared<int>(10);

std::weak_ptr<int> observer = value;

if (auto locked = observer.lock()) {
    std::cout << *locked << '\n';
}
```

Если объект ещё существует, `lock()` возвращает `shared_ptr`.

Если объект уже уничтожен, возвращается пустой `shared_ptr`.

---

# Проверка expired()

Можно проверить:

```cpp
observer.expired()
```

Если объект уже уничтожен, результат:

```text
true
```

Но на практике чаще удобнее сразу использовать:

```cpp
if (auto locked = observer.lock()) {
    // объект существует
}
```

Так мы одновременно проверяем объект и временно получаем владение на время использования.

---

# Циклические ссылки

Одна из главных причин существования `weak_ptr` — циклы владения.

Рассмотрим:

```cpp
class Node {
public:
    std::shared_ptr<Node> next;
};
```

Можно создать:

```cpp
auto a = std::make_shared<Node>();
auto b = std::make_shared<Node>();

a->next = b;
b->next = a;
```

Получается:

```text
a ──shared──► b
b ──shared──► a
```

Даже когда внешние `shared_ptr` уничтожаются, объекты могут продолжать владеть друг другом.

Счётчики не достигают нуля.

Получается утечка.

---

# Решение через weak_ptr

Вместо:

```cpp
std::shared_ptr<Node> parent;
```

можно использовать:

```cpp
std::weak_ptr<Node> parent;
```

Например:

```cpp
class Node {
public:
    std::shared_ptr<Node> child;
    std::weak_ptr<Node> parent;
};
```

Теперь:

```text
parent
   │
   │ weak
   ▼
child
   │
   │ shared
   ▼
parent
```

Цикла владения больше нет.

---

# Типичная модель parent-child

Это особенно полезно в структурах вроде:

```text
Robot
 ├── Arm
 │    ├── Joint
 │    └── Joint
 └── Camera
```

Родитель может владеть дочерним объектом:

```cpp
std::shared_ptr<Arm> arm;
```

Но дочерний объект не должен обязательно владеть родителем:

```cpp
std::weak_ptr<Robot> robot;
```

Так архитектура не создаёт цикл владения.

---

# shared_ptr и полиморфизм

Как и `unique_ptr`, `shared_ptr` можно использовать для полиморфных объектов.

Например:

```cpp
class Device {
public:
    virtual void start() = 0;
    virtual ~Device() = default;
};
```

Можно создать:

```cpp
std::shared_ptr<Device> device =
    std::make_shared<Motor>();
```

Несколько частей программы могут хранить копию:

```cpp
auto controller = device;
auto monitor = device;
```

Все они владеют одним объектом.

---

# Практический пример

Представим систему мониторинга:

```cpp
#include <iostream>
#include <memory>
#include <string>

class Sensor {
private:
    std::string name;
    double value;

public:
    Sensor(
        std::string name,
        double value
    )
        : name(std::move(name)),
          value(value) {
    }

    void print() const {
        std::cout << name
                  << ": "
                  << value
                  << '\n';
    }
};

void monitor(
    std::shared_ptr<Sensor> sensor
) {
    sensor->print();
}

void logger(
    std::shared_ptr<Sensor> sensor
) {
    sensor->print();
}

int main() {
    auto sensor =
        std::make_shared<Sensor>(
            "Temperature",
            24.5
        );

    monitor(sensor);
    logger(sensor);

    std::cout
        << "Owners: "
        << sensor.use_count()
        << '\n';
}
```

Здесь `monitor` и `logger` временно получают собственные `shared_ptr`.

---

# Но shared_ptr здесь не обязательно нужен

В реальном проекте функции могли бы просто принимать:

```cpp
const Sensor&
```

например:

```cpp
void monitor(const Sensor& sensor);
void logger(const Sensor& sensor);
```

Тогда функции не становятся владельцами объекта.

Это часто является более простой архитектурой.

`shared_ptr` нужен тогда, когда совместное владение действительно необходимо.

---

# Сравнение

Упрощённо:

```text
unique_ptr
    один владелец
    нельзя копировать
    можно перемещать

shared_ptr
    несколько владельцев
    можно копировать
    объект живёт до последнего владельца

weak_ptr
    не владеет
    не увеличивает счётчик
    используется для наблюдения
```

---

# Практическое правило

Начинать проектирование владения удобно так:

```text
Объект обычный?
    ↓
обычный объект

Нужна динамическая память и один владелец?
    ↓
unique_ptr

Нужно настоящее совместное владение?
    ↓
shared_ptr

Нужно наблюдать за shared_ptr без владения?
    ↓
weak_ptr
```

Не стоит начинать с `shared_ptr` только потому, что он удобнее копируется.

Сначала нужно определить модель владения.

---

# Главное

`std::shared_ptr` позволяет нескольким объектам совместно владеть одним ресурсом.

Создание:

```cpp
auto object =
    std::make_shared<Type>();
```

Копирование:

```cpp
auto copy = object;
```

Количество владельцев:

```cpp
object.use_count();
```

Отказ от владения:

```cpp
object.reset();
```

`std::weak_ptr` не владеет объектом:

```cpp
std::weak_ptr<Type> observer = object;
```

Получить временный `shared_ptr`:

```cpp
if (auto locked = observer.lock()) {
    // объект существует
}
```

Главное архитектурное правило:

> используйте `shared_ptr`, когда совместное владение действительно необходимо, а `weak_ptr` — когда нужно наблюдать без владения.

---

# Практика

### Задание 1

Создайте:

```cpp
std::shared_ptr<int>
```

через `std::make_shared`.

Создайте ещё два `shared_ptr` через копирование.

Выведите:

```cpp
use_count()
```

### Задание 2

Удалите одного владельца через:

```cpp
reset()
```

и снова посмотрите на `use_count()`.

### Задание 3

Создайте `shared_ptr` и `weak_ptr`.

Проверьте, что создание `weak_ptr` не изменяет количество владельцев.

### Задание 4

Используйте:

```cpp
weak_ptr.lock()
```

для безопасного доступа к объекту.

Проверьте поведение после уничтожения последнего `shared_ptr`.

### Задание 5

Создайте классы:

```text
Robot
Arm
```

Пусть `Robot` владеет `Arm` через `shared_ptr`, а `Arm` хранит ссылку на своего `Robot` через `weak_ptr`.

Объясните, почему использование `shared_ptr` с обеих сторон может привести к циклическому владению.

### Задание 6

Для каждой ситуации выберите подходящий вариант:

1. Локальный объект датчика.
2. Один объект устройства с единственным владельцем.
3. Объект, которым реально владеют несколько подсистем.
4. Ссылка на родительский объект без владения.

Варианты:

```text
обычный объект
unique_ptr
shared_ptr
weak_ptr
```