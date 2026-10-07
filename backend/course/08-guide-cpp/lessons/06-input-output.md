---
id: cpp-06
title: Ввод и вывод: cin и cout
module_id: cpp
module_title: C++
module_order: 8
order: 6
---

# Ввод и вывод: `cin` и `cout`

## Цель

До этого момента наши программы сами задавали все значения.

Например:

```cpp
int age = 25;
```

Но настоящая программа должна уметь получать данные извне.

Пользователь может ввести:

```text
имя
возраст
число
команду
настройку
```

Программа может вывести:

```text
результат вычисления
сообщение
состояние устройства
ошибку
```

В этом уроке разберём стандартный ввод и вывод в C++.

После урока вы должны понимать:

* что такое поток ввода и вывода;
* как работает `std::cout`;
* как работает `std::cin`;
* как вводить числа и строки;
* как читать несколько значений;
* что происходит при неправильном вводе.

---

# Потоки ввода и вывода

В C++ стандартная библиотека предоставляет несколько объектов для работы с консолью.

Главные из них:

```cpp
std::cout
```

и:

```cpp
std::cin
```

Упрощённо:

```text
std::cin
   ↓
ввод данных

std::cout
   ↓
вывод данных
```

Для их использования обычно подключают:

```cpp
#include <iostream>
```

---

# Вывод с помощью cout

Самый простой пример:

```cpp
#include <iostream>

int main() {
    std::cout << "Hello!\n";

    return 0;
}
```

Здесь:

```cpp
std::cout
```

представляет стандартный поток вывода.

Оператор:

```cpp
<<
```

передаёт данные в этот поток.

---

# Вывод переменной

Можно вывести переменную:

```cpp
#include <iostream>

int main() {
    int age = 25;

    std::cout << age << '\n';

    return 0;
}
```

Результат:

```text
25
```

Можно объединять текст и переменные:

```cpp
std::cout << "Age: " << age << '\n';
```

Получим:

```text
Age: 25
```

---

# Несколько значений

Можно передать несколько элементов в один `cout`:

```cpp
int age = 25;
double height = 180.5;

std::cout << "Age: " << age << ", height: " << height << '\n';
```

Результат:

```text
Age: 25, height: 180.5
```

Каждый оператор:

```cpp
<<
```

передаёт следующий элемент в поток.

---

# Перевод строки

Для перехода на новую строку часто используется:

```cpp
'\n'
```

Например:

```cpp
std::cout << "First\n";
std::cout << "Second\n";
```

Результат:

```text
First
Second
```

Можно использовать и:

```cpp
std::endl
```

Например:

```cpp
std::cout << "First" << std::endl;
std::cout << "Second" << std::endl;
```

Но для обычного вывода часто достаточно `'\n'`.

---

# Ввод с помощью cin

Теперь научимся получать данные от пользователя.

Пример:

```cpp
#include <iostream>

int main() {
    int age;

    std::cin >> age;

    std::cout << "Your age: " << age << '\n';

    return 0;
}
```

При запуске программа будет ждать ввода.

Пользователь может написать:

```text
25
```

После нажатия Enter значение попадёт в переменную:

```text
age = 25
```

---

# Оператор >>

Для `cin` используется оператор:

```cpp
>>
```

Например:

```cpp
std::cin >> age;
```

Упрощённо это можно читать так:

> получить значение из стандартного ввода и записать его в `age`.

Получается:

```text
клавиатура
    ↓
std::cin
    ↓
age
```

---

# Ввод нескольких значений

Можно прочитать несколько переменных:

```cpp
#include <iostream>

int main() {
    int a;
    int b;

    std::cin >> a >> b;

    std::cout << "Sum: " << a + b << '\n';

    return 0;
}
```

Пользователь может ввести:

```text
10 20
```

Результат:

```text
Sum: 30
```

Можно вводить и через Enter:

```text
10
20
```

`std::cin` разделяет значения по пробельным символам.

---

# Пример калькулятора

Теперь можем сделать простую программу:

```cpp
#include <iostream>

int main() {
    double a;
    double b;

    std::cout << "Enter first number: ";
    std::cin >> a;

    std::cout << "Enter second number: ";
    std::cin >> b;

    std::cout << "Sum: " << a + b << '\n';
    std::cout << "Difference: " << a - b << '\n';
    std::cout << "Product: " << a * b << '\n';
    std::cout << "Division: " << a / b << '\n';

    return 0;
}
```

Пример работы:

```text
Enter first number: 10
Enter second number: 2
Sum: 12
Difference: 8
Product: 20
Division: 5
```

Теперь программа зависит от данных пользователя.

---

# Ввод строки

Для строки:

```cpp
std::string
```

можно использовать:

```cpp
std::cin >> name;
```

