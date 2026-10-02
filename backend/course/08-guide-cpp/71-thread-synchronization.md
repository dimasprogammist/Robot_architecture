---
id: cpp-71
title: Синхронизация потоков
module_id: cpp
module_title: C++
module_order: 8
order: 71
---

# Синхронизация потоков

## Цель

В предыдущих уроках мы создали несколько потоков и увидели, что они могут одновременно работать с одними и теми же данными.

Это даёт производительность и удобство, но создаёт новую проблему: нужно управлять взаимодействием между потоками.

После урока вы должны понимать:

* зачем нужна синхронизация;
* что такое критическая секция;
* как работает `std::mutex`;
* чем отличаются `lock_guard`, `unique_lock` и `scoped_lock`;
* как использовать `std::condition_variable`;
* когда нужен `std::atomic`;
* что такое deadlock и как его избегать;
* как организовать безопасный обмен данными между потоками.

---

## Почему потокам нужно договариваться

Представим два потока:

```text
Thread A → записывает данные
Thread B → читает данные
```

И общий объект:

```cpp
SensorData data;
```

Если Thread A изменяет объект одновременно с тем, как Thread B его читает, Thread B может увидеть неконсистентное состояние.

Например, вместо:

```text
temperature = 25.4
pressure    = 101.3
```

теоретически можно получить ситуацию, когда одно поле уже обновилось, а второе ещё нет.

Нам нужен механизм, который определит:

```text
кто сейчас имеет доступ к данным
```

---

## Mutex

`std::mutex` — один из основных механизмов синхронизации.

```cpp
#include <mutex>

std::mutex mutex;
```

Поток может захватить mutex:

```cpp
mutex.lock();
```

После этого другой поток не сможет захватить тот же mutex, пока первый его не освободит:

```cpp
mutex.unlock();
```

Схематично:

```text
Thread A
   │
   ├── lock
   │
   ├── работа с данными
   │
   └── unlock
          ↓
Thread B
   └── lock
```

---

## Почему ручной `unlock()` опасен

Можно написать:

```cpp
mutex.lock();

doSomething();

mutex.unlock();
```

Но представим:

```cpp
mutex.lock();

doSomething(); // здесь возникла ошибка

mutex.unlock();
```

Если управление выйдет из функции до `unlock()`, mutex останется заблокированным.

Другой поток будет ждать его бесконечно.

Поэтому в современном C++ предпочитают RAII.

---

## `std::lock_guard`

Самый простой вариант:

```cpp
std::lock_guard<std::mutex> lock(mutex);
```

После создания объекта mutex блокируется.

Когда объект уничтожается:

```text
lock_guard уничтожен
        ↓
mutex автоматически освобождён
```

Пример:

```cpp
void increment() {
    std::lock_guard<std::mutex> lock(mutex);

    ++counter;
}
```

Это безопаснее ручного управления блокировкой.

---

## Область действия блокировки

Очень важно понимать область действия `lock_guard`.

Например:

```cpp
void update() {
    {
        std::lock_guard<std::mutex> lock(mutex);
        sharedValue = 42;
    }

    doSomethingSlow();
}
```

Mutex удерживается только внутри блока.

После:

```cpp
}
```

блокировка освобождается.

Это позволяет другим потокам работать с данными.

---

## Не держите mutex дольше необходимого

Плохой вариант:

```cpp
std::lock_guard<std::mutex> lock(mutex);

readSensor();
processLargeData();
writeFile();
sendNetworkPacket();
```

Здесь mutex удерживается во время нескольких потенциально долгих операций.

Лучше:

```cpp
auto sensorData = readSensor();

{
    std::lock_guard<std::mutex> lock(mutex);
    sharedData = sensorData;
}

processLargeData(sensorData);
writeFile(sensorData);
sendNetworkPacket(sensorData);
```

Общий объект защищён только в момент изменения.

---

## `std::scoped_lock`

Если нужно заблокировать несколько mutex, можно использовать:

```cpp
std::scoped_lock lock(mutexA, mutexB);
```

Например:

```cpp
std::mutex dataMutex;
std::mutex logMutex;

void process() {
    std::scoped_lock lock(dataMutex, logMutex);

    // работа с обоими ресурсами
}
```

Это удобнее и безопаснее, чем самостоятельно блокировать несколько mutex.

---

## Почему несколько mutex опасны

Рассмотрим:

```text
Thread A:
lock(A)
lock(B)

Thread B:
lock(B)
lock(A)
```

Получается:

```text
A держит A и ждёт B
B держит B и ждёт A
```

Оба ждут друг друга.

Это deadlock.

---

## Deadlock

**Deadlock** — состояние, в котором потоки блокируют друг друга и ни один не может продолжить выполнение.

Например:

