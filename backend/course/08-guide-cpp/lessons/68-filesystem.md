---
id: cpp-68
title: Файлы и файловая система
module_id: cpp
module_title: C++
module_order: 8
order: 68
---

# Файлы и файловая система

## Цель

Практически любая реальная программа работает с файлами.

Конфигурация приложения хранится в `config.json`, логи — в `.log`, данные — в `.csv`, результаты обработки — в отдельных файлах.

C++ предоставляет несколько инструментов для работы с файлами и каталогами.

После урока вы должны понимать:

* как открыть файл;
* как читать и записывать текст;
* чем отличаются `ifstream`, `ofstream` и `fstream`;
* как проверить успешность открытия файла;
* что такое абсолютный и относительный путь;
* как работать с каталогами через `std::filesystem`;
* как избежать типичных ошибок при работе с файлами.

---

## Что такое файл

Файл — это именованная область данных, сохранённая файловой системой.

Например:

```text
config.json
log.txt
measurements.csv
image.png
firmware.bin
```

Файл может содержать текст или бинарные данные.

Для программы файл — это способ сохранить информацию вне оперативной памяти процесса.

Например:

```text
Программа
   ↓
config.json
```

После завершения программы данные из файла останутся на диске.

---

## Почему файлы нужны программам

Без файлов большинство программ не смогли бы сохранять состояние между запусками.

Например, приложение мониторинга может хранить:

```text
config.json
logs/
history/
statistics/
```

После перезапуска программа снова читает конфигурацию и продолжает работу.

---

## `ofstream`

Для записи текста в файл используется:

```cpp
#include <fstream>
```

Простейший пример:

```cpp
#include <fstream>

int main() {
    std::ofstream file("data.txt");

    file << "Hello\n";
    file << "C++\n";
}
```

После выполнения появится:

```text
data.txt
```

с содержимым:

```text
Hello
C++
```

---

## Проверка открытия

Нельзя предполагать, что файл всегда успешно откроется.

Правильно:

```cpp
#include <fstream>
#include <iostream>

int main() {
    std::ofstream file("data.txt");

    if (!file) {
        std::cerr << "Не удалось открыть файл\n";
        return 1;
    }

    file << "Hello\n";
}
```

Причиной ошибки может быть:

* отсутствие каталога;
* недостаток прав;
* неверный путь;
* недоступный диск;
* блокировка файла;
* другие проблемы файловой системы.

---

## `ifstream`

Если нужно читать файл, используется `std::ifstream`.

```cpp
#include <fstream>
#include <iostream>

int main() {
    std::ifstream file("data.txt");

    if (!file) {
        std::cerr << "Не удалось открыть файл\n";
        return 1;
    }

    std::string line;

    while (std::getline(file, line)) {
        std::cout << line << '\n';
    }
}
```

`std::getline` читает одну строку за раз.

---

## Чтение всего текста построчно

Это один из самых удобных способов обработки текстовых файлов.

```cpp
std::string line;

while (std::getline(file, line)) {
    // обработка строки
}
```

Например, лог:

```text
2026-10-02 INFO Server started
2026-10-02 INFO Connected
2026-10-02 ERROR Connection lost
```

можно читать строка за строкой.

---

## `fstream`

`std::fstream` позволяет одновременно читать и записывать файл.

```cpp
#include <fstream>

int main() {
    std::fstream file(
        "data.txt",
        std::ios::in | std::ios::out
    );
}
```

Но для большинства простых задач удобнее использовать отдельно:

```text
ifstream → чтение
ofstream → запись
```

---

## Режимы открытия

Файл можно открыть в разных режимах.

Например:

```cpp
std::ofstream file(
    "data.txt",
    std::ios::app
);
```

`std::ios::app` означает добавление данных в конец файла.

Если написать:

```cpp
file << "Новая запись\n";
```

существующее содержимое не будет перезаписано.

---

## Перезапись файла

Обычный:

```cpp
std::ofstream file("data.txt");
```

обычно открывает файл для записи с очисткой существующего содержимого.

Например, если было:

```text
AAA
BBB
CCC
```

после:

```cpp
std::ofstream file("data.txt");
file << "NEW\n";
```

останется:

```text
NEW
```

Поэтому при работе с логами часто используют `std::ios::app`.

