---
id: cpp-76
title: Консольный менеджер устройств
module_id: cpp
module_title: C++
module_order: 8
order: 76
---

# Консольный менеджер устройств

## Цель

До этого мы изучали отдельные возможности C++.

Теперь начнём объединять их в небольшие практические проекты.

Первый проект — консольный менеджер устройств.

Программа будет хранить список устройств и предоставлять команды:

```text
list
add
remove
start
stop
status
exit
```

На этом проекте мы потренируем:

* `class`;
* `struct`;
* `std::vector`;
* `std::string`;
* `std::optional`;
* `enum class`;
* функции;
* циклы;
* ввод из консоли;
* поиск элементов;
* обработку ошибок;
* организацию кода.

---

## Что будем создавать

Пусть у нас есть устройства:

```text
Motor 1
Temperature Sensor
Camera
PLC
```

Каждое устройство имеет:

```text
id
name
type
state
```

Например:

```text
1 | Motor | Running
2 | Camera | Stopped
3 | PLC | Running
```

---

## Состояние устройства

Создадим перечисление:

```cpp
enum class DeviceState {
    Stopped,
    Running,
    Error
};
```

Теперь состояние нельзя случайно передать как произвольное число.

---

## Тип устройства

Можно определить:

```cpp
enum class DeviceType {
    Motor,
    Sensor,
    Camera,
    PLC
};
```

Это лучше, чем хранить:

```cpp
"motor"
"sensor"
"camera"
```

во всех местах программы.

---

## Класс Device

Начнём с:

```cpp
class Device {
private:
    int id;
    std::string name;
    DeviceType type;
    DeviceState state;

public:
    Device(
        int id,
        std::string name,
        DeviceType type
    )
        : id(id),
          name(std::move(name)),
          type(type),
          state(DeviceState::Stopped) {
    }
};
```

Здесь используется список инициализации конструктора.

---

## Почему поля private

Пользователь класса не должен напрямую менять:

```cpp
state
```

например:

```cpp
device.state = DeviceState::Running;
```

Вместо этого мы создадим методы:

```cpp
void start();
void stop();
```

---

## Методы

```cpp
void start() {
    state = DeviceState::Running;
}

void stop() {
    state = DeviceState::Stopped;
}
```

Теперь состояние изменяется контролируемым способом.

---

## Получение данных

Добавим:

```cpp
int getId() const {
    return id;
}

const std::string& getName() const {
    return name;
}

DeviceState getState() const {
    return state;
}
```

Методы чтения помечены:

```cpp
const
```

потому что они не изменяют объект.

---

## Хранение устройств

В менеджере можно использовать:

```cpp
std::vector<Device> devices;
```

Например:

```cpp
devices.emplace_back(
    1,
    "Motor",
    DeviceType::Motor
);
```

---

## Класс DeviceManager

Создадим отдельный класс:

```cpp
class DeviceManager {
private:
    std::vector<Device> devices;

public:
    void addDevice(Device device);
    bool removeDevice(int id);
    Device* findDevice(int id);
};
```

Теперь управление коллекцией отделено от самого устройства.

---

## Добавление устройства

```cpp
void addDevice(Device device) {
    devices.push_back(std::move(device));
}
```

Использование:

```cpp
manager.addDevice(
    Device(1, "Motor", DeviceType::Motor)
);
```

---

## Поиск

```cpp
Device* findDevice(int id) {
    for (auto& device : devices) {
        if (device.getId() == id) {
            return &device;
        }
    }

    return nullptr;
}
```

Если устройство найдено:

```cpp
Device*
```

указывает на него.

Если нет:

```cpp
nullptr
```

---

## Использование поиска

```cpp
Device* device = manager.findDevice(1);

if (device) {
    device->start();
}
```

Это типичная схема:

```text
find
 ↓
check
 ↓
use
```

---

## `std::optional`

Можно использовать другой интерфейс.

Например:

```cpp
std::optional<int> findDeviceIndex(int id) {
    for (std::size_t i = 0; i < devices.size(); ++i) {
        if (devices[i].getId() == id) {
            return static_cast<int>(i);
        }
    }

    return std::nullopt;
}
```

Теперь результат явно говорит:

```text
нашли индекс
```

или:

```text
не нашли
```

---

## Вывод состояния

Создадим функцию:

```cpp
std::string toString(DeviceState state) {
    switch (state) {
    case DeviceState::Stopped:
        return "Stopped";

    case DeviceState::Running:
        return "Running";

    case DeviceState::Error:
        return "Error";
    }

    return "Unknown";
}
```

