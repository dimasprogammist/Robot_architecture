---
id: cpp-30
title: Абстрактные классы и интерфейсы
module_id: cpp
module_title: C++
module_order: 8
order: 30
---

# Абстрактные классы и интерфейсы

## Цель

В предыдущих уроках мы разобрали наследование, полиморфизм и виртуальные функции. Теперь соберём эти механизмы вместе и рассмотрим абстрактные классы.

Абстрактный класс нужен тогда, когда мы хотим определить общий интерфейс для группы объектов, но не хотим создавать экземпляры самого базового класса.

Это особенно полезно в архитектуре больших приложений. Например, программа может работать с абстрактным `Device`, а конкретными реализациями будут `Motor`, `Camera`, `Lidar` и другие компоненты.

После урока вы должны понимать:

* что такое абстрактный класс;
* что такое чисто виртуальная функция;
* почему нельзя создать объект абстрактного класса;
* что такое интерфейс в контексте C++;
* чем абстрактный класс отличается от обычного класса;
* как строить иерархию через общий контракт;
* как использовать абстрактные классы в архитектуре программы.

---

## Что такое абстрактный класс

Рассмотрим:

```cpp
class Device
{
public:
    virtual void start() = 0;
};
```

Здесь:

```cpp
virtual void start() = 0;
```

является чисто виртуальной функцией.

Из-за неё `Device` становится абстрактным классом.

Нельзя написать:

```cpp
Device device;
```

Потому что у `Device` нет полной реализации необходимого поведения.

---

## Зачем нужен абстрактный класс

Представим разные устройства:

```text
Motor
Camera
Lidar
TemperatureSensor
```

У каждого есть операция:

```text
start
```

Но смысл этой операции разный.

Для двигателя:

```text
начать вращение
```

Для камеры:

```text
начать захват изображения
```

Для лидара:

```text
начать сканирование
```

Можно описать общий контракт:

```cpp
class Device
{
public:
    virtual void start() = 0;
};
```

А конкретные классы сами определяют реализацию.

---

## Реализация чисто виртуального метода

Производный класс должен реализовать метод:

```cpp
class Motor : public Device
{
public:
    void start() override
    {
        std::cout << "Motor started\n";
    }
};
```

Теперь `Motor` уже является конкретным классом.

Можно создать:

```cpp
Motor motor;
```

Но:

```cpp
Device device;
```

по-прежнему нельзя.

---

## Интерфейс как контракт

Абстрактный класс можно использовать как контракт:

```cpp
class Device
{
public:
    virtual void start() = 0;
    virtual void stop() = 0;

    virtual ~Device() = default;
};
```

Теперь любой конкретный `Device` должен реализовать:

```cpp
start()
stop()
```

Например:

```cpp
class Motor : public Device
{
public:
    void start() override
    {
        std::cout << "Motor start\n";
    }

    void stop() override
    {
        std::cout << "Motor stop\n";
    }
};
```

Базовый класс задаёт структуру поведения, а производный реализует её.

---

## Почему это удобно

Основная программа может работать с:

```cpp
Device&
```

и не знать, что конкретно передано.

Например:

```cpp
void runDevice(Device& device)
{
    device.start();
    device.stop();
}
```

Теперь можно передать:

```cpp
Motor motor;
Camera camera;

runDevice(motor);
runDevice(camera);
```

Функция не должна знать внутреннее устройство `Motor` или `Camera`.

Она знает только контракт:

```text
Device должен уметь start()
Device должен уметь stop()
```

---

## Несколько чисто виртуальных функций

Абстрактный класс может содержать несколько чисто виртуальных функций:

```cpp
class Device
{
public:
    virtual void connect() = 0;
    virtual void start() = 0;
    virtual void stop() = 0;
    virtual void disconnect() = 0;

    virtual ~Device() = default;
};
```

Производный класс должен реализовать их все:

```cpp
class Camera : public Device
{
public:
    void connect() override
    {
        std::cout << "Camera connected\n";
    }

    void start() override
    {
        std::cout << "Camera started\n";
    }

    void stop() override
    {
        std::cout << "Camera stopped\n";
    }

    void disconnect() override
    {
        std::cout << "Camera disconnected\n";
    }
};
```

Если хотя бы одна чисто виртуальная функция не реализована, производный класс тоже останется абстрактным.

---

## Абстрактный класс может иметь обычные методы

Абстрактный класс не обязан состоять только из чисто виртуальных функций.

Например:

```cpp
class Device
{
public:
    virtual void start() = 0;

    void logConnection()
    {
        std::cout << "Connection event\n";
    }

    virtual ~Device() = default;
};
```

