---
id: cpp-35
title: std::string и работа с текстом
module_id: cpp
module_title: C++
module_order: 8
order: 35
---

# std::string и работа с текстом

## Цель

Со строками мы уже познакомились раньше, но теперь рассмотрим `std::string` именно как часть стандартной библиотеки и научимся использовать его вместе с контейнерами и алгоритмами STL.

После урока вы должны понимать:

* как хранить текст в `std::string`;
* как изменять строки;
* как объединять строки;
* как получать отдельные символы;
* как искать текст;
* как извлекать часть строки;
* как удалять и заменять фрагменты;
* как работать с набором строк;
* как использовать строки в практических программах.

---

## Что такое std::string

`std::string` — стандартный класс C++, предназначенный для работы с текстовыми строками.

Для использования нужно:

```cpp
#include <string>
```

Пример:

```cpp
#include <iostream>
#include <string>

int main()
{
    std::string name = "Robot";

    std::cout << name << '\n';

    return 0;
}
```

---

## Почему не char[]

В старом стиле C строка часто представлялась массивом символов:

```cpp
char name[] = "Robot";
```

Такой подход всё ещё существует и иногда необходим для взаимодействия с C API.

Но для обычного современного C++ гораздо удобнее:

```cpp
std::string name = "Robot";
```

`std::string` самостоятельно управляет памятью и предоставляет множество готовых операций для работы с текстом.

---

## Создание строки

Можно создать пустую строку:

```cpp
std::string text;
```

Или сразу задать значение:

```cpp
std::string text = "Hello";
```

Также:

```cpp
std::string text{"Hello"};
```

Все эти варианты создают объект строки.

---

## Размер строки

Количество символов можно получить через:

```cpp
text.size()
```

или:

```cpp
text.length()
```

Например:

```cpp
std::string text = "Hello";

std::cout << text.size();
```

Результат:

```text
5
```

Для обычной работы эти методы можно считать эквивалентными.

---

## Доступ к символам

Строка поддерживает индексы:

```cpp
std::string text = "Robot";

std::cout << text[0];
```

Результат:

```text
R
```

Можно изменить символ:

```cpp
text[0] = 'r';
```

Теперь:

```text
robot
```

---

## at()

Как и у других контейнеров, есть:

```cpp
text.at(0)
```

Он проверяет границы.

Например:

```cpp
char symbol = text.at(100);
```

при неправильном индексе приведёт к исключению.

Оператор:

```cpp
text[100]
```

такой проверки не выполняет.

---

## Перебор строки

Строка поддерживает range-based `for`:

```cpp
std::string text = "Robot";

for (char symbol : text)
{
    std::cout << symbol << '\n';
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

Если строку нужно только читать, можно использовать:

```cpp
for (const char symbol : text)
{
    std::cout << symbol << '\n';
}
```

---

## Изменение символов

Можно изменить символы во время перебора:

```cpp
for (char& symbol : text)
{
    if (symbol == 'o')
    {
        symbol = '0';
    }
}
```

Для:

```text
Robot
```

получится:

```text
R0b0t
```

Здесь `char&` означает ссылку на настоящий символ строки.

---

## Объединение строк

Для объединения используется оператор:

```cpp
+
```

Например:

```cpp
std::string first = "Hello";
std::string second = "World";

std::string result = first + " " + second;
```

Получится:

```text
Hello World
```

---

## Оператор +=

Если нужно добавить текст к существующей строке:

```cpp
std::string text = "Hello";

text += " ";
text += "Robot";
```

Теперь:

```text
Hello Robot
```

Это удобно, когда строка постепенно формируется.

---

## Сравнение строк

Строки можно сравнивать:

```cpp
std::string a = "robot";
std::string b = "robot";

if (a == b)
{
    std::cout << "Equal\n";
}
```

Также существуют:

```cpp
a != b
a < b
a > b
```

Сравнение выполняется лексикографически.

То есть порядок определяется последовательностью символов.

---

## Пустая строка

Проверить строку можно через:

```cpp
text.empty()
```

Например:

```cpp
if (text.empty())
{
    std::cout << "Text is empty\n";
}
```

Это обычно читается лучше, чем:

```cpp
if (text.size() == 0)
```

---

## Очистка строки

Чтобы удалить всё содержимое:

```cpp
text.clear();
```

После этого:

```cpp
text.empty()
```

вернёт `true`.

---

## Ввод строки

Обычный:

```cpp
std::cin >> text;
```

читает только одно слово.

Например, если пользователь вводит:

```text
Industrial Robot
```

то в `text` попадёт только:

```text
Industrial
```

---

## getline

Для чтения всей строки используется:

```cpp
std::getline(std::cin, text);
```

Например:

```cpp
std::string name;

