---
id: cpp-11
title: Строки и std::string
module_id: cpp
module_title: C++
module_order: 8
order: 11
---

# Строки и `std::string`

## Цель

Программы работают не только с числами. Нам постоянно приходится хранить имена пользователей, команды, сообщения, пути к файлам, названия устройств и другие текстовые данные.

В C++ для обычной работы с текстом используется тип `std::string`. В этом уроке разберём, как создавать строки, объединять их, получать отдельные символы, сравнивать текст и читать строки от пользователя.

После урока вы должны понимать:

* что такое строка;
* зачем нужен `std::string`;
* как создавать и изменять строки;
* как получать длину строки;
* как обращаться к отдельным символам;
* как объединять строки;
* чем `cin >>` отличается от `getline()`.

---

# Что такое строка

Строка — это последовательность символов.

Например:

```text
Hello
Dmitry
Robot
Temperature: 25
```

В программе строка может храниться в переменной:

```cpp
std::string name = "Dmitry";
```

Чтобы использовать `std::string`, необходимо подключить заголовочный файл:

```cpp
#include <string>
```

---

# Первая строка

Простейшая программа:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string name = "Dmitry";

    std::cout << name << '\n';

    return 0;
}
```

Здесь создаётся переменная:

```cpp
std::string name
```

и ей присваивается текст:

```text
Dmitry
```

---

# Строка и символ

Важно различать строку и отдельный символ.

Строка:

```cpp
std::string name = "Dmitry";
```

Символ:

```cpp
char firstLetter = 'D';
```

Для строк обычно используются двойные кавычки:

```cpp
"Dmitry"
```

Для одного символа — одинарные:

```cpp
'D'
```

Это разные типы данных.

---

# Пустая строка

Можно создать пустую строку:

```cpp
std::string name;
```

Или явно:

```cpp
std::string name = "";
```

На момент создания в ней нет символов.

Позже можно записать значение:

```cpp
name = "Dmitry";
```

---

# Изменение строки

Строка является изменяемым объектом.

Например:

```cpp
std::string name = "Dmitry";

name = "Alex";
```

Теперь:

```text
name = Alex
```

Можно также полностью заменить содержимое:

```cpp
name = "Robot";
```

---

# Длина строки

Для получения количества символов используется:

```cpp
size()
```

или:

```cpp
length()
```

Например:

```cpp
std::string name = "Dmitry";

std::cout << name.size() << '\n';
```

Получим:

```text
6
```

Оба варианта:

```cpp
name.size()
```

и:

```cpp
name.length()
```

возвращают длину строки.

---

# Индексы строки

Как и массив, строка позволяет обращаться к отдельным символам по индексу.

Например:

```cpp
std::string word = "Robot";
```

Индексы:

```text
R  o  b  o  t
0  1  2  3  4
```

Можно получить первый символ:

```cpp
word[0]
```

Результат:

```text
R
```

Последний:

```cpp
word[4]
```

Результат:

```text
t
```

---

# Изменение символа

Отдельный символ тоже можно изменить:

```cpp
std::string word = "Robot";

word[0] = 'r';
```

Теперь строка:

```text
robot
```

Нужно помнить, что индекс должен находиться внутри строки.

---

# Перебор строки

Так как строка состоит из символов, её можно обработать циклом.

Например:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string word = "Robot";

    for (std::size_t i = 0; i < word.size(); i++) {
        std::cout << word[i] << '\n';
    }

    return 0;
}
```

Результат:

```text
R
o
b
o
t
```

Здесь используется `std::size_t`, потому что `size()` возвращает значение этого типа.

---

# Range-based for

Для перебора всех символов есть более удобный синтаксис:

```cpp
for (char c : word) {
    std::cout << c << '\n';
}
```

Полная программа:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string word = "Robot";

    for (char c : word) {
        std::cout << c << '\n';
    }

    return 0;
}
```

Такой цикл особенно удобен, когда индекс самого символа нам не нужен.

---

# Объединение строк

Строки можно объединять оператором:

```cpp
+
```

Например:

```cpp
std::string firstName = "Dmitry";
std::string lastName = "Panfilov";

std::string fullName = firstName + " " + lastName;
```

Теперь:

```text
fullName = Dmitry Panfilov
```

---

# Оператор +=

Если нужно добавить текст к существующей строке, можно использовать:

```cpp
+=
```

Например:

```cpp
std::string message = "Hello";

message += ", Dmitry";
message += "!";
```

Получим:

```text
Hello, Dmitry!
```

---

# Сравнение строк

Строки можно сравнивать:

```cpp
std::string command = "start";

