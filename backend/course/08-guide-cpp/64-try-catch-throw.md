---
id: cpp-64
title: try, catch, throw
module_id: cpp
module_title: C++
module_order: 8
order: 64
---

# `try`, `catch`, `throw`

## Цель

В прошлом уроке мы разобрали идею исключений. Теперь рассмотрим механизм подробнее и научимся управлять потоком выполнения программы при возникновении ошибки.

После урока вы должны понимать:

* как устроен `try`;
* как работает `catch`;
* как выбрасывать исключения через `throw`;
* как использовать несколько обработчиков;
* почему порядок `catch` имеет значение;
* как использовать `std::exception`;
* что такое повторный `throw`;
* как создавать собственные исключения;
* какие ошибки часто совершают при обработке исключений.

---

## Базовая конструкция

Минимальная конструкция выглядит так:

```cpp
try {
    // Код, который может выбросить исключение.
}
catch (...) {
    // Обработка исключения.
}
```

Например:

```cpp
#include <iostream>
#include <stdexcept>

int main() {
    try {
        throw std::runtime_error("Something went wrong");
    }
    catch (const std::exception& error) {
        std::cout << error.what() << '\n';
    }
}
```

Порядок выполнения:

```text
try
 ↓
throw
 ↓
поиск catch
 ↓
catch
 ↓
продолжение программы
```

---

## `throw`

Инструкция:

```cpp
throw expression;
```

выбрасывает объект.

Например:

```cpp
throw std::runtime_error("Connection failed");
```

Можно выбросить и другой тип:

```cpp
throw 42;
```

или:

```cpp
throw std::string("Error");
```

Но для нормального прикладного C++ кода предпочтительно использовать типы исключений, происходящие от `std::exception`.

Например:

```cpp
throw std::runtime_error("Connection failed");
```

---

## Обработка конкретного типа

Можно перехватить конкретный тип:

```cpp
try {
    throw std::out_of_range("Invalid index");
}
catch (const std::out_of_range& error) {
    std::cout << error.what() << '\n';
}
```

Это удобно, когда разные ошибки требуют разных действий.

---

## Несколько `catch`

Можно написать несколько обработчиков:

```cpp
try {
    run();
}
catch (const std::out_of_range& error) {
    std::cout << "Range error: "
              << error.what()
              << '\n';
}
catch (const std::invalid_argument& error) {
    std::cout << "Argument error: "
              << error.what()
              << '\n';
}
catch (const std::exception& error) {
    std::cout << "General error: "
              << error.what()
              << '\n';
}
```

Первый подходящий обработчик будет выбран.

---

## Порядок обработчиков

Порядок `catch` имеет значение.

Например:

```cpp
catch (const std::exception& error) {
    // ...
}
catch (const std::runtime_error& error) {
    // ...
}
```

Это проблема, потому что `runtime_error` является наследником `std::exception`.

Первый обработчик уже подходит для `runtime_error`.

Поэтому более конкретные типы нужно размещать раньше:

```cpp
catch (const std::runtime_error& error) {
    // ...
}
catch (const std::exception& error) {
    // ...
}
```

---

## `std::exception`

Большинство стандартных исключений можно обработать через:

```cpp
const std::exception& error
```

Например:

```cpp
try {
    readConfig();
}
catch (const std::exception& error) {
    std::cout << "Error: "
              << error.what()
              << '\n';
}
```

Метод:

```cpp
error.what()
```

возвращает текстовое описание ошибки.

---

## `catch (...)`

Существует универсальный обработчик:

```cpp
catch (...) {
}
```

Он перехватывает исключение независимо от его типа.

Например:

```cpp
try {
    run();
}
catch (...) {
    std::cout << "Unknown error\n";
}
```

Такой обработчик иногда нужен на самом верхнем уровне приложения.

Но использовать его бездумно не стоит.

Если исключение имеет полезную информацию, лучше обработать:

```cpp
catch (const std::exception& error)
```

---

## Повторный `throw`

Иногда функция должна выполнить часть обработки, но не должна полностью поглощать ошибку.