---

## Добавление в лог

```cpp
#include <fstream>

int main() {
    std::ofstream log(
        "application.log",
        std::ios::app
    );

    if (!log) {
        return 1;
    }

    log << "Application started\n";
}
```

Каждый запуск добавит новую строку.

---

## Закрытие файла

Можно явно закрыть файл:

```cpp
file.close();
```

Но обычно это не обязательно.

Объект файлового потока автоматически закрывает файл при уничтожении.

Например:

```cpp
{
    std::ofstream file("data.txt");

    file << "Hello\n";
}
```

После выхода из блока объект уничтожается, и файл закрывается.

Это пример принципа RAII, который особенно важен в C++.

---

## Чтение чисел

Файлы можно использовать не только для текста.

Например:

```text
10
20
30
40
```

Можно читать числа через оператор `>>`:

```cpp
#include <fstream>
#include <iostream>

int main() {
    std::ifstream file("numbers.txt");

    int value;

    while (file >> value) {
        std::cout << value << '\n';
    }
}
```

---

## Формат CSV

Например:

```text
1;12.5;10.2
2;15.1;14.8
3;17.3;16.9
```

Можно прочитать строки:

```cpp
std::string line;

while (std::getline(file, line)) {
    std::cout << line << '\n';
}
```

Разбор CSV — уже отдельная задача.

Для серьёзных форматов лучше использовать специализированные библиотеки или собственный парсер.

---

## Пути к файлам

Есть два основных вида путей.

### Относительный путь

```text
config.json
```

или:

```text
data/config.json
```

Он вычисляется относительно текущего рабочего каталога.

### Абсолютный путь

Windows:

```text
C:\Projects\Robot\config.json
```

Linux:

```text
/home/user/robot/config.json
```

---

## Почему относительные пути иногда ломаются

Предположим:

```cpp
std::ifstream file("config.json");
```

В IDE программа запускается из:

```text
C:\Projects\Robot
```

и файл находится:

```text
C:\Projects\Robot\config.json
```

Всё работает.

Но если `.exe` запускается из:

```text
C:\Users\User
```

поиск пойдёт туда.

Поэтому:

```text
программа работает в IDE
```

не гарантирует:

```text
программа работает из .exe
```

---

## `std::filesystem::path`

Для работы с путями в современном C++ используется:

```cpp
#include <filesystem>

namespace fs = std::filesystem;
```

Можно создать путь:

```cpp
fs::path path = "config.json";
```

Получить абсолютный путь:

```cpp
std::cout << fs::absolute(path) << '\n';
```

Проверить существование:

```cpp
if (fs::exists(path)) {
    std::cout << "Файл существует\n";
}
```

---

## Проверка файла

```cpp
if (fs::exists("config.json") &&
    fs::is_regular_file("config.json")) {

    std::cout << "Это обычный файл\n";
}
```

Это лучше, чем предполагать, что объект с таким именем обязательно является файлом.

---

## Каталоги

Можно создавать каталоги:

```cpp
std::filesystem::create_directory("logs");
```

Для вложенных каталогов:

```cpp
std::filesystem::create_directories("data/logs/2026");
```

Если каталоги уже существуют, поведение зависит от используемой функции и состояния файловой системы, поэтому при необходимости результат следует проверять.

---

## Перебор каталога

Можно получить содержимое каталога:

```cpp
#include <filesystem>
#include <iostream>

namespace fs = std::filesystem;

int main() {
    for (const auto& entry : fs::directory_iterator(".")) {
        std::cout << entry.path() << '\n';
    }
}
```

Программа выведет файлы и каталоги текущей директории.

---

## Файлы и каталоги в приложении

Представим структуру:

```text
RobotMonitor/
├── RobotMonitor.exe
├── config.json
├── logs/
│   ├── 2026-10-01.log
│   └── 2026-10-02.log
└── data/
    └── measurements.csv
```

Программа может:

```text
прочитать config.json
        ↓
создать logs/
        ↓
записывать события
        ↓
сохранять measurements.csv
```

Это типичная архитектура небольшого приложения.

---

## Ошибки файловой системы

Файловые операции могут завершиться ошибкой.

Например:

