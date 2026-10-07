---
id: cpp-79
title: Многопоточный монитор
module_id: cpp
module_title: C++
module_order: 8
order: 79
---

# Многопоточный монитор

## Цель

В предыдущих уроках мы познакомились с потоками и синхронизацией. Теперь соберём из этих знаний небольшой практический проект.

Мы создадим многопоточный монитор, который одновременно:

* получает данные;
* проверяет их состояние;
* сохраняет последнее значение;
* сообщает о проблемах;
* работает до тех пор, пока пользователь не остановит программу.

После урока вы должны понимать, как организовать небольшое многопоточное приложение на C++ и как разделять ответственность между потоками.

---

## Что будем создавать

Представим промышленное устройство, например контроллер или датчик.

Программа должна периодически получать показание:

```text
Температура: 42.5 °C
```

и проверять его:

```text
0 ... 80 °C     → нормально
> 80 °C         → предупреждение
```

Для реалистичности сделаем несколько потоков:

```text
                    Monitor
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       Sensor       Checker        Logger
       thread       thread         thread
          │            │            │
          └────────────┴────────────┘
                    shared state
```

Потоки работают одновременно, поэтому общие данные необходимо защищать.

---

## Общие данные

Создадим структуру:

```cpp
struct SensorData
{
    double temperature = 0.0;
    bool valid = false;
};
```

Она будет хранить последнее измерение.

Несколько потоков будут обращаться к этим данным, поэтому добавим mutex:

```cpp
std::mutex dataMutex;
SensorData data;
```

---

## Поток датчика

В реальном приложении вместо генерации случайных значений здесь мог бы находиться код чтения:

* Modbus;
* OPC UA;
* CAN;
* последовательного порта;
* GPIO;
* другого источника данных.

Для учебного проекта создадим имитацию.

```cpp
#include <chrono>
#include <iostream>
#include <mutex>
#include <random>
#include <thread>

struct SensorData
{
    double temperature = 0.0;
    bool valid = false;
};

SensorData data;
std::mutex dataMutex;

void sensorThread()
{
    std::random_device rd;
    std::mt19937 generator(rd());

    std::uniform_real_distribution<double> distribution(20.0, 100.0);

    while (true)
    {
        double value = distribution(generator);

        {
            std::lock_guard<std::mutex> lock(dataMutex);

            data.temperature = value;
            data.valid = true;
        }

        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
}
```

Обратите внимание на область:

```cpp
{
    std::lock_guard<std::mutex> lock(dataMutex);

    data.temperature = value;
    data.valid = true;
}
```

Mutex блокируется при создании `lock_guard` и автоматически освобождается при выходе из блока.

---

## Поток проверки

Второй поток будет читать значение.

```cpp
void checkerThread()
{
    while (true)
    {
        double temperature;
        bool valid;

        {
            std::lock_guard<std::mutex> lock(dataMutex);

            temperature = data.temperature;
            valid = data.valid;
        }

        if (!valid)
        {
            std::cout << "Нет данных\n";
        }
        else if (temperature > 80.0)
        {
            std::cout << "ПРЕДУПРЕЖДЕНИЕ: высокая температура: "
                      << temperature << '\n';
        }
        else
        {
            std::cout << "Температура нормальная: "
                      << temperature << '\n';
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }
}
```

Здесь есть важный момент.

Мы не держим mutex во время всей проверки.

Сначала копируем необходимые значения:

```cpp
double temperature;
bool valid;

{
    std::lock_guard<std::mutex> lock(dataMutex);

    temperature = data.temperature;
    valid = data.valid;
}
```

После этого mutex освобождается.

И только затем выполняется остальная логика.

Это уменьшает время блокировки общего ресурса.

---

## Поток записи журнала

В большом приложении логирование также можно выполнять отдельно.

Например, основной поток передаёт события в очередь:

```text
Sensor
   ↓
Shared data
   ↓
Checker
   ↓
Log queue
   ↓
Logger
   ↓
log.txt
```

Такой подход позволяет не задерживать критическую часть программы из-за медленной записи на диск.

Для простого примера достаточно отдельного потока:

```cpp
void loggerThread()
{
    while (true)
    {
        std::cout << "[LOGGER] монитор работает\n";

        std::this_thread::sleep_for(
            std::chrono::seconds(5)
        );
    }
}
```

---

## Запуск потоков

Теперь создадим их:

```cpp
int main()
{
    std::thread sensor(sensorThread);
    std::thread checker(checkerThread);
    std::thread logger(loggerThread);

    sensor.join();
    checker.join();
    logger.join();
}
```

Метод:

```cpp
join()
```

означает, что основной поток будет ждать завершения соответствующего потока.

Но в нашем примере потоки работают бесконечно.

Поэтому программа никогда не завершится самостоятельно.

Для настоящего приложения это нужно исправить.

---

## Корректная остановка

Используем флаг остановки:

```cpp
std::atomic<bool> running{true};
```

Теперь каждый поток проверяет его:

```cpp
while (running)
{
    // работа
}
```

Например:

```cpp
void sensorThread()
{
    while (running)
    {
        // чтение датчика

        std::this_thread::sleep_for(
            std::chrono::seconds(1)
        );
    }
}
```

А основной поток может ждать команду пользователя:

```cpp
int main()
{
    std::thread sensor(sensorThread);
    std::thread checker(checkerThread);
    std::thread logger(loggerThread);

    std::cout << "Нажмите Enter для остановки\n";
    std::cin.get();

    running = false;

    sensor.join();
    checker.join();
    logger.join();

    std::cout << "Монитор остановлен\n";
}
```

Теперь приложение может корректно завершить работу.

---

## Полный пример

```cpp
#include <atomic>
#include <chrono>
#include <iostream>
#include <mutex>
#include <random>
#include <thread>

struct SensorData
{
    double temperature = 0.0;
    bool valid = false;
};

SensorData data;
std::mutex dataMutex;
std::atomic<bool> running{true};

void sensorThread()
{
    std::random_device rd;
    std::mt19937 generator(rd());

    std::uniform_real_distribution<double> distribution(
        20.0,
        100.0
    );

    while (running)
    {
        double value = distribution(generator);

        {
            std::lock_guard<std::mutex> lock(dataMutex);

            data.temperature = value;
            data.valid = true;
        }

        std::this_thread::sleep_for(
            std::chrono::seconds(1)
        );
    }
}

void checkerThread()
{
    while (running)
    {
        double temperature;
        bool valid;

        {
            std::lock_guard<std::mutex> lock(dataMutex);

            temperature = data.temperature;
            valid = data.valid;
        }

        if (!valid)
        {
            std::cout << "Нет данных\n";
        }
        else if (temperature > 80.0)
        {
            std::cout << "WARNING: "
                      << temperature << " C\n";
        }
        else
        {
            std::cout << "OK: "
                      << temperature << " C\n";
        }

        std::this_thread::sleep_for(
            std::chrono::milliseconds(500)
        );
    }
}

int main()
{
    std::thread sensor(sensorThread);
    std::thread checker(checkerThread);

    std::cout << "Монитор запущен\n";
    std::cout << "Нажмите Enter для остановки\n";

    std::cin.get();

    running = false;

    sensor.join();
    checker.join();

    std::cout << "Монитор остановлен\n";
}
```

---

## Что здесь важно

В этом небольшом проекте уже присутствуют несколько фундаментальных архитектурных идей:

```text
Источник данных
      ↓
  состояние
      ↓
  проверка
      ↓
  результат
```

При этом разные части системы работают независимо.

Это очень похоже на реальные приложения автоматизации.

Например:

```text
PLC / датчик
      ↓
Communication thread
      ↓
Shared state
      ↓
Monitoring thread
      ↓
Alarm system
      ↓
Logging thread
```

---

## Практическое задание

Расширите программу.

Добавьте:

1. давление;
2. уровень;
3. состояние соединения;
4. отдельные пороги для каждого параметра;
5. счётчик ошибок;
6. поток статистики.

Например:

```text
Temperature: 54.2 C
Pressure:    4.8 bar
Level:       72 %
Connection:  OK

Errors: 3
```

Затем добавьте команду остановки по слову:

```text
exit
```

Главная задача — не просто заставить программу работать, а правильно разделить данные между потоками и минимизировать время удержания mutex.

---

## Главное

Многопоточный монитор — это уже маленькая система, а не просто упражнение с `std::thread`.

В нём появляются реальные инженерные вопросы:

* кто владеет данными;
* кто их изменяет;
* кто их читает;
* как синхронизировать доступ;
* как остановить потоки;
* как избежать блокировок;
* как отделить получение данных от обработки.

Именно такие вопросы становятся важнее самого синтаксиса C++, когда программа начинает взаимодействовать с реальным оборудованием.