Это позволяет выводить состояние человеку.

---

## Главное меню

Программа может показывать:

```text
Device Manager

1. List devices
2. Add device
3. Start device
4. Stop device
5. Remove device
6. Exit
```

Получаем команду:

```cpp
int command;
std::cin >> command;
```

---

## Основной цикл

```cpp
bool running = true;

while (running) {
    printMenu();

    int command;
    std::cin >> command;

    switch (command) {
    case 1:
        listDevices();
        break;

    case 2:
        addDevice();
        break;

    case 3:
        startDevice();
        break;

    case 4:
        stopDevice();
        break;

    case 5:
        removeDevice();
        break;

    case 6:
        running = false;
        break;

    default:
        std::cout << "Unknown command\n";
        break;
    }
}
```

Это уже полноценный консольный цикл приложения.

---

## Почему лучше использовать функции

Не стоит писать всё внутри `main()`:

```cpp
int main() {
    // 500 строк
}
```

Лучше:

```cpp
void printMenu();
void listDevices();
void addDevice();
void startDevice();
void stopDevice();
void removeDevice();
```

`main()` становится координатором программы.

---

## Проверка пользовательского ввода

Пользователь может ввести:

```text
abc
```

вместо:

```text
1
```

Поэтому реальные программы должны обрабатывать ошибки ввода.

Например:

```cpp
int command;

if (!(std::cin >> command)) {
    std::cin.clear();
    std::cin.ignore(
        std::numeric_limits<std::streamsize>::max(),
        '\n'
    );

    std::cout << "Invalid input\n";
}
```

---

## Удаление устройства

Можно использовать:

```cpp
bool removeDevice(int id) {
    auto it = std::find_if(
        devices.begin(),
        devices.end(),
        [id](const Device& device) {
            return device.getId() == id;
        }
    );

    if (it == devices.end()) {
        return false;
    }

    devices.erase(it);
    return true;
}
```

Здесь объединяются:

```text
vector
iterator
algorithm
lambda
```

которые мы изучали раньше.

---

## Список устройств

Можно вывести:

```cpp
void listDevices() const {
    for (const auto& device : devices) {
        std::cout
            << device.getId()
            << " | "
            << device.getName()
            << " | "
            << toString(device.getState())
            << '\n';
    }
}
```

---

## Идентификаторы

Нужно решить, кто выдаёт ID.

Для учебного проекта можно сделать:

```cpp
int nextId = 1;
```

При добавлении:

```cpp
int id = nextId++;
```

Но в реальной системе ID может приходить из:

```text
database
configuration
hardware
server
UUID
```

---

## Конфигурация устройства

Позже можно добавить:

```cpp
struct DeviceConfig {
    std::string address;
    int port;
};
```

Например:

```text
PLC
IP: 192.168.8.149
Port: 4861
```

Это уже приближает проект к реальному мониторингу оборудования.

---

## Разделение данных

Можно сделать:

```cpp
class Device {
    DeviceInfo info;
    DeviceConfig config;
    DeviceState state;
};
```

Тогда объект содержит разные аспекты устройства.

Но не нужно усложнять архитектуру раньше времени.

---

## Полная архитектура

На этом этапе:

```text
main()
  ↓
DeviceManager
  ↓
vector<Device>
  ↓
Device
```

Пользовательский ввод:

```text
console
  ↓
main
  ↓
manager
```

Это простая, но уже понятная архитектура.

---

## Что мы потренировали

В одном проекте используются:

```text
class
struct
enum class
vector
string
optional
algorithm
lambda
const
references
move
functions
input/output
```

Именно поэтому небольшие проекты полезнее десятков отдельных примеров.

---

## Практика

### Задание 1

Добавьте команду:

```text
restart
```

Она должна выполнить:

```text
stop
start
```

---

### Задание 2

Добавьте состояние:

```cpp
Maintenance
```

---

### Задание 3

Добавьте поле:

```text
IP address
```

для каждого сетевого устройства.

---

### Задание 4

Добавьте команду:

```text
find
```

которая ищет устройство по имени.

---

### Задание 5

Добавьте защиту от дублирования ID.

---

### Задание 6

Разделите программу на:

```text
main.cpp
device.h
device.cpp
device_manager.h
device_manager.cpp
```

Это подготовит вас к следующей части курса о конфигурационных файлах и организации реальных проектов.

---

## Что дальше

Наш менеджер пока хранит все данные только в памяти.

После завершения программы список устройств исчезает.

В следующем проекте мы решим эту проблему и сделаем **работу с конфигурационным файлом**.