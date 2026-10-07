---
id: cpp-42
title: auto и вывод типов
module_id: cpp
module_title: C++
module_order: 8
order: 42
---

# auto и вывод типов

## Цель

В современном C++ компилятор умеет самостоятельно определять тип переменной по выражению, с которым она инициализируется.

Для этого используется ключевое слово `auto`.

После урока вы должны понимать:

* что делает `auto`;
* почему `auto` не означает отсутствие типа;
* как компилятор определяет тип;
* где `auto` делает код удобнее;
* когда `auto` ухудшает читаемость;
* как `auto` работает с `const` и ссылками;
* как использовать `auto` с итераторами;
* почему `auto` особенно полезен в современном C++.

---

# Что такое auto

Обычно переменная объявляется так:

```cpp
int count = 10;
double temperature = 24.5;
std::string name = "Motor";
```

С `auto` можно написать:

```cpp
auto count = 10;
auto temperature = 24.5;
auto name = std::string{"Motor"};
```

Компилятор определяет тип по правой части.

Получается:

```text
count       -> int
temperature -> double
name        -> std::string
```

Важно: `auto` не делает переменную динамически типизированной.

После компиляции переменная всё равно имеет конкретный тип.

---

# auto не означает «любой тип»

В Python можно сделать:

```python
value = 10
value = "hello"
```

В C++:

```cpp
auto value = 10;
```

`value` становится `int`.

Так сделать нельзя:

```cpp
value = "hello";
```

Тип переменной не изменился.

`auto` используется только для того, чтобы **компилятор вывел тип при объявлении**.

---

# Тип определяется выражением

Рассмотрим:

```cpp
auto a = 10;
```

Число `10` имеет тип `int`.

Поэтому:

```text
a -> int
```

Другой пример:

```cpp
auto b = 10.5;
```

Тип:

```text
double
```

А здесь:

```cpp
auto c = true;
```

Тип:

```text
bool
```

---

# Строки

Следует внимательно относиться к строковым литералам.

```cpp
auto name = "Motor";
```

Здесь `name` не является `std::string`.

Строковый литерал имеет тип массива символов, который в таком выражении преобразуется в указатель.

Если нужен именно `std::string`, лучше написать:

```cpp
auto name = std::string{"Motor"};
```

или:

```cpp
std::string name = "Motor";
```

---

# auto и const

Рассмотрим:

```cpp
const int value = 10;

auto x = value;
```

`x` будет обычным `int`.

То есть `const` верхнего уровня обычно не сохраняется:

```text
value -> const int
x     -> int
```

Если нужно сохранить `const`, его указывают явно:

```cpp
const auto x = value;
```

Теперь:

```text
x -> const int
```

---

# auto и ссылки

Рассмотрим:

```cpp
int value = 10;

auto x = value;
```

Здесь `x` — отдельная переменная.

Изменение:

```cpp
x = 20;
```

не изменяет `value`.

Чтобы получить ссылку:

```cpp
auto& x = value;
```

Теперь:

```cpp
x = 20;
```

изменит `value`.

---

# const auto&

Очень распространённый вариант:

```cpp
const auto& value = object;
```

Он означает:

> создать константную ссылку на существующий объект.

Например:

```cpp
std::string name = "Motor";

const auto& ref = name;
```

`ref` не создаёт копию строки.

И через `ref` нельзя изменить `name`.

---

# auto и указатели

Если:

```cpp
int value = 10;
int* pointer = &value;
```

можно написать:

```cpp
auto pointer = &value;
```

Тип `pointer` будет:

```text
int*
```

Если нужен указатель на константные данные:

```cpp
const int value = 10;

auto pointer = &value;
```

получится:

```text
const int*
```

---

# auto с контейнерами

Особенно полезен `auto` при работе со стандартной библиотекой.

Например:

```cpp
std::vector<int> values{
    10, 20, 30, 40
};
```

Без `auto`:

```cpp
std::vector<int>::iterator it = values.begin();
```

С `auto`:

```cpp
auto it = values.begin();
```

Это не только короче, но и удобнее при изменении типа контейнера.

---

# auto и циклы

В современном C++ часто используется:

```cpp
for (const auto& value : values) {
    std::cout << value << '\n';
}
```

