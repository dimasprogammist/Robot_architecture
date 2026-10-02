---
id: python-functions
title: Функции и разбиение программы на части
module_id: python
module_title: Python
module_order: 7
order: 10
---

# Функции и разбиение программы на части

## Зачем нужны функции

Представим программу, которая несколько раз должна рассчитывать скорость:

```python
distance = 100
time = 5

speed = distance / time

print(speed)
```

Если такой расчёт понадобится десять раз, можно копировать код.

Но копирование приводит к проблемам:

* код становится длинным;
* появляются дубликаты;
* исправления приходится делать в нескольких местах;
* программу сложнее понимать.

Для решения этой проблемы используются **функции**.

Функция позволяет объединить некоторый алгоритм под одним именем и вызывать его тогда, когда он нужен.

---

## Самая простая функция

```python
def say_hello():
    print("Hello")
```

Здесь:

```python
def
```

начинает определение функции.

Имя:

```text
say_hello
```

задаёт имя функции.

Скобки:

```text
()
```

содержат параметры.

А тело функции имеет отступ.

---

## Вызов функции

Само определение функции ничего не выводит.

Нужно её вызвать:

```python
say_hello()
```

Полная программа:

```python
def say_hello():
    print("Hello")


say_hello()
```

Результат:

```text
Hello
```

---

## Функцию можно вызвать несколько раз

```python
def say_hello():
    print("Hello")


say_hello()
say_hello()
say_hello()
```

Получим:

```text
Hello
Hello
Hello
```

Мы написали алгоритм один раз, но использовали его три раза.

---

## Параметры

Функция может получать данные.

Например:

```python
def greet(name):
    print("Hello,", name)
```

Теперь:

```python
greet("Dmitry")
greet("Alex")
```

Получим:

```text
Hello, Dmitry
Hello, Alex
```

`name` — параметр функции.

---

## Несколько параметров

```python
def add(a, b):
    print(a + b)
```

Вызов:

```python
add(10, 20)
```

Результат:

```text
30
```

---

## `return`

Часто функция должна не просто что-то выполнить, а вернуть результат.

Для этого используется `return`.

```python
def add(a, b):
    return a + b
```

Теперь:

```python
result = add(10, 20)

print(result)
```

Результат:

```text
30
```

---

## Разница между `print()` и `return`

Это очень важное различие.

Функция:

```python
def add(a, b):
    print(a + b)
```

выводит результат на экран.

Функция:

```python
def add(a, b):
    return a + b
```

возвращает результат вызывающему коду.

Например:

```python
result = add(10, 20)
```

После этого `result` можно использовать дальше:

```python
result = add(10, 20)

double = result * 2

print(double)
```

---

## Функция может вернуть значение любого типа

Например:

```python
def get_status():
    return "OK"
```

И:

```python
def is_ready():
    return True
```

И:

```python
def get_values():
    return [10, 20, 30]
```

Функции не ограничены числами.

---

## Несколько значений

Python позволяет вернуть несколько значений:

```python
def get_position():
    return 10.5, 20.3
```

Фактически возвращается кортеж.

Можно написать:

```python
x, y = get_position()

print(x)
print(y)
```

---

## Локальные переменные

Рассмотрим:

```python
def calculate():
    value = 10
    return value
```

Переменная `value` существует внутри функции.

Снаружи:

```python
print(value)
```

так работать не будет, потому что `value` является локальной переменной функции.

---

## Почему локальные переменные полезны

Представим:

```python
def calculate_temperature(value):
    limit = 80

    return value > limit
```

Переменная:

```python
limit
```

нужна только для работы алгоритма.

Нет необходимости создавать её глобально.

Это уменьшает количество переменных, которые нужно контролировать во всей программе.

---

## Параметры и аргументы

Есть небольшая терминологическая разница.

В определении:

```python
def add(a, b):
    return a + b
```

`a` и `b` — параметры.

При вызове:

```python
add(10, 20)
```

`10` и `20` — аргументы.

На практике эти слова часто используют нестрого, но различие полезно знать.

---

## Значения по умолчанию

Можно задать значение параметра по умолчанию:

```python
def greet(name="Robot"):
    print("Hello,", name)
```

Теперь:

```python
greet()
```

выведет:

```text
Hello, Robot
```

А:

```python
greet("Dmitry")
```

выведет:

```text
Hello, Dmitry
```

---

## Именованные аргументы

Можно передавать аргументы по имени:

```python
def move(x, y, speed):
    print(x, y, speed)
```

Вызов:

```python
move(x=100, y=50, speed=20)
```

Такой способ особенно удобен, когда параметров много.

---

## Функция может использовать условия

Например:

```python
def check_temperature(temperature):
    if temperature > 80:
        return False

    return True
```

Теперь:

```python
if check_temperature(75):
    print("Temperature OK")
```

---

## Функция может использовать циклы

Например:

```python
def count_high(values, limit):
    count = 0

    for value in values:
        if value > limit:
            count += 1

    return count
```

Использование:

```python
temperatures = [45, 82, 91, 63]

result = count_high(temperatures, 80)

print(result)
```

Результат:

```text
2
```

---

## Функции позволяют разделять ответственность

Большую программу не стоит писать одним огромным блоком.

Например, программа робота может быть разделена:

```python
def read_sensors():
    ...


def calculate_command():
    ...


def check_safety():
    ...


def send_command():
    ...
```

Каждая функция выполняет свою задачу.

Общая программа становится понятнее.

---

## Функция как отдельный алгоритм

Хорошая функция обычно отвечает на вопрос:

> что именно она делает?

Например:

```python
def calculate_average(values):
    ...
```

понятно по названию.

А:

```python
def process_data():
    ...
```

может быть слишком общим названием, если функция выполняет десять разных действий.

Имена функций должны объяснять назначение.

---

## Функция вычисления среднего

Можно написать:

```python
def calculate_average(values):
    total = 0

    for value in values:
        total += value

    return total / len(values)
```

Использование:

```python
temperatures = [20, 22, 24, 26]

average = calculate_average(temperatures)

print(average)
```

Результат:

```text
23.0
```

---

## Проверка входных данных

Функция может проверять параметры:

```python
def calculate_average(values):
    if not values:
        return None

    total = 0

    for value in values:
        total += value

    return total / len(values)
```

Теперь для пустого списка:

```python
result = calculate_average([])
```

получим:

```text
None
```

Это лучше, чем попытка разделить на ноль.

---

## Практический пример: двигатель

Создадим функцию проверки:

```python
def can_start_motor(temperature, pressure, emergency_stop):
    if emergency_stop:
        return False

    if temperature >= 80:
        return False

    if pressure >= 10:
        return False

    return True
```

Теперь:

```python
temperature = 65
pressure = 5
emergency_stop = False

if can_start_motor(temperature, pressure, emergency_stop):
    print("Motor start allowed")
else:
    print("Motor start blocked")
```

Функция скрывает детали проверки.

Главная программа теперь читается почти как обычное предложение:

```text
если двигатель можно запустить
    разрешить запуск
иначе
    заблокировать запуск
```

---

## Функция с несколькими возвращаемыми данными

Например:

```python
def analyze_temperature(values):
    minimum = min(values)
    maximum = max(values)
    average = sum(values) / len(values)

    return minimum, maximum, average
```

Использование:

```python
values = [45, 50, 63, 72]

minimum, maximum, average = analyze_temperature(values)

print(minimum)
print(maximum)
print(average)
```

---

## Почему функции уменьшают сложность

Без функций:

```text
главная программа
 ├─ чтение датчиков
 ├─ проверка температуры
 ├─ проверка давления
 ├─ вычисление скорости
 ├─ проверка аварии
 ├─ отправка команды
 ├─ повторная проверка
 └─ ...
```

С функциями:

```text
main
 ├─ read_sensors()
 ├─ check_safety()
 ├─ calculate_command()
 └─ send_command()
```

Второй вариант легче читать.

Каждую функцию можно изучать отдельно.

---

## Функции и повторное использование

Допустим, нужно проверить десять двигателей.

Можно написать:

```python
for motor in motors:
    if can_start_motor(
        motor["temperature"],
        motor["pressure"],
        motor["emergency_stop"]
    ):
        print(motor["name"], "OK")
```

Алгоритм проверки существует в одном месте:

```python
can_start_motor(...)
```

Если правило изменится, его можно изменить внутри функции.

---

## Хорошая функция

Хорошая функция обычно:

* имеет понятное имя;
* делает одну логическую задачу;
* получает необходимые данные через параметры;
* возвращает результат;
* не содержит лишних скрытых зависимостей.

Например:

```python
def calculate_speed(distance, time):
    return distance / time
```

Очень легко понять, что она делает.

---

## Слишком большая функция

Плохой вариант:

```python
def process_robot():
    # читаем сеть
    # читаем датчики
    # проверяем безопасность
    # рассчитываем координаты
    # пишем файл
    # отправляем команды
    # рисуем интерфейс
    # отправляем отчёт
    ...
```

Здесь слишком много ответственности.

Лучше разделить:

```python
def read_sensors():
    ...


def check_safety():
    ...


def calculate_position():
    ...


def send_command():
    ...
```

---

## Практическое задание

Создайте функцию:

```python
def calculate_speed(distance, time):
    ...
```

Она должна возвращать скорость.

Проверьте:

```python
print(calculate_speed(100, 5))
```

Затем создайте:

```python
def is_safe_temperature(temperature, limit):
    ...
```

Она должна возвращать `True`, если температура ниже лимита.

---

## Задание посложнее

Создайте функцию:

```python
def analyze_robot(robot):
    ...
```

Она получает словарь:

```python
robot = {
    "name": "R1",
    "battery": 75,
    "temperature": 45,
    "connected": True
}
```

Функция должна вернуть `True`, если:

```text
battery >= 30
temperature < 70
connected == True
```

Используйте функцию:

```python
if analyze_robot(robot):
    print("Robot ready")
else:
    print("Robot not ready")
```

---

## Ещё одно задание

Создайте функцию:

```python
def find_max_temperature(values):
    ...
```

Реализуйте поиск максимума самостоятельно через цикл, не используя `max()`.

Затем создайте:

```python
temperatures = [45, 63, 51, 82, 71]
```

и проверьте результат.

---

## Главное

Функция — это именованный блок программы, который можно вызывать многократно.

Базовая структура:

```python
def function_name(parameters):
    ...
```

Функцию можно вызвать:

```python
function_name(arguments)
```

Она может вернуть результат:

```python
return value
```

Функции позволяют:

* уменьшать дублирование;
* разделять программу на части;
* скрывать детали реализации;
* повторно использовать алгоритмы;
* упрощать тестирование;
* делать код понятнее.

Теперь у нас сформировался уже серьёзный фундамент Python:

```text
переменные
    ↓
типы данных
    ↓
операторы
    ↓
условия
    ↓
циклы
    ↓
коллекции
    ↓
словари
    ↓
функции
```

Следующий этап можно строить уже поверх этого фундамента: области видимости, модули, исключения, работа с файлами и более глубокая модель объектов Python.