```text
Thread A
   ↓
mutex A
   ↓
ждёт mutex B
```

и:

```text
Thread B
   ↓
mutex B
   ↓
ждёт mutex A
```

Программа может просто «зависнуть».

---

## Как избегать deadlock

Первое правило — придерживаться единого порядка захвата ресурсов.

Например:

```text
всегда сначала A
потом B
```

Тогда:

```text
Thread A: A → B
Thread B: A → B
```

а не:

```text
Thread A: A → B
Thread B: B → A
```

Использование:

```cpp
std::scoped_lock
```

также помогает безопасно захватывать несколько mutex.

---

## `std::unique_lock`

`std::unique_lock` предоставляет более гибкое управление mutex.

```cpp
std::unique_lock<std::mutex> lock(mutex);
```

В отличие от `lock_guard`, его можно вручную временно освободить:

```cpp
lock.unlock();
```

и затем снова захватить:

```cpp
lock.lock();
```

Это особенно полезно вместе с `std::condition_variable`.

---

## Условные переменные

Иногда поток должен не просто ждать mutex.

Например:

```text
Producer → положил данные
Consumer → должен дождаться данных
```

Можно было бы постоянно проверять:

```cpp
while (!hasData) {
}
```

Но это плохой подход.

Поток будет постоянно занимать процессор.

Нам нужен механизм:

```text
спать
 ↓
ждать событие
 ↓
проснуться
```

Для этого используется:

```cpp
std::condition_variable
```

---

## Producer и Consumer

Типичная схема:

```text
Producer
   ↓
  Queue
   ↓
Consumer
```

Producer создаёт данные.

Consumer их обрабатывает.

Например:

```text
поток датчика
      ↓
очередь измерений
      ↓
поток обработки
```

---

## Простой пример `condition_variable`

```cpp
#include <condition_variable>
#include <iostream>
#include <mutex>
#include <thread>

std::mutex mutex;
std::condition_variable condition;

bool ready = false;

void worker() {
    std::unique_lock<std::mutex> lock(mutex);

    condition.wait(lock, [] {
        return ready;
    });

    std::cout << "Data is ready\n";
}

int main() {
    std::thread thread(worker);

    {
        std::lock_guard<std::mutex> lock(mutex);
        ready = true;
    }

    condition.notify_one();

    thread.join();
}
```

Здесь worker не крутится в цикле.

Он ожидает:

```cpp
ready == true
```

и просыпается после:

```cpp
condition.notify_one();
```

---

## Почему используется predicate

Можно написать:

```cpp
condition.wait(lock);
```

Но после пробуждения условие нужно проверять.

Поэтому часто используют:

```cpp
condition.wait(lock, [] {
    return ready;
});
```

Это означает:

> ждать до тех пор, пока условие не станет истинным.

Это важный паттерн.

---

## `notify_one`

```cpp
condition.notify_one();
```

будит один ожидающий поток.

Если ожидающих потоков несколько, можно использовать:

```cpp
condition.notify_all();
```

чтобы разбудить всех.

---

## Очередь сообщений

Рассмотрим более практический пример.

```cpp
std::queue<int> queue;
std::mutex mutex;
std::condition_variable condition;
```

Producer:

```cpp
{
    std::lock_guard<std::mutex> lock(mutex);
    queue.push(42);
}

condition.notify_one();
```

Consumer:

```cpp
std::unique_lock<std::mutex> lock(mutex);

condition.wait(lock, [] {
    return !queue.empty();
});

int value = queue.front();
queue.pop();
```

Теперь потоки могут безопасно обмениваться данными.

---

## Почему очередь удобнее общей переменной

Вместо:

```text
sharedData
```

можно использовать:

```text
Queue
```

Тогда producer может отправить несколько элементов:

```text
10
20
30
40
```

Consumer обработает их последовательно.

Это хорошо подходит для:

```text
датчиков
сетевых сообщений
логов
команд
событий
```

---

## Атомарные переменные

Для простых значений иногда достаточно:

```cpp
std::atomic<bool>
```

Например:

```cpp
std::atomic<bool> running = true;
```

Поток:

```cpp
while (running) {
    doWork();
}
```

Другой поток:

```cpp
running = false;
```

Для простого флага mutex не нужен.

---

## Но atomic не решает всё

Например:

```cpp
struct SensorData {
    double temperature;
    double pressure;
};
```

Нельзя просто заменить:

```cpp
SensorData
```

на один обычный `std::atomic<SensorData>` и считать задачу решённой.

Атомарность сложных операций требует отдельного проектирования.

Для нескольких связанных полей часто проще использовать mutex.

---

## `std::atomic_flag`

Есть и более низкоуровневые атомарные типы.

Например:

```cpp
std::atomic_flag flag;
```

Они полезны для специальных задач, но начинающему разработчику редко нужны напрямую.

