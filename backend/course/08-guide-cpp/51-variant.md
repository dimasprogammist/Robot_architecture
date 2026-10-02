---
id: cpp-51
title: std::variant
module_id: cpp
module_title: C++
module_order: 8
order: 51
---

# std::variant

## Цель

В этом уроке разберём `std::variant` — тип C++, который позволяет хранить **одно значение из нескольких заранее заданных типов**.

После урока вы должны понимать:

* зачем нужен `std::variant`;
* чем он отличается от `union`;
* как создавать и изменять `variant`;
* как определить активный тип;
* как использовать `std::get`, `std::get_if` и `std::holds_alternative`;
* как обрабатывать несколько возможных типов;
* где `variant` полезен в программах управления и робототехнике.

---

## Проблема разных типов

Представим, что контроллер получает параметр устройства.

Иногда это число:

```text
1500
```

иногда логическое значение:

```text
true
```

а иногда строка:

```text
"automatic"
```

Можно сделать отдельные переменные:

```cpp
int number;
bool enabled;
std::string mode;
```

Но тогда нужно отдельно хранить информацию о том, какая переменная сейчас используется.

`std::variant` позволяет объединить эти варианты в один объект.

---

## Что такое std::variant

Например:

```cpp
#include <variant>

std::variant<int, double, std::string> value;
```

Такой объект может содержать:

```text
int
или
double
или
std::string
```

Но одновременно он содержит только **одно** из этих значений.

Например:

```cpp
value = 100;
```

Теперь внутри находится `int`.

Затем:

```cpp
value = 12.5;
```

Теперь внутри находится `double`.

И затем:

```cpp
value = "automatic";
```

Теперь внутри находится `std::string`.

---

## Подключение

Для `std::variant` нужен:

```cpp
#include <variant>
```

Типы, которые будут использоваться внутри `variant`, перечисляются между угловыми скобками:

```cpp
std::variant<int, double, std::string>
```

---

## Создание variant

Можно сразу передать значение:

```cpp
std::variant<int, double, std::string> value = 42;
```

Сейчас активен `int`.

Можно создать `double`:

```cpp
std::variant<int, double, std::string> value = 3.14;
```

Или строку:

```cpp
std::variant<int, double, std::string> value = "hello";
```

---

## std::get

Чтобы получить значение конкретного типа, используется `std::get`:

```cpp
std::variant<int, double, std::string> value = 42;

int number = std::get<int>(value);
```

Теперь:

```cpp
std::cout << number << '\n';
```

выведет:

```text
42
```

---

## Ошибка неправильного типа

Важно понимать, что `std::get` проверяет активный тип.

Например:

```cpp
std::variant<int, double> value = 42;

double number = std::get<double>(value);
```

Сейчас внутри находится `int`, поэтому получение `double` приведёт к исключению `std::bad_variant_access`.

Перед получением типа нужно знать, что именно находится внутри.

---

## holds_alternative

Для проверки типа используется:

```cpp
std::holds_alternative<int>(value)
```

Например:

```cpp
if (std::holds_alternative<int>(value)) {
    std::cout << "Внутри int\n";
}
```

Можно проверить разные варианты:

```cpp
if (std::holds_alternative<int>(value)) {
    std::cout << "Число int\n";
} else if (std::holds_alternative<double>(value)) {
    std::cout << "Число double\n";
} else if (std::holds_alternative<std::string>(value)) {
    std::cout << "Строка\n";
}
```

---

## get_if

Другой безопасный способ — `std::get_if`.

Он возвращает указатель на значение, если внутри находится нужный тип.

```cpp
std::variant<int, double> value = 42;

if (auto number = std::get_if<int>(&value)) {
    std::cout << *number << '\n';
}
```

Если внутри находится другой тип, `get_if` вернёт `nullptr`.

Это удобно, когда нужно проверить тип и сразу получить значение.

---

## Изменение значения

`variant` можно менять:

```cpp
std::variant<int, std::string> value = 42;

value = "motor";
```

Теперь внутри находится строка.

Можно снова записать число:

```cpp
value = 100;
```

Теперь активным снова является `int`.

---

## index()

У `variant` есть `index()`:

```cpp
std::variant<int, double, std::string> value = 42;

std::cout << value.index() << '\n';
```

В данном случае результат:

```text
0
```

Потому что `int` является первым типом.

Для `double`:

```text
1
```

Для `std::string`:

```text
2
```

Однако в прикладном коде обычно лучше проверять тип непосредственно через `holds_alternative`, а не строить логику на числовых индексах.

---

## std::visit

Самый интересный инструмент для работы с `variant` — `std::visit`.

Он позволяет выполнить функцию в зависимости от текущего типа.

Например:

```cpp
#include <iostream>
#include <string>
#include <variant>

int main() {
    std::variant<int, double, std::string> value = 42;

    std::visit(
        [](const auto& item) {
            std::cout << item << '\n';
        },
        value
    );
}
```