std::getline(std::cin, name);
```

Теперь можно ввести:

```text
Industrial Robot
```

и вся строка будет сохранена.

---

## Проблема после cin

Если перед `getline()` использовался:

```cpp
std::cin >> number;
```

в потоке может остаться символ перевода строки.

Например:

```cpp
int age;
std::string name;

std::cin >> age;
std::getline(std::cin, name);
```

`getline()` может сразу получить пустую строку.

Обычно в таком случае используют:

```cpp
std::cin.ignore(
    std::numeric_limits<std::streamsize>::max(),
    '\n'
);
```

Для этого понадобится:

```cpp
#include <limits>
```

---

## Поиск текста

Для поиска используется:

```cpp
find()
```

Например:

```cpp
std::string text = "Industrial Robot";

std::size_t position = text.find("Robot");
```

Если найдено:

```text
10
```

Если не найдено, возвращается:

```cpp
std::string::npos
```

Поэтому проверка:

```cpp
if (position != std::string::npos)
{
    std::cout << "Found\n";
}
```

---

## Поиск символа

Можно искать один символ:

```cpp
std::size_t position = text.find('R');
```

Также можно искать начиная с определённой позиции:

```cpp
std::size_t position = text.find(
    'o',
    5
);
```

---

## Поиск последнего вхождения

Есть:

```cpp
rfind()
```

Например:

```cpp
std::string text = "robot motor robot";

std::size_t position = text.rfind("robot");
```

Будет найдено последнее вхождение.

---

## Извлечение части строки

Метод:

```cpp
substr()
```

возвращает часть строки.

Например:

```cpp
std::string text = "Industrial Robot";

std::string part = text.substr(
    0,
    10
);
```

Получим:

```text
Industrial
```

Первый параметр — начальная позиция.

Второй — количество символов.

---

## substr без второго параметра

Можно написать:

```cpp
std::string part = text.substr(11);
```

Тогда строка будет взята от позиции `11` до конца.

---

## Удаление

Метод:

```cpp
erase()
```

позволяет удалить часть строки.

Например:

```cpp
std::string text = "Hello World";

text.erase(5, 6);
```

Получится:

```text
Hello
```

---

## Замена

Метод:

```cpp
replace()
```

может заменить часть строки.

Например:

```cpp
std::string text = "Hello World";

text.replace(
    6,
    5,
    "Robot"
);
```

Получится:

```text
Hello Robot
```

---

## Добавление в конец

Можно использовать:

```cpp
append()
```

Например:

```cpp
std::string text = "Hello";

text.append(" Robot");
```

Получится:

```text
Hello Robot
```

Но в простых случаях:

```cpp
text += " Robot";
```

обычно читается проще.

---

## Работа с несколькими строками

Поскольку `std::string` является типом, его можно хранить в контейнерах STL.

Например:

```cpp
std::vector<std::string> names = {
    "Motor",
    "Camera",
    "Battery"
};
```

Для этого нужно:

```cpp
#include <vector>
#include <string>
```

Перебор:

```cpp
for (const std::string& name : names)
{
    std::cout << name << '\n';
}
```

---

## Сортировка строк

`std::string` можно сортировать через STL:

```cpp
std::vector<std::string> names = {
    "Motor",
    "Camera",
    "Battery"
};

std::sort(
    names.begin(),
    names.end()
);
```

Получим лексикографический порядок.

---

## Поиск строки в vector

Можно использовать:

```cpp
auto it = std::find(
    names.begin(),
    names.end(),
    "Camera"
);
```

Проверка:

```cpp
if (it != names.end())
{
    std::cout << "Camera found\n";
}
```

Это показывает важную идею STL: контейнеры и алгоритмы работают вместе.

---

## Строка как последовательность символов

Полезно воспринимать `std::string` не только как специальный тип текста, но и как последовательность символов.

У неё есть:

```text
индексы
begin()
end()
size()
front()
back()
```

Поэтому многие алгоритмы STL можно использовать со строками.

Например:

```cpp
std::reverse(
    text.begin(),
    text.end()
);
```

Для:

```text
Robot
```

получим:

```text
toboR
```

---

## Подсчёт символов

Можно использовать:

```cpp
std::count()
```

Например:

```cpp
std::string text = "robot motor";