Производный класс получает готовый метод:

```cpp
class Motor : public Device
{
public:
    void start() override
    {
        std::cout << "Motor started\n";
    }
};
```

Теперь:

```cpp
Motor motor;

motor.start();
motor.logConnection();
```

работает.

---

## Абстрактный класс может иметь поля

Например:

```cpp
class Device
{
protected:
    std::string name;

public:
    Device(const std::string& name)
        : name(name)
    {
    }

    virtual void start() = 0;

    virtual ~Device() = default;
};
```

Производные классы могут использовать общие данные:

```cpp
class Motor : public Device
{
public:
    Motor(const std::string& name)
        : Device(name)
    {
    }

    void start() override
    {
        std::cout << name << " started\n";
    }
};
```

Получается общая база для всех устройств.

---

## Абстрактный класс и наследование

Иерархию можно представить:

```text
             Device
               │
       ┌───────┼────────┐
       ↓       ↓        ↓
     Motor   Camera    Lidar
```

`Device` задаёт общий контракт.

`Motor`, `Camera` и `Lidar` являются конкретными реализациями.

Основной код может работать с верхним уровнем:

```cpp
Device*
```

или:

```cpp
Device&
```

и использовать полиморфизм.

---

## Интерфейсный класс

В C++ нет отдельного ключевого слова `interface`, как в некоторых других языках.

Обычно интерфейс моделируют абстрактным классом, содержащим чисто виртуальные методы.

Например:

```cpp
class ILogger
{
public:
    virtual void log(const std::string& message) = 0;

    virtual ~ILogger() = default;
};
```

Теперь можно создать разные реализации:

```cpp
class ConsoleLogger : public ILogger
{
public:
    void log(const std::string& message) override
    {
        std::cout << message << '\n';
    }
};
```

И:

```cpp
class FileLogger : public ILogger
{
public:
    void log(const std::string& message) override
    {
        // запись в файл
    }
};
```

Основная программа зависит от `ILogger`, а не от конкретного способа логирования.

---

## Почему интерфейсы полезны в архитектуре

Представим программу робота.

У нас может быть:

```text
Camera
Lidar
Motor
Database
Logger
Network
```

Если каждый компонент напрямую зависит от конкретной реализации другого компонента, программа становится связанной.

Например:

```text
RobotController → ConsoleLogger
```

Тогда заменить консольный логгер на файловый или сетевой становится сложнее.

Если использовать интерфейс:

```text
RobotController → ILogger
```

можно подключить:

```text
ConsoleLogger
FileLogger
NetworkLogger
```

без изменения основной логики контроллера.

---

## Зависимость от абстракции

Хорошая архитектура часто стремится к тому, чтобы высокоуровневый код зависел от абстракций.

Например:

```cpp
class RobotController
{
private:
    ILogger& logger;

public:
    RobotController(ILogger& logger)
        : logger(logger)
    {
    }

    void run()
    {
        logger.log("Robot started");
    }
};
```

Теперь `RobotController` не знает, куда именно записывается сообщение.

Можно использовать:

```cpp
ConsoleLogger logger;

RobotController controller(logger);
```

или другую реализацию `ILogger`.

---

## Абстрактный класс и конкретный класс

Полезно различать два понятия.

Абстрактный класс:

```cpp
class Device
{
public:
    virtual void start() = 0;
};
```

задаёт общую модель.

Конкретный класс:

```cpp
class Motor : public Device
{
public:
    void start() override
    {
        // конкретная реализация
    }
};
```

можно непосредственно создавать.

Получается:

```text
Device
абстракция
   ↓
Motor
конкретная реализация
```

---

## Нельзя создать абстрактный класс

Следующий код ошибочен:

```cpp
Device device;
```

Но можно:

```cpp
Motor motor;
Device& device = motor;
```

И:

```cpp
Device* device = &motor;
```

Это один из главных принципов использования абстрактных классов:

> объектом является конкретный производный класс, а работать с ним можно через абстрактный интерфейс.

---

## Вектор абстрактных объектов

Нельзя написать:

```cpp
std::vector<Device> devices;
```

для хранения экземпляров `Device`, потому что `Device` абстрактный.

Вместо этого обычно используют указатели или умные указатели:

```cpp
std::vector<std::unique_ptr<Device>> devices;
```

Например:

```cpp
devices.push_back(std::make_unique<Motor>());
devices.push_back(std::make_unique<Camera>());
devices.push_back(std::make_unique<Lidar>());
```

Теперь контейнер владеет объектами и автоматически управляет их временем жизни.

Это сочетает:

```text
полиморфизм
+
RAII
```

---

## Практический пример

Создадим интерфейс устройства:

```cpp
#include <iostream>
#include <memory>
#include <vector>

class Device
{
public:
    virtual void start() = 0;
    virtual void stop() = 0;

    virtual ~Device() = default;
};

class Motor : public Device
{
public:
    void start() override
    {
        std::cout << "Motor started\n";
    }

    void stop() override
    {
        std::cout << "Motor stopped\n";
    }
};

class Camera : public Device
{
public:
    void start() override
    {
        std::cout << "Camera started\n";
    }

    void stop() override
    {
        std::cout << "Camera stopped\n";
    }
};

class Lidar : public Device
{
public:
    void start() override
    {
        std::cout << "Lidar started\n";
    }

    void stop() override
    {
        std::cout << "Lidar stopped\n";
    }
};

int main()
{
    std::vector<std::unique_ptr<Device>> devices;

    devices.push_back(std::make_unique<Motor>());
    devices.push_back(std::make_unique<Camera>());
    devices.push_back(std::make_unique<Lidar>());

    for (auto& device : devices)
    {
        device->start();
    }

    for (auto& device : devices)
    {
        device->stop();
    }

    return 0;
}
```

В этом примере используется сразу несколько важных концепций:

```text
абстрактный класс
        ↓
чисто виртуальные функции
        ↓
наследование
        ↓
полиморфизм
        ↓
unique_ptr
        ↓
автоматическое управление памятью
```

---

## Абстрактный класс — не обязательно интерфейс

В C++ полезно различать понятия.

**Абстрактный класс** может содержать:

* поля;
* обычные методы;
* виртуальные методы;
* чисто виртуальные методы;
* конструкторы;
* деструктор.

А класс, используемый как чистый интерфейс, обычно содержит преимущественно чисто виртуальные методы и виртуальный деструктор.

Поэтому эти понятия близки, но не полностью идентичны.

---

## Когда использовать абстракцию

Абстрактный класс полезен, когда:

* существует несколько реализаций одного поведения;
* нужен общий контракт;
* основной код не должен зависеть от конкретного класса;
* планируется расширение системы;
* нужно заменить реализацию без изменения потребителя.

Например:

```text
ITransport
├── TcpTransport
├── SerialTransport
└── ModbusTransport
```

Основная программа работает с:

```cpp
ITransport&
```

и не обязана знать детали каждого транспорта.

---

## Когда наследование может быть лишним

Не каждую связь между объектами нужно моделировать наследованием.

Если объект содержит другой объект:

```text
Robot
 ├── Motor
 ├── Camera
 └── Lidar
```

это часто композиция.

Если объект является разновидностью другого:

```text
Motor → Device
Camera → Device
Lidar → Device
```

наследование может быть подходящим вариантом.

Хорошее проектирование начинается не с вопроса:

> Какой класс от какого унаследовать?

а с вопроса:

> Какие отношения действительно существуют между объектами?

---

## Главное

Абстрактный класс задаёт общую основу для группы конкретных классов.

Чисто виртуальная функция:

```cpp
virtual void start() = 0;
```

делает класс абстрактным.

Такой класс нельзя создавать напрямую:

```cpp
Device device; // ошибка
```

Но можно работать с конкретным объектом через абстрактный интерфейс:

```cpp
Motor motor;

Device& device = motor;
```

Абстрактные классы особенно полезны для построения расширяемых архитектур, где основной код зависит от интерфейса, а не от конкретной реализации.

В современном C++ абстрактные интерфейсы часто сочетаются с:

```cpp
virtual
override
std::unique_ptr
std::make_unique
RAII
```

---

## Практика

### Задание 1

Создайте абстрактный класс:

```cpp
Shape
```

с чисто виртуальным методом:

```cpp
double area() const = 0;
```

Создайте производные классы `Circle` и `Rectangle`.

### Задание 2

Создайте интерфейс:

```cpp
ILogger
```

с методом:

```cpp
log(const std::string& message)
```

Реализуйте:

```cpp
ConsoleLogger
FileLogger
```

### Задание 3

Создайте абстрактный класс:

```cpp
Device
```

с методами:

```cpp
connect()
start()
stop()
```

Сделайте их чисто виртуальными и реализуйте `Motor` и `Camera`.

### Задание 4

Создайте:

```cpp
std::vector<std::unique_ptr<Device>>
```

и добавьте в него несколько разных устройств.

### Задание 5

Объясните своими словами разницу между:

```text
обычным классом
абстрактным классом
интерфейсом
конкретным классом
```

и приведите пример из робототехники для каждого случая.