Для этого используется:

```cpp
throw;
```

Например:

```cpp
void process() {
    try {
        connect();
    }
    catch (const std::exception& error) {
        std::cout << "Logging error: "
                  << error.what()
                  << '\n';

        throw;
    }
}
```

Здесь исключение сначала записывается в лог, а затем продолжает распространяться вверх.

Это называется **rethrow**.

---

## Почему `throw;` отличается от `throw error;`

Есть важная разница между:

```cpp
throw;
```

и:

```cpp
throw error;
```

Внутри `catch`:

```cpp
throw;
```

повторно выбрасывает текущее исключение, сохраняя его исходный тип.

А:

```cpp
throw error;
```

создаёт новый выброс на основе переменной и может изменить поведение полиморфизма.

Поэтому для повторной передачи текущего исключения обычно используют:

```cpp
throw;
```

---

## Практический пример с конфигурацией

Представим:

```cpp
#include <stdexcept>
#include <string>

int loadPort(const std::string& text) {
    int port = std::stoi(text);

    if (port <= 0 || port > 65535) {
        throw std::out_of_range("Invalid port");
    }

    return port;
}
```

Верхний уровень:

```cpp
#include <iostream>

int main() {
    try {
        int port = loadPort("99999");

        std::cout << "Port: "
                  << port
                  << '\n';
    }
    catch (const std::out_of_range& error) {
        std::cout << "Configuration error: "
                  << error.what()
                  << '\n';
    }
}
```

Функция отвечает за проверку данных.

`main()` отвечает за решение, что делать при ошибке.

---

## Собственное исключение

Можно определить собственный класс:

```cpp
#include <stdexcept>

class SensorError : public std::runtime_error {
public:
    using std::runtime_error::runtime_error;
};
```

Теперь:

```cpp
throw SensorError("Temperature sensor is unavailable");
```

И обработка:

```cpp
catch (const SensorError& error) {
    std::cout << "Sensor error: "
              << error.what()
              << '\n';
}
```

Это полезно, когда приложению важно различать категории ошибок.

---

## Ошибки устройства

Представим программу автоматизации:

```cpp
class Device {
public:
    void connect() {
        if (!available()) {
            throw std::runtime_error("Device unavailable");
        }
    }

private:
    bool available() const {
        return false;
    }
};
```

Использование:

```cpp
try {
    Device device;

    device.connect();

    std::cout << "Connected\n";
}
catch (const std::exception& error) {
    std::cout << "Connection failed: "
              << error.what()
              << '\n';
}
```

Основной код не должен постоянно проверять каждую внутреннюю причину сбоя.

Низкоуровневая функция сообщает о невозможности операции, а более высокий уровень принимает решение.

---

## Исключение в глубине программы

Рассмотрим:

```cpp
void readSensor() {
    throw std::runtime_error("Sensor timeout");
}

void controller() {
    readSensor();
}

int main() {
    try {
        controller();
    }
    catch (const std::exception& error) {
        std::cout << "Controller error: "
                  << error.what()
                  << '\n';
    }
}
```

`readSensor()` не обрабатывает ошибку.

`controller()` тоже не обрабатывает её.

Она доходит до `main()`.

Это нормальная модель:

```text
низкий уровень
    ↓
обнаружил проблему
    ↓
throw
    ↓
высокий уровень
    ↓
решил, что делать
```

---

## Исключения и ресурсы

Если функция использует RAII:

```cpp
void process() {
    std::vector<int> values(1000);

    doWork();

    // ...
}
```

и `doWork()` выбросит исключение, объект `values` будет уничтожен автоматически.

Это одна из причин, почему контейнеры, умные указатели и другие RAII-типы предпочтительнее ручного управления ресурсами.

---

## `noexcept`

Иногда функция объявляется как:

```cpp
void stop() noexcept {
    // ...
}
```

Это означает, что функция не должна выбрасывать исключения наружу.

Если исключение всё же выйдет из такой функции, программа будет завершена через `std::terminate`.

