---
id: cpp-28
title: Полиморфизм
module_id: cpp
module_title: C++
module_order: 8
order: 28
---

# Полиморфизм

## Цель

Наследование позволяет создавать иерархии классов, но само по себе оно не даёт главной возможности объектно-ориентированного полиморфизма: работать с разными типами объектов через общий интерфейс.

Полиморфизм позволяет написать код, который знает только о базовом типе, но при выполнении вызывает поведение конкретного производного объекта.

Это особенно полезно в больших системах, где появляются десятки типов устройств, компонентов или обработчиков.

После урока вы должны понимать:

* что такое полиморфизм;
* зачем нужен общий интерфейс;
* чем статический выбор метода отличается от динамического;
* как базовый указатель может ссылаться на производный объект;
* зачем нужны виртуальные функции;
* что такое переопределение;
* как полиморфизм применяется в архитектуре программы.

---

## Идея полиморфизма

Само слово означает возможность иметь несколько форм.

Представим базовый класс:

```cpp
class Device
{
public:
    void start()
    {
        std::cout << "Device started\n";
    }
};
```

И производные:

```cpp
class Motor : public Device
{
};

class Camera : public Device
{
};
```

Мы можем работать с обоими объектами как с `Device`:

```cpp
Motor motor;
Camera camera;

Device* first = &motor;
Device* second = &camera;
```

Оба указателя имеют тип:

```cpp
Device*
```

но фактически указывают на разные объекты.

---

## Зачем это нужно

Представим систему управления устройствами:

```text
Device
├── Motor
├── Camera
├── Lidar
├── Sensor
└── Controller
```

Вместо отдельного кода для каждого класса можно написать:

```cpp
void startDevice(Device& device)
{
    // ...
}
```

Функция принимает базовый тип.

Теперь её можно использовать с разными производными объектами.

Это позволяет строить расширяемые системы.

---

## Базовая ссылка на производный объект

Рассмотрим:

```cpp
class Device
{
};

class Motor : public Device
{
};
```

Теперь:

```cpp
Motor motor;

Device& device = motor;
```

`device` — ссылка типа `Device`, но объектом является `Motor`.

Аналогично:

```cpp
Device* device = &motor;
```

Указатель имеет тип `Device*`, но указывает на объект `Motor`.

---

## Проблема обычных методов

Рассмотрим:

```cpp
class Device
{
public:
    void info()
    {
        std::cout << "Device\n";
    }
};

class Motor : public Device
{
public:
    void info()
    {
        std::cout << "Motor\n";
    }
};
```

Теперь:

```cpp
Motor motor;

Device* device = &motor;

device->info();
```

Может оказаться неожиданным, но будет вызван:

```text
Device
```

Почему?

Потому что `info()` не является виртуальной функцией.

Тип указателя:

```cpp
Device*
```

определяет, какой метод вызывается в таком случае.

---

## Виртуальная функция

Чтобы включить динамический полиморфизм, базовый метод объявляют как:

```cpp
virtual
```

Например:

```cpp
class Device
{
public:
    virtual void info()
    {
        std::cout << "Device\n";
    }
};
```

Производный класс:

```cpp
class Motor : public Device
{
public:
    void info() override
    {
        std::cout << "Motor\n";
    }
};
```

Теперь:

```cpp
Motor motor;

Device* device = &motor;

device->info();
```

выведет:

```text
Motor
```

---

## Что произошло

Тип указателя:

```cpp
Device*
```

говорит:

> Я работаю с объектом через интерфейс Device.

Но фактический объект:

```text
Motor
```

Поэтому во время выполнения программа выбирает реализацию:

```text
Motor::info()
```

Это и есть динамический полиморфизм.

---

## override

В производном классе рекомендуется писать:

```cpp
override
```

Например:

```cpp
void info() override
{
}
```

Это сообщает компилятору:

> Я намеренно переопределяю виртуальный метод базового класса.

Если сигнатура окажется неправильной, компилятор сообщит об ошибке.

Без `override` можно случайно написать другой метод вместо переопределения и не заметить проблему.

---

## Пример ошибки без override

Базовый класс:

```cpp
class Device
{
public:
    virtual void start(int speed)
    {
    }
};
```

Производный класс по ошибке:

```cpp
class Motor : public Device
{
public:
    void start(double speed)
    {
    }
};
```

Это уже другая сигнатура.

Если написать:

```cpp
void start(double speed) override
```

компилятор сразу сообщит, что метод ничего не переопределяет.

Поэтому `override` — полезная защита от ошибок.

---

## Полиморфный контейнер

Теперь можно хранить разные устройства через общий тип.

Например:

```cpp
std::vector<Device*> devices;
```

И добавить:

```cpp
Motor motor;
Camera camera;
Sensor sensor;

devices.push_back(&motor);
devices.push_back(&camera);
devices.push_back(&sensor);
```

Затем:

```cpp
for (Device* device : devices)
{
    device->info();
}
```

Каждый объект может выполнить свою реализацию `info()`.

Это одна из ключевых идей объектно-ориентированного проектирования.

---

## Почему нужны указатели или ссылки

Если написать:

```cpp
std::vector<Device> devices;
```

и попытаться поместить туда `Motor`, часть производной информации может быть потеряна из-за slicing — срезки объекта.

Например:

```cpp
Motor motor;

Device device = motor;
```

Теперь `device` — самостоятельный объект `Device`, а не полноценный `Motor`.

Поэтому для полиморфизма обычно используют:

```cpp
Device*
```

или:

```cpp
Device&
```

а в современном управлении владением часто:

```cpp
std::unique_ptr<Device>
```

---

## Полиморфизм без знания конкретного типа

Представим функцию:

```cpp
void start(Device& device)
{
    device.start();
}
```

Она не знает, является ли объект:

```text
Motor
Camera
Lidar
Sensor
```

Но если `start()` виртуальный, будет вызвана правильная реализация.

Получается:

```text
общий интерфейс
      ↓
конкретный объект
      ↓
конкретное поведение
```

---

## Практический пример

Создадим несколько устройств:

```cpp
#include <iostream>
#include <vector>

class Device
{
public:
    virtual void start()
    {
        std::cout << "Generic device\n";
    }

    virtual ~Device() = default;
};

class Motor : public Device
{
public:
    void start() override
    {
        std::cout << "Motor starts rotating\n";
    }
};

class Camera : public Device
{
public:
    void start() override
    {
        std::cout << "Camera starts recording\n";
    }
};

class Lidar : public Device
{
public:
    void start() override
    {
        std::cout << "Lidar starts scanning\n";
    }
};
```

Теперь:

```cpp
int main()
{
    Motor motor;
    Camera camera;
    Lidar lidar;

    std::vector<Device*> devices;

    devices.push_back(&motor);
    devices.push_back(&camera);
    devices.push_back(&lidar);

    for (Device* device : devices)
    {
        device->start();
    }

    return 0;
}
```

Результат:

```text
Motor starts rotating
Camera starts recording
Lidar starts scanning
```

Один цикл работает с разными типами объектов.

---

## Почему это важно для архитектуры

Представим приложение робота, в котором есть обработчики:

```text
CameraProcessor
LidarProcessor
MotorController
SensorProcessor
```

Вместо огромного количества `if` можно построить общий интерфейс:

```cpp
class Processor
{
public:
    virtual void process() = 0;
};
```

А затем:

```cpp
class CameraProcessor : public Processor
{
    // ...
};

class LidarProcessor : public Processor
{
    // ...
};
```

Основная программа работает с:

```cpp
Processor*
```

и не обязана знать все конкретные реализации.

Это позволяет добавлять новые компоненты с меньшими изменениями в основном коде.

---

## Статический и динамический полиморфизм

В C++ существует несколько форм полиморфизма.

Динамический полиморфизм связан с:

```cpp
virtual
```

и выбором реализации во время выполнения.

Статический полиморфизм может реализовываться через:

* перегрузку функций;
* шаблоны;
* `constexpr` и другие механизмы языка.

В этом разделе нас интересует прежде всего динамический полиморфизм через наследование и виртуальные функции.

---

## Виртуальный деструктор

Если базовый класс используется полиморфно, его деструктор обычно должен быть виртуальным:

```cpp
class Device
{
public:
    virtual ~Device() = default;
};
```

Это особенно важно, когда производный объект удаляется через указатель на базовый класс.

Например:

```cpp
Device* device = new Motor;

delete device;
```

При виртуальном деструкторе корректно вызывается деструктор производного класса, а затем базового.

---

## Главное

Полиморфизм позволяет работать с разными типами объектов через общий интерфейс.

Ключевая конструкция:

```cpp
class Device
{
public:
    virtual void start();
};
```

А в производном классе:

```cpp
void start() override;
```

Теперь указатель:

```cpp
Device* device
```

может указывать на разные производные объекты, а вызов:

```cpp
device->start();
```

будет выбирать соответствующую реализацию во время выполнения.

Для полиморфных базовых классов обычно также нужен:

```cpp
virtual ~Device() = default;
```

---

## Практика

### Задание 1

Создайте базовый класс:

```cpp
Device
```

с виртуальным методом:

```cpp
start()
```

Создайте производные классы `Motor`, `Camera` и `Sensor`.

### Задание 2

Создайте:

```cpp
std::vector<Device*>
```

и поместите туда объекты разных типов.

### Задание 3

Обойдите контейнер и вызовите:

```cpp
start()
```

для каждого объекта.

### Задание 4

Удалите `virtual` у базового метода и сравните результат.

### Задание 5

Добавьте виртуальный деструктор и выведите сообщение из деструкторов базового и производного классов. Посмотрите порядок их вызова.