`std::visit` передаст лямбда-функции фактическое значение.

---

## Разная логика для разных типов

Можно использовать несколько перегруженных вариантов обработки:

```cpp
#include <iostream>
#include <string>
#include <variant>

struct Printer {
    void operator()(int value) const {
        std::cout << "int: " << value << '\n';
    }

    void operator()(double value) const {
        std::cout << "double: " << value << '\n';
    }

    void operator()(const std::string& value) const {
        std::cout << "string: " << value << '\n';
    }
};

int main() {
    std::variant<int, double, std::string> value = 42;

    std::visit(Printer{}, value);
}
```

`std::visit` выберет соответствующий `operator()`.

---

## Variant и состояние устройства

Представим параметр робота:

```text
скорость → число
режим → строка
включение → bool
```

Можно описать его так:

```cpp
using Parameter = std::variant<int, double, bool, std::string>;
```

Теперь:

```cpp
Parameter value = 1500;
```

или:

```cpp
value = true;
```

или:

```cpp
value = "automatic";
```

---

## Практический пример

```cpp
#include <iostream>
#include <string>
#include <variant>

using Parameter = std::variant<int, double, bool, std::string>;

void print_parameter(const Parameter& value) {
    std::visit(
        [](const auto& item) {
            std::cout << item << '\n';
        },
        value
    );
}

int main() {
    Parameter speed = 1500;
    Parameter temperature = 24.5;
    Parameter enabled = true;
    Parameter mode = "automatic";

    print_parameter(speed);
    print_parameter(temperature);
    print_parameter(enabled);
    print_parameter(mode);
}
```

Здесь один тип `Parameter` способен представлять разные виды параметров.

---

## Variant и union

В C++ существует старый механизм:

```cpp
union
```

`union` тоже позволяет использовать несколько типов в одной области памяти, но работа с ним значительно более низкоуровневая.

`std::variant` предоставляет более безопасную модель:

* знает активный тип;
* умеет проверять тип;
* работает с объектами сложных типов;
* интегрирован с современным C++;
* уменьшает количество ошибок ручного управления состоянием.

Для обычного прикладного кода чаще нужен именно `std::variant`.

---

## Variant и optional

Эти типы решают разные задачи.

`optional`:

```cpp
std::optional<int>
```

означает:

```text
int
или отсутствие значения
```

`variant`:

```cpp
std::variant<int, std::string>
```

означает:

```text
int
или string
```

То есть `optional` отвечает на вопрос:

> есть значение или нет?

А `variant`:

> какое из нескольких допустимых представлений сейчас используется?

При необходимости их можно даже объединить:

```cpp
std::variant<int, std::string, std::monostate>
```

Но чаще для состояния "нет значения" удобнее `optional`.

---

## std::monostate

Иногда `variant` должен иметь состояние "ничего не выбрано".

Для этого существует:

```cpp
std::monostate
```

Например:

```cpp
std::variant<std::monostate, int, std::string> value;
```

После создания активным будет `std::monostate`.

Это полезно, когда `variant` должен явно иметь состояние "не инициализирован".

---

## Когда использовать variant

`std::variant` хорошо подходит, когда набор возможных типов известен заранее.

Например:

```text
команда может быть:
- Move
- Stop
- SetSpeed
```

или:

```text
параметр может быть:
- int
- double
- bool
- string
```

или:

```text
состояние может быть:
- ошибка
- число
- сообщение
```

Главное условие — список возможных типов должен быть известен во время компиляции.

---

## Практика

### Задание 1

Создайте:

```cpp
using Value = std::variant<int, double, std::string>;
```

Создайте несколько переменных этого типа и положите в них разные значения.

---

### Задание 2

Напишите функцию, которая определяет текущий тип через `std::holds_alternative`.

---

### Задание 3

Используйте `std::get_if`, чтобы безопасно получить `double`.

---

### Задание 4

Создайте:

```cpp
using DeviceValue = std::variant<int, double, bool, std::string>;
```

Напишите функцию вывода значения через `std::visit`.

---

### Задание 5

Создайте систему параметров двигателя:

```text
speed      → int
temperature → double
enabled    → bool
mode       → string
```

Представьте каждый параметр с помощью `std::variant`.

---

## Главное

`std::variant` позволяет одному объекту содержать **одно из нескольких заранее известных типов**:

```cpp
std::variant<int, double, std::string> value;
```

Основные инструменты:

```cpp
std::get<T>(value);
```

```cpp
std::get_if<T>(&value);
```

```cpp
std::holds_alternative<T>(value);
```

```cpp
std::visit(function, value);
```

Главная идея:

> `std::variant` позволяет явно описать набор допустимых типов и безопасно работать с текущим активным вариантом.