```cpp
try {
    std::filesystem::create_directories("logs");
}
catch (const std::filesystem::filesystem_error& error) {
    std::cerr << error.what() << '\n';
}
```

Многие функции `std::filesystem` имеют варианты с `std::error_code`, позволяющие обрабатывать ошибки без исключений.

Например:

```cpp
std::error_code ec;

std::filesystem::create_directories(
    "logs",
    ec
);

if (ec) {
    std::cerr << ec.message() << '\n';
}
```

Какой подход выбрать, зависит от архитектуры программы.

---

## Безопасность путей

Нельзя бездумно использовать путь, который пришёл от пользователя.

Например:

```text
../../../../secret.txt
```

может попытаться выйти из разрешённого каталога.

В приложениях, которые работают с внешними входными данными, пути нужно проверять и ограничивать.

Это особенно важно для серверов и сетевых приложений.

---

## Бинарные файлы

Не все файлы являются текстовыми.

Например:

```text
image.png
firmware.bin
database.db
model.bin
```

Для бинарного режима можно использовать:

```cpp
std::ifstream file(
    "data.bin",
    std::ios::binary
);
```

Чтение бинарных данных требует понимания их формата.

Нельзя просто считать произвольный `.bin` файл и ожидать, что полученные байты автоматически станут правильными объектами C++.

---

## Практический пример: логирование

Создадим простую функцию:

```cpp
#include <fstream>
#include <string>

void writeLog(const std::string& message) {
    std::ofstream file(
        "application.log",
        std::ios::app
    );

    if (!file) {
        return;
    }

    file << message << '\n';
}
```

Теперь:

```cpp
int main() {
    writeLog("Application started");
    writeLog("Device connected");
    writeLog("Measurement received");
}
```

Получим:

```text
Application started
Device connected
Measurement received
```

---

## Практический пример: конфигурация

Пусть есть:

```text
config.txt
```

содержимым:

```text
192.168.8.149
4861
```

Можно прочитать:

```cpp
#include <fstream>
#include <iostream>
#include <string>

int main() {
    std::ifstream file("config.txt");

    if (!file) {
        std::cerr << "Config not found\n";
        return 1;
    }

    std::string address;
    int port;

    file >> address;
    file >> port;

    std::cout << "Address: " << address << '\n';
    std::cout << "Port: " << port << '\n';
}
```

Для настоящих приложений конфигурация часто хранится в JSON, YAML, TOML или другом структурированном формате.

---

## RAII и файлы

Одна из сильных сторон C++ — автоматическое управление ресурсами.

Например:

```cpp
{
    std::ofstream file("log.txt");

    if (file) {
        file << "Hello\n";
    }
}
```

Когда `file` выходит из области видимости, его деструктор освобождает ресурс.

Это гораздо безопаснее, чем вручную управлять временем жизни каждого ресурса.

---

## Главное

Для файлового ввода-вывода нужно помнить:

```text
ifstream  → чтение
ofstream  → запись
fstream   → чтение + запись
```

Для путей:

```text
std::filesystem::path
```

Для проверки:

```cpp
std::filesystem::exists()
std::filesystem::is_regular_file()
std::filesystem::is_directory()
```

Для каталогов:

```cpp
create_directory()
create_directories()
directory_iterator
```

И главное — всегда учитывать возможность ошибки.

---

## Практика

### Задание 1

Создайте программу, которая создаёт:

```text
logs/
```

если каталога ещё нет.

---

### Задание 2

Создайте:

```text
logs/application.log
```

и добавляйте туда сообщения:

```text
Application started
Device connected
Device checked
```

Каждый запуск программы не должен удалять старые записи.

---

### Задание 3

Создайте программу, которая читает файл построчно и выводит его содержимое в консоль.

---

### Задание 4

Получите:

```cpp
std::filesystem::current_path()
```

и выведите его.

Затем попробуйте открыть файл по относительному пути.

---

### Задание 5

Создайте каталог:

```text
data/measurements
```

одной операцией.

---

### Задание 6

Напишите программу, которая перебирает текущий каталог и выводит только обычные файлы.

---

## Что дальше

Теперь мы умеем работать с файлами и файловой системой.

Следующий шаг — научиться выполнять несколько независимых задач внутри одного процесса. Для этого нужны **потоки**.