Компилятор знает тип элемента контейнера.

Например, если:

```cpp
std::vector<double> values;
```

то `value` будет `const double&`.

Если:

```cpp
std::vector<std::string> names;
```

то `value` будет `const std::string&`.

---

# auto и structured bindings

В предыдущем уроке мы использовали:

```cpp
auto [id, name] = device;
```

`auto` позволяет компилятору определить тип каждого элемента.

Например:

```cpp
std::pair<int, std::string> device{
    10,
    "Motor"
};

auto [id, name] = device;
```

Получается:

```text
id   -> int
name -> std::string
```

---

# auto с результатами функций

Если функция возвращает сложный тип:

```cpp
std::vector<std::string> getDevices();
```

можно написать:

```cpp
auto devices = getDevices();
```

Вместо:

```cpp
std::vector<std::string> devices = getDevices();
```

Это особенно полезно, если тип длинный:

```cpp
std::unordered_map<
    std::string,
    std::vector<std::pair<int, double>>
> data;
```

Вместо повторения всего типа:

```cpp
auto data = getData();
```

---

# auto не всегда полезен

Не стоит использовать `auto` абсолютно везде.

Например:

```cpp
auto value = 10;
```

Это нормально.

Но иногда явный тип лучше показывает смысл:

```cpp
int retryCount = 3;
```

Читателю сразу понятно, что хранится целое число.

С `auto`:

```cpp
auto retryCount = 3;
```

тоже понятно, но информация о типе становится менее явной.

---

# auto и изменение типа выражения

Важно понимать, что `auto` выводит тип именно из выражения.

Например:

```cpp
auto a = 10;
auto b = 10.0;
```

Получаем:

```text
a -> int
b -> double
```

Следовательно:

```cpp
auto result = a + b;
```

получит тип:

```text
double
```

Потому что результат сложения `int` и `double` имеет тип `double`.

---

# Практический пример

Представим список датчиков:

```cpp
#include <iostream>
#include <string>
#include <vector>

struct Sensor {
    std::string name;
    double value;
};

int main() {
    std::vector<Sensor> sensors{
        {"Temperature", 24.5},
        {"Pressure", 101.2},
        {"Voltage", 24.0}
    };

    for (const auto& sensor : sensors) {
        std::cout << sensor.name
                  << ": "
                  << sensor.value
                  << '\n';
    }
}
```

Здесь `auto` используется для ссылки на элемент контейнера.

Если тип `Sensor` позже изменится или контейнер будет содержать другой тип, такой цикл не придётся переписывать.

---

# Практическое правило

Можно использовать примерно такое правило:

**Используйте `auto`, когда тип очевиден из правой части или слишком громоздок.**

Например:

```cpp
auto value = getSensorValue();
auto iterator = devices.begin();
auto [id, name] = device;
```

А когда тип является важной частью смысла переменной, явное объявление часто лучше:

```cpp
int retryCount = 3;
double temperatureLimit = 80.0;
bool emergencyStop = false;
```

---

# Главное

`auto` не убирает типизацию.

```cpp
auto value = 10;
```

означает:

```cpp
int value = 10;
```

Тип определяется компилятором во время компиляции.

Особенно полезен `auto` при:

* итераторах;
* сложных типах;
* range-based `for`;
* structured bindings;
* результатах функций;
* работе с STL.

При этом `auto` не нужно использовать механически. Хороший код должен оставаться понятным человеку.

---

# Практика

### Задание 1

Создайте переменные через `auto`:

```text
int
double
bool
std::string
```

Определите, какие типы получил компилятор.

### Задание 2

Создайте:

```cpp
std::vector<int>
```

и переберите его через:

```cpp
for (const auto& value : values)
```

### Задание 3

Создайте `std::map<std::string, int>` и переберите его через:

```cpp
for (const auto& [name, id] : devices)
```

### Задание 4

Напишите функцию, возвращающую `std::vector<double>`.

Получите результат через:

```cpp
auto values = getValues();
```

### Задание 5

Создайте переменную:

```cpp
int value = 10;
```

Затем создайте:

```cpp
auto copy = value;
auto& reference = value;
```

Измените `copy` и `reference`.

Объясните, почему результат различается.