if (command == "start") {
    std::cout << "Starting...\n";
}
```

Можно использовать:

```cpp
==
!=
<
>
<=
>=
```

Сравнение строк выполняется лексикографически, то есть по порядку символов.

Например:

```cpp
std::string a = "apple";
std::string b = "banana";

if (a < b) {
    std::cout << "a comes before b\n";
}
```

---

# Ввод одного слова

Для одного слова можно использовать:

```cpp
std::cin >> name;
```

Например:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string name;

    std::cout << "Name: ";
    std::cin >> name;

    std::cout << "Hello, " << name << '\n';

    return 0;
}
```

Если пользователь введёт:

```text
Dmitry
```

всё работает ожидаемо.

---

# Ввод всей строки

Если текст может содержать пробелы, используется:

```cpp
std::getline()
```

Например:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string fullName;

    std::cout << "Full name: ";
    std::getline(std::cin, fullName);

    std::cout << "Hello, " << fullName << '\n';

    return 0;
}
```

Теперь ввод:

```text
Dmitry Panfilov
```

сохранится полностью.

---

# Проблема при смешивании cin и getline

Следующий код может вести себя неожиданно:

```cpp
int age;
std::string name;

std::cin >> age;
std::getline(std::cin, name);
```

После ввода числа в потоке остаётся символ перевода строки. Поэтому `getline()` может сразу прочитать остаток текущей строки и вернуть пустую строку.

Один из простых вариантов решения:

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

    std::cout << "Age: ";
    std::cin >> age;

    std::cin.ignore();

    std::cout << "Full name: ";
    std::getline(std::cin, name);

    std::cout << "Age: " << age << '\n';
    std::cout << "Name: " << name << '\n';

    return 0;
}
```

В дальнейшем мы подробнее разберём обработку потоков ввода.

---

# Поиск внутри строки

У `std::string` есть метод:

```cpp
find()
```

Он позволяет искать последовательность символов.

Например:

```cpp
std::string text = "Robot architecture";

std::size_t position = text.find("Robot");
```

Если слово найдено, метод возвращает его позицию.

Если не найдено, возвращается специальное значение:

```cpp
std::string::npos
```

Можно проверить:

```cpp
if (text.find("Robot") != std::string::npos) {
    std::cout << "Found\n";
}
```

---

# Получение подстроки

Метод:

```cpp
substr()
```

позволяет получить часть строки.

Например:

```cpp
std::string text = "Robot";

std::string part = text.substr(0, 3);
```

Получим:

```text
Rob
```

Первый аргумент — начальная позиция.

Второй — количество символов.

---

# Удаление символов

Можно удалить часть строки с помощью:

```cpp
erase()
```

Например:

```cpp
std::string text = "Hello World";

text.erase(5, 6);
```

Получим:

```text
Hello
```

Однако такие операции лучше использовать осознанно, потому что строка изменяется.

---

# Практический пример

Представим, что программа получает название устройства:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string deviceName;

    std::cout << "Enter device name: ";
    std::getline(std::cin, deviceName);

    std::cout << "\nDevice information\n";
    std::cout << "Name: " << deviceName << '\n';
    std::cout << "Length: " << deviceName.size() << '\n';

    if (deviceName.find("Robot") != std::string::npos) {
        std::cout << "This looks like a robot device.\n";
    }

    return 0;
}
```

Здесь мы уже используем несколько возможностей `std::string` одновременно:

```text
ввод строки
↓
хранение текста
↓
получение длины
↓
поиск текста
↓
вывод результата
```

---

# Практика

## Задание 1

Создайте строку:

```cpp
std::string name = "Dmitry";
```

Выведите:

* всю строку;
* её длину;
* первый символ;
* последний символ.

---

## Задание 2

Создайте две строки:

```text
имя
фамилия
```

Объедините их в одну строку с пробелом.

---

## Задание 3

Получите от пользователя полное имя с помощью `getline()` и выведите его обратно.

---

## Задание 4

Создайте строку:

```text
Robot controller
```

Проверьте с помощью `find()`, содержит ли она слово:

```text
Robot
```

---

## Задание 5

Создайте строку:

```text
0123456789
```

С помощью `substr()` получите:

```text
3456
```

---

# Главное

`std::string` — основной тип для работы с обычным текстом в современном C++.

Важно помнить разницу между:

```cpp
std::string
```

и:

```cpp
char
```

Строка содержит последовательность символов, а `char` хранит один символ.

Основные операции:

```cpp
name.size()
name.length()
name[index]
name.find("text")
name.substr(...)
name += "text"
```

Для ввода одного слова можно использовать:

```cpp
std::cin >> name;
```

Для целой строки:

```cpp
std::getline(std::cin, name);
```

Строки встречаются практически в любом серьёзном приложении: от консольных программ до сетевых сервисов, конфигураций, логов и робототехнических систем.