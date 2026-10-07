---
id: cpp-57
title: CMake
module_id: cpp
module_title: C++
module_order: 8
order: 57
---

# CMake

## Цель

В предыдущем уроке мы увидели, что несколько C++ файлов можно собрать командой вроде:

```text
g++ main.cpp motor.cpp sensor.cpp -o robot
```

Для маленького проекта это нормально. Но если исходных файлов становится десятки, появляются библиотеки, тесты, разные настройки компилятора и несколько платформ, ручная сборка быстро становится неудобной.

Для автоматизации этого процесса используется **CMake**.

После урока вы должны понимать:

* зачем нужен CMake;
* что такое `CMakeLists.txt`;
* как создать простой C++ проект;
* как указать исходные файлы;
* как задать стандарт C++;
* как создать исполняемый файл;
* как собрать проект;
* чем CMake отличается от самого компилятора;
* что такое build directory.

---

## Что такое CMake

CMake — это система управления сборкой.

Важно не путать:

```text
CMake
```

и:

```text
g++
```

`g++` — компилятор.

CMake сам по себе не является компилятором.

Он описывает проект и генерирует файлы сборки для выбранной среды.

Упрощённая модель:

```text
CMakeLists.txt
       ↓
     CMake
       ↓
система сборки
       ↓
    compiler
       ↓
    program
```

---

## Зачем нужен CMake

Без CMake можно написать:

```text
g++ main.cpp motor.cpp sensor.cpp controller.cpp -o robot
```

Но со временем команда превращается в:

```text
g++ -std=c++20
    -Wall
    -Wextra
    -Iinclude
    main.cpp
    src/motor.cpp
    src/sensor.cpp
    src/controller.cpp
    ...
    -lpthread
    ...
```

А затем появятся:

```text
debug
release
tests
libraries
different platforms
compiler options
```

CMake позволяет описать эти правила в проекте.

---

## CMakeLists.txt

Главный файл CMake обычно называется:

```text
CMakeLists.txt
```

Например:

```text
robot/
├── CMakeLists.txt
├── main.cpp
├── motor.cpp
└── motor.h
```

---

## Минимальный CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.20)

project(Robot)

add_executable(robot
    main.cpp
    motor.cpp
)
```

Этого уже достаточно для простого проекта.

---

## Разберём команды

Первая строка:

```cmake
cmake_minimum_required(VERSION 3.20)
```

задаёт минимальную версию CMake, которую проект ожидает.

Далее:

```cmake
project(Robot)
```

задаёт имя проекта.

А:

```cmake
add_executable(robot
    main.cpp
    motor.cpp
)
```

говорит:

> создать исполняемый файл `robot`, используя эти исходные файлы.

---

## Добавление стандарта C++

Современный проект может требовать C++20:

```cmake
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
```

Полный пример:

```cmake
cmake_minimum_required(VERSION 3.20)

project(Robot)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(robot
    main.cpp
    motor.cpp
)
```

Теперь CMake будет настраивать сборку под C++20.

---

## Создание build directory

Обычно исходный код не смешивают с файлами сборки.

Структура:

```text
robot/
├── CMakeLists.txt
├── main.cpp
├── motor.cpp
├── motor.h
└── build/
```

Папка:

```text
build/
```

предназначена для результатов конфигурации и сборки.

---

## Конфигурация проекта

Находясь в корне проекта, можно выполнить:

```text
cmake -S . -B build
```

Здесь:

```text
-S .
```

означает исходный каталог.

А:

```text
-B build
```

означает каталог сборки.

CMake прочитает:

```text
CMakeLists.txt
```

и подготовит build directory.

---

## Сборка

После конфигурации:

```text
cmake --build build
```

CMake запустит соответствующую систему сборки.

На разных платформах под капотом могут использоваться разные инструменты, но команда остаётся примерно одинаковой.

---

## Полный процесс

Для проекта:

```text
robot/
├── CMakeLists.txt
├── main.cpp
├── motor.cpp
└── motor.h
```

выполняем:

```text
cmake -S . -B build
```

затем:

```text
cmake --build build
```

Получаем собранную программу внутри `build`.

---

## Почему build не стоит хранить в Git

Папка `build` содержит сгенерированные файлы.

Обычно её не добавляют в репозиторий.

В `.gitignore` можно написать:

```text
build/
```

Исходный проект хранит:

```text
CMakeLists.txt
src/
include/
```

а каталог сборки создаётся заново на конкретном компьютере.

---

## Структура нормального проекта

Например:

```text
robot/
├── CMakeLists.txt
├── include/
│   ├── motor.h
│   └── sensor.h
├── src/
│   ├── main.cpp
│   ├── motor.cpp
│   └── sensor.cpp
└── build/
```

Это уже гораздо ближе к реальному проекту.

---

## Указание include directory

Если заголовки находятся в:

```text
include/
```

можно написать:

```cmake
target_include_directories(robot
    PRIVATE
        include
)
```

Полный пример:

```cmake
cmake_minimum_required(VERSION 3.20)

project(Robot)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(robot
    src/main.cpp
    src/motor.cpp
    src/sensor.cpp
)