Например:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string name;

    std::cout << "Enter your name: ";
    std::cin >> name;

    std::cout << "Hello, " << name << "!\n";

    return 0;
}
```

Пользователь вводит:

```text
Dmitry
```

Результат:

```text
Hello, Dmitry!
```

---

# Ограничение cin >> для строк

При использовании:

```cpp
std::cin >> name;
```

читается одно слово.

Если пользователь введёт:

```text
Dmitry Panfilov
```

то в `name` попадёт только:

```text
Dmitry
```

Потому что пробел является разделителем.

Если нужно прочитать всю строку, используется:

```cpp
std::getline()
```

---

# getline

Пример:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string fullName;

    std::cout << "Enter your full name: ";
    std::getline(std::cin, fullName);

    std::cout << "Hello, " << fullName << "!\n";

    return 0;
}
```

Теперь ввод:

```text
Dmitry Panfilov
```

сохранится целиком.

---

# cin и getline вместе

Здесь возникает важный момент.

Рассмотрим:

```cpp
int age;
std::string name;

std::cin >> age;
std::getline(std::cin, name);
```

После ввода числа:

```text
25
```

в потоке остаётся символ перевода строки.

Поэтому `getline` может сразу получить пустую строку.

Для обработки такого случая можно использовать:

```cpp
std::cin.ignore();
```

Например:

```cpp
#include <iostream>
#include <string>

int main() {
    int age;
    std::string name;

    std::cout << "Enter age: ";
    std::cin >> age;

    std::cin.ignore();

    std::cout << "Enter full name: ";
    std::getline(std::cin, name);

    std::cout << "Age: " << age << '\n';
    std::cout << "Name: " << name << '\n';

    return 0;
}
```

Более надёжные варианты очистки ввода мы рассмотрим позже.

---

# Что происходит при неправильном вводе

Представим:

```cpp
int age;

std::cin >> age;
```

Пользователь вводит:

```text
hello
```

Но программа ожидает число.

В результате операция ввода не сможет преобразовать текст в `int`.

Поток перейдёт в состояние ошибки.

Это важно, потому что программа не всегда может предполагать, что пользователь вводит корректные данные.

---

# Проверка состояния cin

Можно проверить:

```cpp
if (std::cin) {
    // ввод прошёл успешно
}
```

Например:

```cpp
#include <iostream>

int main() {
    int number;

    std::cout << "Enter number: ";

    std::cin >> number;

    if (std::cin) {
        std::cout << "Correct input: " << number << '\n';
    }

    return 0;
}
```

Если ввод корректный, значение будет записано.

---

# Более практичная проверка

Можно написать:

```cpp
if (std::cin >> number) {
    std::cout << "Correct input\n";
} else {
    std::cout << "Invalid input\n";
}
```

Это удобно, потому что сама операция чтения возвращает поток, состояние которого можно проверить.

---

# Поток stdin и stdout

На уровне операционной системы стандартная консоль обычно связана с потоками:

```text
stdin
stdout
stderr
```

В C++ им соответствуют стандартные объекты:

```text
stdin  → std::cin
stdout → std::cout
stderr → std::cerr
```

Например:

```cpp
std::cerr << "Error!\n";
```

используется для вывода сообщений об ошибках.

---

# Практический пример

Создадим программу, которая получает параметры робота:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string name;
    double speed;
    int battery;

    std::cout << "Robot name: ";
    std::cin >> name;

    std::cout << "Speed: ";
    std::cin >> speed;

    std::cout << "Battery: ";
    std::cin >> battery;

    std::cout << "\nRobot information\n";
    std::cout << "Name: " << name << '\n';
    std::cout << "Speed: " << speed << '\n';
    std::cout << "Battery: " << battery << "%\n";

    return 0;
}
```

Пример:

```text
Robot name: R2D2
Speed: 1.5
Battery: 87

Robot information
Name: R2D2
Speed: 1.5
Battery: 87%
```

---

# Практика

## Задание 1

Напишите программу, которая спрашивает:

```text
Введите имя:
Введите возраст:
```

и выводит:

```text
Привет, Dmitry!
Тебе 25 лет.
```

---

## Задание 2

Напишите калькулятор двух чисел.

Пользователь вводит:

```text
a
b
```

Программа выводит:

```text
sum
difference
product
division
```

---

## Задание 3

Создайте программу для робота.

Пусть пользователь вводит:

```text
скорость
температуру
уровень батареи
```

Программа должна вывести все три значения.

---

## Задание 4

Попробуйте в программу, ожидающую `int`, ввести текст.

Посмотрите, как изменится состояние `std::cin`.

---

# Главное

* `std::cout` используется для вывода;
* `std::cin` используется для ввода;
* `<<` передаёт данные в поток вывода;
* `>>` извлекает данные из потока ввода;
* `std::cin >> name` читает одно слово;
* `std::getline()` позволяет читать всю строку;
* неправильный ввод может перевести `std::cin` в состояние ошибки;
* ввод пользователя нельзя автоматически считать корректным;
* `std::cerr` используется для сообщений об ошибках.

Базовая схема консольной программы теперь выглядит так:

```text
ввод пользователя
       ↓
    std::cin
       ↓
    переменные
       ↓
   вычисления
       ↓
   std::cout
       ↓
результат пользователю
```