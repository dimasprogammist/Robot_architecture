---
id: cpp-58
title: Структура C++ проекта
module_id: cpp
module_title: C++
module_order: 8
order: 58
---

# Структура C++ проекта

## Цель

Мы уже научились разделять код на `.h` и `.cpp`, собирать несколько файлов и использовать CMake. Теперь объединим эти знания и разберём, как организовать C++ проект так, чтобы в нём было удобно работать по мере роста программы.

Правильная структура не является единственно возможной. Разные команды используют разные соглашения. Но существуют понятные принципы, которые хорошо работают для учебных проектов, приложений, библиотек и систем управления устройствами.

После урока вы должны понимать:

* зачем проект разделяют на каталоги;
* что обычно находится в `src` и `include`;
* зачем нужен `tests`;
* где хранить конфигурацию и ресурсы;
* как связать структуру каталогов с CMake;
* чем структура исходников отличается от структуры сборки;
* как организовать проект робота или автоматизированной системы.

---

## Почему один каталог быстро становится неудобным

В начале проекта можно иметь:

```text
main.cpp
motor.cpp
motor.h
sensor.cpp
sensor.h
```

Пока файлов пять, проблем почти нет.

Но через несколько месяцев могут появиться:

```text
robot.cpp
robot.h
motor.cpp
motor.h
sensor.cpp
sensor.h
controller.cpp
controller.h
logger.cpp
logger.h
network.cpp
network.h
config.cpp
config.h
database.cpp
database.h
...
```

Все файлы лежат рядом.

Найти нужный компонент становится сложнее, а структура проекта перестаёт показывать архитектуру.

Поэтому исходные файлы обычно группируют по назначению.

---

## Базовая структура

Для небольшого проекта можно использовать:

```text
robot/
├── CMakeLists.txt
├── include/
├── src/
├── tests/
└── README.md
```

Каждый каталог имеет свою роль.

```text
include/ → публичные заголовки
src/     → реализации
tests/   → тесты
```

---

## Каталог src

`src` обычно означает:

```text
source
```

То есть исходный код.

Например:

```text
src/
├── main.cpp
├── robot.cpp
├── motor.cpp
├── sensor.cpp
└── controller.cpp
```

Здесь находятся `.cpp` файлы.

---

## Каталог include

В `include` часто располагают заголовочные файлы:

```text
include/
├── robot.h
├── motor.h
├── sensor.h
└── controller.h
```

Например:

```cpp
#pragma once

class Motor {
public:
    void start();
    void stop();
};
```

---

## Почему include и src разделяют

Разделение делает структуру очевидной:

```text
include/
    что предоставляет компонент

src/
    как компонент реализован
```

Особенно полезно это становится для библиотек.

Если проект позже станет библиотекой, каталог `include` можно рассматривать как часть публичного интерфейса.

---

## Главный файл

Обычно приложение имеет:

```text
src/main.cpp
```

Например:

```cpp
#include "robot.h"

int main() {
    Robot robot;

    robot.start();

    return 0;
}
```

`main.cpp` обычно отвечает за запуск приложения, а не содержит всю бизнес-логику.

---

## Почему не стоит писать всё в main.cpp

Плохая структура:

```cpp
int main() {
    // создание подключения

    // чтение конфигурации

    // управление двигателями

    // работа с датчиками

    // сетевой обмен

    // логирование

    // обработка ошибок

    // ещё 2000 строк
}
```

`main()` лучше воспринимать как точку сборки приложения:

```text
создать объекты
настроить систему
запустить главный цикл
```

---

## Разделение по компонентам

Например:

```text
src/
├── main.cpp
├── robot.cpp
├── motor.cpp
├── sensor.cpp
└── controller.cpp
```

Каждый файл отвечает за конкретную часть программы.

Можно получить:

```text
Robot
 ├── Motor
 ├── Sensor
 └── Controller
```

---

## Группировка по подсистемам

Когда проект становится большим, одного уровня каталогов может быть мало.

Например:

```text
src/
├── robot/
│   ├── robot.cpp
│   └── controller.cpp
├── devices/
│   ├── motor.cpp
│   └── sensor.cpp
├── network/
│   └── tcp_client.cpp
└── diagnostics/
    └── logger.cpp
```

