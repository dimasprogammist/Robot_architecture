
---
id: cpp-80
title: Финальный проект на C++
module_id: cpp
module_title: C++
module_order: 8
order: 80
---

# Финальный проект на C++

## Цель

За предыдущие уроки мы постепенно прошли путь от простых переменных до классов, STL, файлов, многопоточности и взаимодействия с внешними системами.

Теперь соберём эти знания в одном проекте.

Проект будет представлять собой консольную систему мониторинга устройств.

Она не является полноценной промышленной системой, но архитектурно будет похожа на реальные приложения автоматизации.

---

## Идея проекта

Создадим программу:

```text
Device Monitor
```

Она должна уметь:

* хранить список устройств;
* загружать конфигурацию;
* сохранять данные;
* запускать мониторинг;
* получать измерения;
* определять ошибки;
* показывать состояние устройств;
* вести журнал;
* работать с несколькими потоками.

Архитектура:

```text
                 Device Monitor
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   Configuration    Devices        Monitoring
        │              │              │
        ↓              ↓              ↓
     config       DeviceManager     Threads
                                       │
                         ┌─────────────┼─────────────┐
                         ↓             ↓             ↓
                      Sensors       Checker        Logger
```

---

## Структура проекта

Для начала создадим:

```text
device-monitor/
├── CMakeLists.txt
├── include/
│   ├── Device.h
│   ├── DeviceManager.h
│   ├── Config.h
│   ├── Monitor.h
│   └── Logger.h
├── src/
│   ├── Device.cpp
│   ├── DeviceManager.cpp
│   ├── Config.cpp
│   ├── Monitor.cpp
│   ├── Logger.cpp
│   └── main.cpp
├── config/
│   └── devices.txt
├── logs/
└── tests/
```

Такой проект уже заметно отличается от программы из одного файла.

---

## Класс устройства

Начнём с устройства.

```cpp
#pragma once

#include <string>

class Device
{
public:
    Device(
        int id,
        std::string name
    );

    int id() const;

    const std::string& name() const;

    double value() const;

    bool online() const;

    void setValue(double value);

    void setOnline(bool online);

private:
    int id_;
    std::string name_;
    double value_ = 0.0;
    bool online_ = false;
};
```

Реализация:

```cpp
#include "Device.h"

Device::Device(
    int id,
    std::string name
)
    : id_(id),
      name_(std::move(name))
{
}

int Device::id() const
{
    return id_;
}

const std::string& Device::name() const
{
    return name_;
}

double Device::value() const
{
    return value_;
}

bool Device::online() const
{
    return online_;
}

void Device::setValue(double value)
{
    value_ = value;
}

void Device::setOnline(bool online)
{
    online_ = online;
}
```

Здесь используются:

* класс;
* конструктор;
* `std::string`;
* `const`;
* `std::move`;
* инкапсуляция.

---

## Менеджер устройств

Теперь нужен объект, который хранит устройства.

```cpp
#pragma once

#include "Device.h"

#include <memory>
#include <vector>

class DeviceManager
{
public:
    void add(std::unique_ptr<Device> device);

    Device* find(int id);

    const std::vector<std::unique_ptr<Device>>& devices() const;

private:
    std::vector<std::unique_ptr<Device>> devices_;
};
```

Реализация:

```cpp
#include "DeviceManager.h"

void DeviceManager::add(
    std::unique_ptr<Device> device
)
{
    devices_.push_back(std::move(device));
}

Device* DeviceManager::find(int id)
{
    for (auto& device : devices_)
    {
        if (device->id() == id)
        {
            return device.get();
        }
    }

    return nullptr;
}

const std::vector<std::unique_ptr<Device>>&
DeviceManager::devices() const
{
    return devices_;
}
```

Здесь мы используем `std::unique_ptr`, потому что менеджер владеет устройствами.

---

## Монитор

Создадим отдельный класс:

```cpp
class Monitor
{
public:
    void start();

    void stop();

private:
    void monitoringLoop();

    std::atomic<bool> running_{false};
    std::thread thread_;
};
```

Запуск:

```cpp
void Monitor::start()
{
    if (running_)
    {
        return;
    }

    running_ = true;

    thread_ = std::thread(
        &Monitor::monitoringLoop,
        this
    );
}
```

Остановка:

```cpp
void Monitor::stop()
{
    running_ = false;

    if (thread_.joinable())
    {
        thread_.join();
    }
}
```

---

## Цикл мониторинга

Внутри:

```cpp
void Monitor::monitoringLoop()
{
    while (running_)
    {
        // Получение данных

        // Проверка состояния

        // Формирование событий

        std::this_thread::sleep_for(
            std::chrono::seconds(1)
        );
    }
}
```

Главное здесь — монитор не должен знать все детали устройства.

Он должен работать через понятный интерфейс.

---

## Конфигурация

Пусть конфигурация хранится в простом текстовом файле:

```text
device=1;name=Temperature
device=2;name=Pressure
device=3;name=Level
```

Программа читает файл и создаёт объекты:

```cpp
auto device =
    std::make_unique<Device>(
        1,
        "Temperature"
    );

manager.add(std::move(device));
```

В реальном проекте конфигурация может находиться в:

* JSON;
* YAML;
* базе данных;
* переменных окружения;
* параметрах командной строки.

---

## Командное меню

Пользователь должен иметь возможность выполнять команды:

```text
1. Список устройств
2. Состояние
3. Запустить мониторинг
4. Остановить мониторинг
5. Показать журнал
0. Выход
```

Основной цикл:

```cpp
while (true)
{
    printMenu();

    int command;
    std::cin >> command;

    switch (command)
    {
        case 1:
            showDevices();
            break;

        case 2:
            showStatus();
            break;

        case 3:
            monitor.start();
            break;

        case 4:
            monitor.stop();
            break;

        case 0:
            monitor.stop();
            return 0;
    }
}
```

---

## Обработка ошибок

Пользователь может ввести неправильную команду.

Нельзя предполагать, что ввод всегда корректен.

Например:

```cpp
if (command < 0 || command > 4)
{
    std::cout << "Неизвестная команда\n";
}
```

Для внутренних ошибок можно использовать исключения:

```cpp
throw std::runtime_error(
    "Не удалось открыть конфигурацию"
);
```

А на верхнем уровне:

```cpp
try
{
    runApplication();
}
catch (const std::exception& error)
{
    std::cerr
        << "Ошибка: "
        << error.what()
        << '\n';

    return 1;
}
```

---

## Логирование

Логгер может записывать:

```text
2026-10-02 10:00:01 INFO  Application started
2026-10-02 10:00:02 INFO  Device 1 connected
2026-10-02 10:00:05 WARN  Device 2 high value
2026-10-02 10:00:10 ERROR Device 3 disconnected
```

Важно разделять:

```text
INFO
WARNING
ERROR
```

Это позволяет потом анализировать работу программы.

---

## Потоки

В финальном проекте можно использовать несколько потоков:

```text
Main thread
    │
    ├── Monitor thread
    │
    ├── Logger thread
    │
    └── Communication thread
```

При этом общие данные должны защищаться.

Например:

```cpp
std::mutex mutex;
```

и:

```cpp
{
    std::lock_guard<std::mutex> lock(mutex);

    device.setValue(value);
}
```

---

## CMake

Минимальный `CMakeLists.txt`:

```cmake
cmake_minimum_required(VERSION 3.20)

project(device_monitor)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(
    device_monitor

    src/main.cpp
    src/Device.cpp
    src/DeviceManager.cpp
    src/Config.cpp
    src/Monitor.cpp
    src/Logger.cpp
)

target_include_directories(
    device_monitor
    PRIVATE
    include
)
```

Сборка:

```bash
cmake -S . -B build
cmake --build build
```

---

## Что должно получиться

После запуска:

```text
=== Device Monitor ===

1. Список устройств
2. Состояние
3. Запустить мониторинг
4. Остановить мониторинг
5. Журнал
0. Выход

Команда:
```

После запуска мониторинга:

```text
[MONITOR] started

Temperature: 42.5 C   ONLINE
Pressure:    4.2 bar  ONLINE
Level:       73 %     ONLINE
```

При ошибке:

```text
[WARNING] Temperature limit exceeded
```

---

## Что проверяет этот проект

Финальный проект должен показать, что вы умеете использовать вместе:

```text
Переменные
    ↓
Функции
    ↓
Классы
    ↓
STL
    ↓
Файлы
    ↓
Указатели
    ↓
Умные указатели
    ↓
Исключения
    ↓
CMake
    ↓
Потоки
    ↓
Синхронизация
    ↓
Архитектура
```

Но главная цель проекта не в количестве использованных возможностей C++.

Главная цель — научиться строить программу из отдельных компонентов.

---

## Этапы выполнения

Не пытайтесь сразу написать всё.

Разделите работу:

### Этап 1

Создайте `Device`.

Проверьте:

```text
id
name
value
online
```

### Этап 2

Создайте `DeviceManager`.

Добавьте:

```text
add()
find()
remove()
```

### Этап 3

Добавьте конфигурационный файл.

### Этап 4

Добавьте консольное меню.

### Этап 5

Добавьте монитор.

### Этап 6

Добавьте многопоточность.

### Этап 7

Добавьте логирование.

### Этап 8

Добавьте обработку ошибок.

### Этап 9

Добавьте тесты.

### Этап 10

Соберите проект через CMake.

---

## Главное

После прохождения этого курса вы должны воспринимать C++ не как набор отдельных конструкций:

```cpp
class
vector
thread
mutex
unique_ptr
```

а как инструмент построения программ.

В реальном проекте важнее ответить на вопросы:

* какие компоненты нужны;
* кто отвечает за каждый компонент;
* кто владеет объектами;
* как передаются данные;
* как обрабатываются ошибки;
* как компоненты взаимодействуют;
* как программа будет тестироваться и развиваться.

Именно архитектура постепенно становится главным навыком при работе с C++.