Для обычных программ чаще используются:

```cpp
std::atomic<bool>
std::atomic<int>
```

и mutex.

---

## Синхронизация и производительность

Слишком частая блокировка может уменьшить производительность.

Например:

```cpp
for (int i = 0; i < 1000000; ++i) {
    std::lock_guard<std::mutex> lock(mutex);
    ++counter;
}
```

Mutex захватывается миллион раз.

Иногда лучше изменить архитектуру.

Например, каждый поток может считать локально:

```text
Thread A → localCounterA
Thread B → localCounterB
```

а затем объединить результаты.

---

## Минимизация общего состояния

Очень полезный принцип:

> Не делайте данные общими без необходимости.

Вместо:

```text
10 потоков
   ↓
один огромный shared object
```

лучше:

```text
Thread A → свои данные
Thread B → свои данные
Thread C → свои данные
```

и только необходимые результаты передавать через очереди или защищённые структуры.

Чем меньше shared state, тем меньше проблем с синхронизацией.

---

## Состояние приложения

Для промышленного приложения можно сделать:

```cpp
enum class State {
    Starting,
    Running,
    Error,
    Stopping
};
```

Если состояние читается и изменяется разными потоками, его нужно правильно синхронизировать.

Для простого состояния можно использовать:

```cpp
std::atomic<State> state;
```

если выбранный тип и используемая операция подходят для атомарного доступа.

---

## Остановка потоков

Потокам нужен контролируемый механизм завершения.

Простейший вариант:

```cpp
std::atomic<bool> running = true;
```

Рабочий поток:

```cpp
while (running) {
    process();
}
```

Основной:

```cpp
running = false;
worker.join();
```

В современном C++ также существует `std::jthread`, который упрощает управление временем жизни потока и остановкой.

---

## `std::jthread`

В C++20 появился:

```cpp
std::jthread
```

Он автоматически присоединяется при уничтожении и поддерживает механизм остановки через `stop_token`.

Например:

```cpp
#include <thread>

void worker(std::stop_token token) {
    while (!token.stop_requested()) {
        doWork();
    }
}

int main() {
    std::jthread thread(worker);
}
```

При завершении области действия `jthread` корректно взаимодействует с жизненным циклом потока.

Для новых проектов на C++20 и новее `std::jthread` часто удобнее обычного `std::thread`.

---

## Синхронизация в робототехнике

Представим робота:

```text
Sensor Thread
      ↓
Sensor Queue
      ↓
Processing Thread
      ↓
Command Queue
      ↓
Motor Thread
```

Каждая часть выполняет свою задачу.

Очереди отделяют компоненты друг от друга.

Это позволяет избежать ситуации, когда каждый поток напрямую изменяет данные каждого другого потока.

---

## Синхронизация в промышленном мониторинге

Можно построить:

```text
OPC UA Thread
      ↓
Measurement Queue
      ↓
Processing
      ↓
Alarm Queue
      ↓
GUI / Logger
```

Например, поток OPC UA получил:

```text
Level_Bunker_1 = 73.4
```

Он помещает измерение в очередь.

Другой поток обрабатывает его.

GUI получает уже готовое состояние.

Это проще масштабировать, чем десятки потоков, напрямую изменяющих один глобальный объект.

---

## Главное

Основные инструменты:

```text
std::mutex
std::lock_guard
std::unique_lock
std::scoped_lock
std::condition_variable
std::atomic
std::jthread
```

Главные идеи:

```text
mutex
→ защищает общий ресурс

condition_variable
→ позволяет ждать событие

atomic
→ безопасно работает с простыми атомарными значениями

queue
→ удобный способ обмена между потоками
```

---

## Практика

### Задание 1

Создайте общий счётчик и два потока.

Исправьте программу с помощью:

```cpp
std::mutex
std::lock_guard
```

---

### Задание 2

Создайте:

```text
Producer
Consumer
```

Producer добавляет числа в очередь.

Consumer извлекает их.

Используйте:

```cpp
std::condition_variable
```

---

### Задание 3

Добавьте:

```cpp
std::atomic<bool> running
```

и сделайте корректную остановку worker-потока.

---

### Задание 4

Переделайте программу на:

```cpp
std::jthread
```

если используете C++20 или новее.

---

### Задание 5

Спроектируйте многопоточную систему мониторинга:

```text
поток получения данных
поток обработки
поток записи логов
```

Определите:

* какие данные будут общими;
* где нужны mutex;
* где можно использовать очередь;
* где достаточно `atomic`.

---

## Что дальше

Теперь мы разобрали потоки и их синхронизацию.

Следующая тема — **сетевое программирование**: IP-адреса, порты, TCP, UDP, клиент, сервер и то, как C++ программа может обмениваться данными с другим компьютером.