Поэтому `noexcept` нельзя добавлять просто ради красоты.

Он должен соответствовать реальному контракту функции.

---

## Когда не нужно ловить исключение

Иногда лучше вообще не перехватывать исключение на текущем уровне.

Например:

```cpp
void startController() {
    connect();
    initialize();
    calibrate();
}
```

Если `connect()` выбросит исключение, `startController()` может не знать, как его обрабатывать.

Тогда логично дать исключению подняться выше:

```cpp
int main() {
    try {
        startController();
    }
    catch (const std::exception& error) {
        // Здесь уже есть контекст приложения.
    }
}
```

Не нужно помещать `try/catch` вокруг каждой строки.

---

## Плохой обработчик

Плохой пример:

```cpp
try {
    connect();
}
catch (...) {
}
```

Ошибка исчезает.

Программа не знает, что произошло.

Лучше:

```cpp
catch (const std::exception& error) {
    std::cout << "Connection error: "
              << error.what()
              << '\n';
}
```

Или передать исключение дальше:

```cpp
catch (...) {
    throw;
}
```

если текущий уровень не отвечает за окончательную обработку.

---

## Исключения и обычная логика

Не стоит использовать исключения как обычный механизм управления циклом.

Плохо:

```cpp
try {
    // Проверяем каждое значение через throw.
}
catch (...) {
    // Переходим к следующему значению.
}
```

Если ситуация является нормальной частью алгоритма, лучше использовать обычную логику:

```cpp
if (value.empty()) {
    continue;
}
```

Исключения предназначены для ситуаций, когда нормальный путь выполнения нарушен.

---

## Практический пример

Создадим небольшую модель контроллера:

```cpp
#include <iostream>
#include <stdexcept>
#include <string>

class Controller {
public:
    void connect(const std::string& address) {
        if (address.empty()) {
            throw std::invalid_argument("Address is empty");
        }

        if (address == "offline") {
            throw std::runtime_error("Controller is offline");
        }

        std::cout << "Connected to "
                  << address
                  << '\n';
    }
};

int main() {
    Controller controller;

    try {
        controller.connect("offline");
    }
    catch (const std::invalid_argument& error) {
        std::cout << "Input error: "
                  << error.what()
                  << '\n';
    }
    catch (const std::runtime_error& error) {
        std::cout << "Runtime error: "
                  << error.what()
                  << '\n';
    }
    catch (const std::exception& error) {
        std::cout << "Unknown standard error: "
                  << error.what()
                  << '\n';
    }
}
```

Здесь разные классы ошибок имеют разные обработчики.

---

## Главное

Основная конструкция исключений:

```cpp
try {
    // Опасная операция.
}
catch (const std::exception& error) {
    // Обработка.
}
```

Выбрасывание:

```cpp
throw std::runtime_error("Error");
```

Повторная передача текущего исключения:

```cpp
throw;
```

Для стандартных исключений предпочтительно использовать:

```cpp
catch (const std::exception& error)
```

или более конкретный тип.

Обработчики должны идти от более конкретных типов к более общим.

И самое главное: не нужно ловить исключение там, где вы не знаете, что с ним делать.

---

## Практика

### Задание 1

Создайте функцию:

```cpp
int parseMotorId(const std::string& text);
```

Она должна выбрасывать исключение, если номер двигателя некорректен.

### Задание 2

Напишите три обработчика:

```cpp
std::invalid_argument
std::out_of_range
std::exception
```

Проверьте, какой обработчик срабатывает для разных ошибок.

### Задание 3

Создайте функцию:

```cpp
void connect();
```

Пусть она выбрасывает `std::runtime_error`.

Обработайте исключение в `main()`.

### Задание 4

Добавьте промежуточную функцию:

```cpp
void startController();
```

Она должна записать сообщение об ошибке и выполнить:

```cpp
throw;
```

После этого обработайте исключение в `main()`.

### Задание 5

Создайте собственный класс:

```cpp
class MotorError;
```

Используйте его для ошибок двигателя и обработайте отдельно от остальных исключений.