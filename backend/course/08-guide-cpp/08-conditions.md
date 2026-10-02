---
id: cpp-08
title: Условия if, else и switch
module_id: cpp
module_title: C++
module_order: 8
order: 8
---

# Условия `if`, `else` и `switch`

## Цель

До этого момента наши программы выполняли инструкции практически всегда одинаково.

Но реальные программы должны уметь принимать решения.

Например:

```text
если батарея разряжена → остановить двигатель
если температура высокая → включить охлаждение
если пользователь администратор → разрешить действие
если соединение потеряно → повторить попытку
```

Для этого в C++ используются условные конструкции.

В этом уроке изучим:

* `if`;
* `else`;
* `else if`;
* сравнение условий;
* логические выражения;
* вложенные условия;
* `switch`;
* `case`;
* `default`.

---

# Что такое условие

Условие — выражение, результатом которого является:

```text
true
```

или:

```text
false
```

Например:

```cpp
temperature > 80
```

Если:

```text
temperature = 90
```

условие истинно.

Если:

```text
temperature = 60
```

условие ложно.

---

# Конструкция if

Самая простая форма:

```cpp
if (условие) {
    // код
}
```

Например:

```cpp
int temperature = 90;

if (temperature > 80) {
    std::cout << "Warning!\n";
}
```

Если температура больше `80`, сообщение будет выведено.

---

# Как работает if

Программа проверяет:

```cpp
temperature > 80
```

Если результат:

```text
true
```

выполняется код внутри:

```cpp
{
    ...
}
```

Если:

```text
false
```

этот блок пропускается.

Схема:

```text
         условие
            ↓
       ┌────┴────┐
     true       false
       ↓           ↓
    выполнить    пропустить
      блок         блок
```

---

# Пример

```cpp
#include <iostream>

int main() {
    int battery = 15;

    if (battery < 20) {
        std::cout << "Low battery!\n";
    }

    return 0;
}
```

Результат:

```text
Low battery!
```

Если изменить:

```cpp
int battery = 80;
```

условие:

```cpp
battery < 20
```

станет ложным.

Сообщение не появится.

---

# else

Иногда нужно выполнить один блок, если условие истинно, и другой — если ложно.

Для этого используется:

```cpp
else
```

Например:

```cpp
int battery = 80;

if (battery < 20) {
    std::cout << "Low battery!\n";
} else {
    std::cout << "Battery is OK.\n";
}
```

Если батарея меньше `20`:

```text
Low battery!
```

Иначе:

```text
Battery is OK.
```

---

# if и else

Общая форма:

```cpp
if (condition) {
    // если true
} else {
    // если false
}
```

Всегда выполняется только один из двух блоков.

---

# else if

Иногда вариантов больше двух.

Например:

```text
температура < 50
50–80
> 80
```

Можно использовать:

```cpp
if (temperature < 50) {
    std::cout << "Cold\n";
} else if (temperature <= 80) {
    std::cout << "Normal\n";
} else {
    std::cout << "Hot\n";
}
```

Программа проверяет условия сверху вниз.

---

# Порядок проверки

Рассмотрим:

```cpp
int temperature = 90;

if (temperature < 50) {
    std::cout << "Cold\n";
} else if (temperature <= 80) {
    std::cout << "Normal\n";
} else {
    std::cout << "Hot\n";
}
```

Проверяется:

```text
90 < 50
```

ложно.

Затем:

```text
90 <= 80
```

тоже ложно.

Тогда выполняется `else`:

```text
Hot
```

Как только подходящий блок найден, остальные условия этой цепочки не проверяются.

---

# Несколько условий

Условие может быть сложным.

Например:

```cpp
if (temperature < 80 && battery > 20) {
    std::cout << "Robot can work.\n";
}
```

Здесь должны выполняться оба условия:

```text
temperature < 80
```

и:

```text
battery > 20
```

---

# Использование ||

Можно разрешить несколько вариантов:

```cpp
if (battery < 20 || temperature > 80) {
    std::cout << "Warning!\n";
}
```

Предупреждение появится, если:

```text
батарея низкая
ИЛИ
температура высокая
```

---

# Использование !

Можно проверить отрицание:

```cpp
bool emergencyStop = false;

if (!emergencyStop) {
    std::cout << "System can work.\n";
}
```

Так как:

```text
emergencyStop = false
```

то:

```text
!emergencyStop = true
```

---

# Вложенные условия

Условия можно помещать друг в друга.

Например:

```cpp
int battery = 80;
bool connected = true;

if (connected) {
    if (battery > 20) {
        std::cout << "Robot can work.\n";
    }
}
```

Сначала проверяется соединение.

Если оно есть, проверяется батарея.

---

# Но не стоит слишком усложнять вложенность

Можно получить код:

```cpp
if (connected) {
    if (battery > 20) {
        if (temperature < 80) {
            if (!emergencyStop) {
                // ...
            }
        }
    }
}
```

Такой код становится трудно читать.