Теперь структура каталогов отражает структуру системы.

---

## Аналогичная структура include

Можно сделать:

```text
include/
├── robot/
│   ├── robot.h
│   └── controller.h
├── devices/
│   ├── motor.h
│   └── sensor.h
├── network/
│   └── tcp_client.h
└── diagnostics/
    └── logger.h
```

Тогда подключение выглядит:

```cpp
#include "devices/motor.h"
#include "devices/sensor.h"
#include "network/tcp_client.h"
```

Из самого `#include` уже понятно, к какой подсистеме относится файл.

---

## CMake для такой структуры

Например:

```cmake
cmake_minimum_required(VERSION 3.20)

project(Robot)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(robot
    src/main.cpp
    src/robot/robot.cpp
    src/robot/controller.cpp
    src/devices/motor.cpp
    src/devices/sensor.cpp
    src/network/tcp_client.cpp
    src/diagnostics/logger.cpp
)

target_include_directories(robot
    PRIVATE
        include
)
```

CMake не требует, чтобы структура была именно такой. Это соглашение, которое помогает организовать проект.

---

## Каталог tests

Для тестов можно создать:

```text
tests/
```

Например:

```text
tests/
├── motor_tests.cpp
├── sensor_tests.cpp
└── controller_tests.cpp
```

Тесты проверяют поведение компонентов отдельно от основного приложения.

Позже мы разберём тестирование подробнее.

---

## Каталог assets

Иногда программе нужны внешние ресурсы:

```text
assets/
```

Например:

```text
assets/
├── configuration.json
├── robot.json
└── calibration.dat
```

Но важно отличать исходные данные от файлов, которые программа создаёт во время работы.

---

## Конфигурация

Конфигурация может храниться отдельно:

```text
config/
├── default.json
└── development.json
```

Например:

```json
{
    "server": "192.168.1.10",
    "port": 5000
}
```

Конкретный способ хранения конфигурации зависит от проекта.

---

## Документация

Для проекта полезно иметь:

```text
README.md
```

В нём можно описать:

```text
что делает программа;
как установить зависимости;
как собрать;
как запустить;
как выполнить тесты.
```

Например:

```markdown
# Robot

Система управления роботом.

## Сборка

cmake -S . -B build
cmake --build build
```

---

## Build не является исходным кодом

Полная структура может выглядеть так:

```text
robot/
├── CMakeLists.txt
├── README.md
├── .gitignore
├── include/
├── src/
├── tests/
├── assets/
└── build/
```

Но `build/` отличается от остальных каталогов.

Это результат работы системы сборки.

Его обычно не хранят в Git.

---

## .gitignore

Для проекта можно написать:

```text
build/
.vscode/
.idea/
*.o
*.obj
*.exe
```

Но конкретный `.gitignore` зависит от инструментов и того, какие артефакты должны храниться в репозитории.

---

## Структура библиотеки

Если проект является библиотекой:

```text
robotlib/
├── CMakeLists.txt
├── include/
│   └── robotlib/
│       ├── motor.h
│       └── sensor.h
├── src/
│   ├── motor.cpp
│   └── sensor.cpp
└── tests/
```

Почему внутри `include` есть:

```text
robotlib/
```

Это помогает избежать конфликтов имён.

Пользователь библиотеки сможет писать:

```cpp
#include <robotlib/motor.h>
```

---

## Публичный и внутренний код

Не каждый заголовок обязательно должен быть публичным.

Например:

```text
include/
    публичные API

src/
    внутренние заголовки и реализации
```

Можно иметь:

```text
src/internal/
```

для внутренних компонентов:

```text
src/
├── robot.cpp
└── internal/
    ├── packet_parser.h
    └── packet_parser.cpp
```

Главная программа не обязана напрямую использовать эти внутренние детали.

---

## Структура проекта робота

Для учебного проекта робототехники можно сделать:

```text
robot/
├── CMakeLists.txt
├── README.md
├── include/
│   ├── robot/
│   │   ├── robot.h
│   │   └── controller.h
│   ├── devices/
│   │   ├── motor.h
│   │   └── sensor.h
│   ├── communication/
│   │   └── tcp_client.h
│   └── diagnostics/
│       └── logger.h
├── src/
│   ├── main.cpp
│   ├── robot/
│   │   ├── robot.cpp
│   │   └── controller.cpp
│   ├── devices/
│   │   ├── motor.cpp
│   │   └── sensor.cpp
│   ├── communication/
│   │   └── tcp_client.cpp
│   └── diagnostics/
│       └── logger.cpp
├── tests/
└── build/
```

Такая структура уже показывает архитектуру системы.

---

## Почему не нужно создавать слишком много папок

Есть и обратная проблема.

Не стоит превращать небольшой проект в:

```text
src/
├── robot/
│   └── control/
│       └── internal/
│           └── runtime/
│               └── components/
│                   └── ...
```

Если в проекте всего пять классов, такая структура только мешает.

Хорошее правило:

> структура должна помогать находить код, а не демонстрировать количество созданных каталогов.

---

## Организация по типу или по функции

Можно организовать проект так:

```text
classes/
functions/
interfaces/
utils/
```

Но для прикладных проектов часто удобнее группировать по подсистемам:

```text
devices/
network/
control/
diagnostics/
```

Почему?

Потому что связанные компоненты оказываются рядом.

Например:

```text
devices/
    motor
    sensor
    encoder
```

логически понятнее, чем:

```text
classes/
    motor
    sensor
    encoder
```

---

## Практический пример

Создадим небольшой проект:

```text
robot/
├── CMakeLists.txt
├── include/
│   ├── devices/
│   │   ├── motor.h
│   │   └── sensor.h
│   └── robot/
│       └── robot.h
├── src/
│   ├── main.cpp
│   ├── devices/
│   │   ├── motor.cpp
│   │   └── sensor.cpp
│   └── robot/
│       └── robot.cpp
└── tests/
```

`robot.h`:

```cpp
#pragma once

class Robot {
public:
    void start();
};
```

`robot.cpp`:

```cpp
#include "robot/robot.h"

#include "devices/motor.h"
#include "devices/sensor.h"

void Robot::start() {
    Motor motor;
    Sensor sensor;

    motor.start();

    (void)sensor.read();
}
```

`main.cpp`:

```cpp
#include "robot/robot.h"

int main() {
    Robot robot;
    robot.start();
}
```

Структура файлов теперь сама помогает понять архитектуру.

---

## Как растёт проект

Можно представить развитие проекта:

### Этап 1

```text
main.cpp
```

### Этап 2

```text
main.cpp
motor.cpp
motor.h
```

### Этап 3

```text
include/
src/
```

### Этап 4

```text
include/
src/
tests/
```

### Этап 5

```text
devices/
network/
control/
diagnostics/
```

Не нужно сразу строить сложную архитектуру. Она должна появляться вместе с реальными потребностями проекта.

---

## Практика

### Задание 1

Создайте:

```text
robot/
├── CMakeLists.txt
├── include/
├── src/
└── tests/
```

Настройте CMake.

---

### Задание 2

Добавьте подсистемы:

```text
devices/
control/
communication/
```

Распределите между ними классы:

```text
Motor
Sensor
Controller
TcpClient
```

---

### Задание 3

Создайте:

```text
README.md
.gitignore
```

Добавьте в `.gitignore`:

```text
build/
```

---

### Задание 4

Создайте CMake-проект, который собирает все `.cpp` файлы из вашей структуры.

---

### Задание 5

Представьте, что проект вырос до:

```text
50 классов
```

Опишите, по каким подсистемам вы бы их разделили.

---

## Главное

Хорошая структура проекта не обязана быть огромной.

Для начала достаточно:

```text
project/
├── CMakeLists.txt
├── include/
├── src/
├── tests/
└── README.md
```

По мере роста можно добавить:

```text
devices/
network/
control/
diagnostics/
config/
assets/
```

Главная идея:

> структура каталогов должна отражать логическую структуру программы и помогать быстро находить нужный компонент.

И ещё одно важное правило:

> `src` и `include` содержат исходный код, а `build` содержит результаты сборки.