int count = std::count(
    text.begin(),
    text.end(),
    'o'
);
```

Теперь `count` содержит количество символов `o`.

---

## Преобразование регистра

Для отдельных символов можно использовать функции из:

```cpp
#include <cctype>
```

Например:

```cpp
char symbol = 'a';

symbol = std::toupper(symbol);
```

Для преобразования всей строки:

```cpp
for (char& symbol : text)
{
    symbol = static_cast<char>(
        std::toupper(
            static_cast<unsigned char>(symbol)
        )
    );
}
```

Это немного более низкоуровневый код, но он показывает, что строка состоит из отдельных символов.

---

## Важный момент про Unicode

`std::string` хранит последовательность байтов, а не абстрактные «символы человеческого языка».

Для ASCII это выглядит просто:

```text
A → один байт
B → один байт
```

Но UTF-8 символы могут занимать несколько байтов.

Например, русский текст в UTF-8 не означает:

```text
один русский символ = один char
```

Поэтому:

```cpp
text.size()
```

для UTF-8 обычно возвращает количество байтов, а не количество видимых пользователем символов.

Это важно учитывать при работе с международным текстом.

---

## c_str()

Иногда C++ код взаимодействует со старым C API, которому требуется:

```cpp
const char*
```

Для этого у `std::string` есть:

```cpp
text.c_str()
```

Например:

```cpp
const char* rawText = text.c_str();
```

Не нужно освобождать память, возвращённую `c_str()`, через `delete`.

Строка сама управляет своей памятью.

---

## Пример конфигурации

Строки часто используются для хранения настроек:

```cpp
struct Device
{
    std::string name;
    std::string address;
    int port;
};
```

Можно создать:

```cpp
Device device{
    "Robot Controller",
    "192.168.1.100",
    5000
};
```

И вывести:

```cpp
std::cout << device.name << '\n';
std::cout << device.address << '\n';
std::cout << device.port << '\n';
```

Это уже приближено к реальным приложениям.

---

## Практический пример

Создадим простой обработчик имени устройства:

```cpp
#include <iostream>
#include <string>

int main()
{
    std::string deviceName;

    std::cout << "Enter device name: ";
    std::getline(std::cin, deviceName);

    if (deviceName.empty())
    {
        std::cout << "Name is empty\n";
        return 0;
    }

    std::cout << "Device: "
              << deviceName
              << '\n';

    std::cout << "Length: "
              << deviceName.size()
              << '\n';

    if (deviceName.find("Robot") != std::string::npos)
    {
        std::cout << "Robot device detected\n";
    }

    return 0;
}
```

Здесь мы одновременно используем:

```text
getline()
empty()
size()
find()
```

---

## Строки в робототехнике

В реальных системах строки могут использоваться для:

```text
имён устройств
IP-адресов
путей к файлам
названий конфигураций
сообщений
логов
идентификаторов
команд
JSON/XML
```

Например:

```cpp
std::string command = "MOVE 100";
```

Можно найти команду:

```cpp
if (command.starts_with("MOVE"))
{
    // обработка команды
}
```

Современный C++ также предоставляет методы:

```cpp
starts_with()
ends_with()
contains()
```

в соответствующих версиях стандарта.

---

## Главное

`std::string` — основной стандартный тип для обычной работы с текстом в C++.

Нужно хорошо знать:

```text
size()
empty()
operator[]
at()
front()
back()
find()
rfind()
substr()
erase()
replace()
clear()
append()
c_str()
```

Также важно понимать, что строка является последовательностью символов и может использоваться вместе с алгоритмами STL:

```cpp
std::sort()
std::find()
std::count()
std::reverse()
```

Для обычного C++ кода практически всегда стоит начинать именно с `std::string`, а не с ручного управления массивами `char`.

---

## Практика

### Задание 1

Запросите у пользователя строку через:

```cpp
std::getline()
```

Выведите:

* саму строку;
* её длину;
* первый символ;
* последний символ.

### Задание 2

Запросите строку и найдите в ней слово:

```text
robot
```

Выведите позицию, если слово найдено.

### Задание 3

Создайте строку:

```text
Industrial Robot Controller
```

Извлеките из неё только:

```text
Robot
```

используя `substr()`.

### Задание 4

Создайте строку с повторяющимися символами и посчитайте количество букв `o` через:

```cpp
std::count()
```

### Задание 5

Создайте:

```cpp
std::vector<std::string>
```

с названиями пяти устройств.

Отсортируйте их по алфавиту и выведите результат.

### Задание 6

Создайте простую программу обработки команды:

```text
MOVE 100
STOP
STATUS
```

Пользователь вводит команду, а программа определяет её тип через операции со строкой.