Часто лучше объединить условия:

```cpp
if (connected &&
    battery > 20 &&
    temperature < 80 &&
    !emergencyStop) {
    // ...
}
```

Так структура программы становится понятнее.

---

# Сравнение строк

Условия можно использовать не только с числами.

Например:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string command = "start";

    if (command == "start") {
        std::cout << "Starting...\n";
    }

    return 0;
}
```

Оператор:

```cpp
==
```

сравнивает строки.

---

# switch

Иногда программа должна выбрать один вариант из нескольких фиксированных значений.

Например:

```text
1 → Start
2 → Stop
3 → Reset
```

Для этого удобно использовать `switch`.

Пример:

```cpp
int command = 2;

switch (command) {
    case 1:
        std::cout << "Start\n";
        break;

    case 2:
        std::cout << "Stop\n";
        break;

    case 3:
        std::cout << "Reset\n";
        break;
}
```

Результат:

```text
Stop
```

---

# case

Каждая ветка `switch` обозначается:

```cpp
case
```

Например:

```cpp
case 1:
```

означает:

> если значение равно `1`, выполнить этот блок.

---

# break

Обычно после каждого `case` используется:

```cpp
break;
```

Например:

```cpp
case 1:
    std::cout << "Start\n";
    break;
```

`break` завершает выполнение текущего `switch`.

Без `break` выполнение может перейти к следующему `case`.

---

# Что произойдёт без break

Например:

```cpp
int command = 1;

switch (command) {
    case 1:
        std::cout << "Start\n";

    case 2:
        std::cout << "Stop\n";
}
```

После совпадения с `case 1` выполнение продолжится дальше.

Получится:

```text
Start
Stop
```

Такое поведение иногда используется специально, но начинающим важно помнить про `break`.

---

# default

Можно задать вариант на случай, если ни один `case` не подходит:

```cpp
int command = 10;

switch (command) {
    case 1:
        std::cout << "Start\n";
        break;

    case 2:
        std::cout << "Stop\n";
        break;

    default:
        std::cout << "Unknown command\n";
        break;
}
```

Результат:

```text
Unknown command
```

---

# if или switch

`if` удобен для условий:

```cpp
if (temperature > 80)
```

или:

```cpp
if (battery > 20 && connected)
```

`switch` удобен, когда есть набор конкретных значений:

```text
1
2
3
4
```

Например:

```cpp
switch (command) {
    case 1:
        ...
        break;

    case 2:
        ...
        break;
}
```

---

# Пример системы управления

Представим программу робота:

```cpp
#include <iostream>

int main() {
    int command;

    std::cout << "Enter command: ";
    std::cin >> command;

    switch (command) {
        case 1:
            std::cout << "Starting robot\n";
            break;

        case 2:
            std::cout << "Stopping robot\n";
            break;

        case 3:
            std::cout << "Resetting robot\n";
            break;

        default:
            std::cout << "Unknown command\n";
            break;
    }

    return 0;
}
```

Пользователь вводит:

```text
2
```

Программа выводит:

```text
Stopping robot
```

---

# Практический пример с несколькими условиями

```cpp
#include <iostream>

int main() {
    double temperature;
    int battery;

    std::cout << "Temperature: ";
    std::cin >> temperature;

    std::cout << "Battery: ";
    std::cin >> battery;

    if (temperature > 80) {
        std::cout << "Emergency: high temperature!\n";
    } else if (battery < 20) {
        std::cout << "Warning: low battery!\n";
    } else {
        std::cout << "Robot is ready.\n";
    }

    return 0;
}
```

Здесь программа выбирает одно из трёх состояний.

---

# Практика

## Задание 1

Напишите программу, которая получает число и выводит:

```text
Positive
Negative
Zero
```

в зависимости от его значения.

---

## Задание 2

Создайте программу проверки возраста:

```text
меньше 18 → Minor
18 и больше → Adult
```

---

## Задание 3

Создайте программу проверки батареи:

```text
< 20 → Low
20–80 → Normal
> 80 → High
```

---

## Задание 4

Создайте меню:

```text
1. Start
2. Stop
3. Reset
4. Exit
```

Используйте `switch`.

---

## Задание 5

Создайте проверку робота.

Робот может работать, если:

```text
battery > 20
temperature < 80
connected == true
```

Используйте одно логическое выражение с `&&`.

---

# Главное

Запомните:

* `if` выполняет код при истинном условии;
* `else` выполняется, если условие `if` ложно;
* `else if` позволяет проверить несколько вариантов;
* условия могут объединяться с `&&`, `||` и `!`;
* `switch` удобен для выбора между фиксированными значениями;
* `case` задаёт отдельный вариант `switch`;
* `break` завершает текущий `case`;
* `default` используется, если ни один `case` не подошёл;
* слишком глубокую вложенность условий лучше избегать.

Главная идея:

```text
данные
  ↓
проверка условия
  ↓
выбор действия
  ↓
результат
```