target_include_directories(robot
    PRIVATE
        include
)
```

Теперь в исходниках можно писать:

```cpp
#include "motor.h"
```

---

## Почему используется target_

В современном CMake настройки стараются привязывать к конкретной цели.

Например:

```cmake
target_include_directories(robot ...)
```

означает:

> эти include directories относятся к цели `robot`.

А не ко всему проекту без разбора.

Это помогает управлять зависимостями.

---

## Флаги компилятора

Можно добавить предупреждения:

```cmake
target_compile_options(robot
    PRIVATE
        -Wall
        -Wextra
)
```

Но конкретные флаги зависят от компилятора и платформы.

Для кроссплатформенных проектов лучше не строить весь проект вокруг одного набора флагов.

---

## Debug и Release

У проектов могут быть разные конфигурации:

```text
Debug
Release
```

Debug обычно предназначен для разработки и отладки.

Release — для итоговой сборки.

При использовании генераторов CMake конфигурация может передаваться отдельно:

```text
cmake --build build --config Debug
```

или:

```text
cmake --build build --config Release
```

Точное поведение зависит от генератора и платформы.

---

## Добавление библиотеки

Допустим, у нас есть:

```text
motor.cpp
sensor.cpp
```

и основная программа.

Можно создать отдельную библиотеку:

```cmake
add_library(robot_devices
    src/motor.cpp
    src/sensor.cpp
)
```

А затем:

```cmake
add_executable(robot
    src/main.cpp
)
```

и связать:

```cmake
target_link_libraries(robot
    PRIVATE
        robot_devices
)
```

Получается:

```text
robot_devices
      ↓
     robot
```

---

## Почему библиотеки важны

В большом проекте не обязательно складывать весь код в один исполняемый файл.

Можно разделить систему:

```text
core
devices
network
protocols
application
```

Каждая часть может быть отдельной библиотечной целью.

Это делает архитектуру проекта более управляемой.

---

## CMake и IDE

CMake используется не только из терминала.

Его поддерживают:

```text
Visual Studio
VS Code
CLion
Qt Creator
```

IDE может прочитать:

```text
CMakeLists.txt
```

и автоматически понять:

```text
какие исходники есть;
какие include directories нужны;
какие библиотеки подключены;
какие цели существуют.
```

Поэтому CMake является хорошим способом описывать структуру проекта независимо от конкретной IDE.

---

## Практический пример

Структура:

```text
robot/
├── CMakeLists.txt
├── include/
│   ├── motor.h
│   └── sensor.h
└── src/
    ├── main.cpp
    ├── motor.cpp
    └── sensor.cpp
```

`CMakeLists.txt`:

```cmake
cmake_minimum_required(VERSION 3.20)

project(Robot)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(robot
    src/main.cpp
    src/motor.cpp
    src/sensor.cpp
)

target_include_directories(robot
    PRIVATE
        include
)
```

---

## motor.h

```cpp
#pragma once

class Motor {
public:
    void start();
    void stop();
};
```

---

## motor.cpp

```cpp
#include "motor.h"

#include <iostream>

void Motor::start() {
    std::cout << "Motor started\n";
}

void Motor::stop() {
    std::cout << "Motor stopped\n";
}
```

---

## sensor.h

```cpp
#pragma once

class Sensor {
public:
    double read() const;
};
```

---

## sensor.cpp

```cpp
#include "sensor.h"

double Sensor::read() const {
    return 24.5;
}
```

---

## main.cpp

```cpp
#include <iostream>

#include "motor.h"
#include "sensor.h"

int main() {
    Motor motor;
    Sensor sensor;

    motor.start();

    std::cout << "Sensor: "
              << sensor.read()
              << '\n';

    motor.stop();
}
```

---

## Сборка

Из корня проекта:

```text
cmake -S . -B build
```

Затем:

```text
cmake --build build
```

После этого проект собран.

---

## Что делает CMake, а чего он не делает

Важно не воспринимать CMake как замену компилятору.

CMake:

```text
описывает проект;
создаёт систему сборки;
управляет зависимостями;
задаёт параметры целей.
```

Компилятор:

```text
компилирует C++ код.
```

Linker:

```text
соединяет объектные файлы и библиотеки.
```

Можно представить:

```text
CMake
  ↓
"Как собирать?"

compiler
  ↓
"Как перевести C++ в объектный код?"

linker
  ↓
"Как соединить всё в программу?"
```

---

## Практика

### Задание 1

Создайте минимальный проект:

```text
hello/
├── CMakeLists.txt
└── main.cpp
```

Настройте C++20 и соберите программу.

---

### Задание 2

Создайте:

```text
robot/
├── CMakeLists.txt
├── include/
│   ├── motor.h
│   └── sensor.h
└── src/
    ├── main.cpp
    ├── motor.cpp
    └── sensor.cpp
```

Добавьте все исходники в `add_executable`.

---

### Задание 3

Добавьте библиотечную цель:

```cmake
add_library(robot_devices ...)
```

Поместите туда `motor.cpp` и `sensor.cpp`.

Свяжите её с `robot`.

---

### Задание 4

Добавьте:

```text
build/
```

в `.gitignore`.

Удалите `build` и убедитесь, что проект можно снова собрать командами:

```text
cmake -S . -B build
cmake --build build
```

---

## Главное

CMake позволяет описать структуру C++ проекта в виде конфигурации.

Основные элементы:

```cmake
project(...)
```

```cmake
add_executable(...)
```

```cmake
add_library(...)
```

```cmake
target_include_directories(...)
```

```cmake
target_link_libraries(...)
```

Базовый рабочий цикл:

```text
CMakeLists.txt
      ↓
cmake -S . -B build
      ↓
cmake --build build
      ↓
готовая программа
```

Главная идея:

> CMake не компилирует C++ вместо компилятора. Он описывает проект и организует процесс сборки.