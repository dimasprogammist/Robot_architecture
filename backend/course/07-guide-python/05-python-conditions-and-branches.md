---
id: python-conditions-and-branches
title: Условия и ветвления
module_id: python
module_title: Python
module_order: 7
order: 5
---

# Условия и ветвления

## Зачем программе нужны условия

До этого наши программы выполняли инструкции последовательно.

Например:

```python
temperature = 75

print("Temperature:", temperature)
print("Check completed")
```

Но реальные программы должны принимать решения.

Например:

```text
если температура слишком высокая
    остановить двигатель

иначе
    продолжить работу
```

Или:

```text
если датчик сработал
    включить привод

иначе
    оставить привод выключенным
```

Для этого в Python используется конструкция `if`.

---

## Простое условие

Самый простой вариант:

```python
temperature = 75

if temperature > 70:
    print("Temperature is high")
```

Сначала Python вычисляет:

```python
temperature > 70
```

Получается:

```text
True
```

Поэтому тело `if` выполняется.

---

## Структура `if`

Общая форма:

```python
if условие:
    действие
```

Обрати внимание на две вещи:

1. после условия ставится `:`;
2. тело блока имеет отступ.

Например:

```python
if speed > 1000:
    print("Motor is running")
```

---

## Что происходит при False

Рассмотрим:

```python
temperature = 60

if temperature > 70:
    print("Temperature is high")

print("Program continues")
```

Условие:

```text
60 > 70
```

ложно.

Поэтому:

```python
print("Temperature is high")
```

не выполняется.

Но:

```python
print("Program continues")
```

выполнится.

Получим:

```text
Program continues
```

---

## `else`

Если нужно выполнить другой блок, используется `else`:

```python
temperature = 60

if temperature > 70:
    print("Temperature is high")
else:
    print("Temperature is normal")
```

Получим:

```text
Temperature is normal
```

Логика:

```text
          temperature > 70?
             /       \
          True       False
           /           \
        high          normal
```

---

## Практический пример

Для двигателя:

```python
temperature = 85

if temperature > 80:
    print("STOP MOTOR")
else:
    print("Motor can continue")
```

Такой принцип является основой огромного количества алгоритмов автоматизации.

---

## Несколько вариантов — `elif`

Иногда вариантов больше двух.

Например:

```text
температура < 50
    нормально

50–80
    предупреждение

> 80
    авария
```

В Python:

```python
temperature = 65

if temperature < 50:
    print("Normal")
elif temperature <= 80:
    print("Warning")
else:
    print("Alarm")
```

Python проверяет условия сверху вниз.

Как только найдено истинное условие, соответствующий блок выполняется, а остальные пропускаются.

---

## Порядок условий имеет значение

Рассмотрим:

```python
temperature = 90

if temperature > 50:
    print("Warm")
elif temperature > 80:
    print("Critical")
```

Получим:

```text
Warm
```

Почему?

Потому что первое условие уже истинно:

```text
90 > 50
```

До второго Python уже не доходит.

Поэтому условия нужно располагать логически правильно.

Например:

```python
if temperature > 80:
    print("Critical")
elif temperature > 50:
    print("Warm")
else:
    print("Normal")
```

Теперь `90` правильно попадёт в `Critical`.

---

## Несколько условий

Можно использовать `and`:

```python
temperature = 65
pressure = 8

if temperature < 80 and pressure < 10:
    print("System is ready")
```

Оба условия должны быть истинными.

---

## `or`

Например, авария должна возникнуть при превышении температуры **или** давления:

```python
temperature = 85
pressure = 5

if temperature > 80 or pressure > 10:
    print("ALARM")
```

Так как температура выше допустимой, условие истинно.

---

## `not`

Можно проверить отрицание:

```python
connected = False

if not connected:
    print("Connection lost")
```

---

## Вложенные условия

Условия могут находиться внутри других условий:

```python
enabled = True
temperature = 60

if enabled:
    if temperature < 80:
        print("Motor can run")
```

Логика:

```text
двигатель включён?
    ↓
да
    ↓
температура нормальная?
    ↓
да
    ↓
запустить
```

Однако чрезмерная вложенность быстро усложняет программу.

Часто можно записать проще:

```python
if enabled and temperature < 80:
    print("Motor can run")
```

---

## Условия и логика оборудования

Представим автоматизированную установку.

Есть:

```python
emergency_stop = False
door_closed = True
temperature = 55
pressure = 4
```

Условие запуска:

```python
if (
    not emergency_stop
    and door_closed
    and temperature < 80
    and pressure < 10
):
    print("Start allowed")
else:
    print("Start blocked")
```

Здесь несколько физических условий объединяются в одно логическое решение.

---

## Условия могут изменять переменные

Например:

```python
temperature = 85
motor_enabled = True

if temperature > 80:
    motor_enabled = False

print(motor_enabled)
```

Получим:

```text
False
```

То есть условие изменило состояние программы.

---

## Пример с уровнем жидкости

Представим бак:

```python
level = 25
```

Нужно определить состояние:

```python
if level < 20:
    print("Low level")
elif level > 90:
    print("High level")
else:
    print("Normal level")
```

Такая логика встречается в автоматизации постоянно.

---

## Проверка нескольких состояний

Например:

```python
mode = "AUTO"
```

Можно написать:

```python
if mode == "AUTO":
    print("Automatic mode")
elif mode == "MANUAL":
    print("Manual mode")
else:
    print("Unknown mode")
```

Это особенно удобно для программ, где существует несколько режимов работы.

---

## Сравнение строк

Например:

```python
command = input("Command: ")

if command == "start":
    print("Starting")
elif command == "stop":
    print("Stopping")
else:
    print("Unknown command")
```

Пользователь вводит команду, а программа выбирает ветку.

---

## Проверка диапазона

Можно использовать:

```python
temperature = 65

if 50 <= temperature <= 80:
    print("Temperature is normal")
```

Это удобная особенность Python.

Она читается почти как обычная математика:

```text
50 ≤ temperature ≤ 80
```

---

## Условия без явного сравнения

Python позволяет писать:

```python
connected = True

if connected:
    print("Connected")
```

вместо:

```python
if connected == True:
    print("Connected")
```

Первый вариант обычно лучше.

Для отрицательного состояния:

```python
if not connected:
    print("Disconnected")
```

---

## Истинные и ложные значения

В Python условие может использовать не только `True` и `False`.

Например:

```python
name = ""

if name:
    print("Name entered")
else:
    print("Name is empty")
```

Пустая строка считается ложной.

А:

```python
name = "Robot"
```

считается истинной в логическом контексте.

Аналогично пустой список:

```python
values = []

if values:
    print("List contains data")
else:
    print("List is empty")
```

---

## Типичная ошибка

Нельзя путать:

```python
=
```

и:

```python
==
```

Неправильно:

```python
if temperature = 80:
    print("OK")
```

Правильно:

```python
if temperature == 80:
    print("OK")
```

`=` — присваивание.

`==` — сравнение.

---

## Ещё одна типичная ошибка

Неправильно:

```python
if temperature > 70
    print("High")
```

После условия нужен `:`:

```python
if temperature > 70:
    print("High")
```

---

## Ошибка с отступами

Неправильно:

```python
if temperature > 70:
print("High")
```

Правильно:

```python
if temperature > 70:
    print("High")
```

Отступ показывает Python, какие инструкции принадлежат условию.

---

## Практический пример: контроль двигателя

Создадим небольшую программу:

```python
temperature = 65
speed = 1200
enabled = True
emergency_stop = False

if (
    enabled
    and not emergency_stop
    and temperature < 80
    and speed <= 1500
):
    print("Motor can run")
else:
    print("Motor must stop")
```

Попробуйте изменить:

```python
temperature = 85
```

и посмотреть, как изменится результат.

Затем:

```python
emergency_stop = True
```

и снова запустите программу.

---

## Практическое задание

Создайте программу контроля бака.

Есть:

```python
level = 45
pump_enabled = True
```

Программа должна вывести:

```text
"Low level"
```

если уровень меньше `20`;

```text
"Normal level"
```

если уровень от `20` до `80`;

```text
"High level"
```

если уровень больше `80`.

Дополнительно:

если насос выключен, программа должна вывести:

```text
"Pump disabled"
```

---

## Более сложное задание

Создайте программу разрешения запуска робота.

Исходные данные:

```python
battery = 75
temperature = 45
emergency_stop = False
door_closed = True
```

Робот может запускаться только если:

```text
заряд не ниже 30%
температура ниже 70 °C
аварийная остановка не активна
дверь закрыта
```

Если все условия выполнены:

```text
Robot start allowed
```

иначе:

```text
Robot start blocked
```

Затем изменяйте по одному параметру и проверяйте результат.

---

## Почему условия так важны

`if` — одна из фундаментальных конструкций программирования.

С её помощью программа начинает не просто выполнять команды, а **принимать решения на основании данных**.

Например:

```text
датчик
  ↓
значение
  ↓
условие
  ↓
решение
  ↓
действие
```

Этот принцип лежит в основе:

* автоматизации;
* серверов;
* игр;
* роботов;
* пользовательских интерфейсов;
* обработки данных;
* алгоритмов машинного обучения.

---

## Главное

После этого урока нужно понимать:

```python
if condition:
    ...
```

используется для выполнения блока при истинном условии.

```python
if condition:
    ...
else:
    ...
```

позволяет выбрать один из двух вариантов.

```python
if condition1:
    ...
elif condition2:
    ...
else:
    ...
```

позволяет выбирать между несколькими вариантами.

А логические операторы:

```text
and
or
not
```

позволяют строить сложные условия.

Теперь у нас есть базовые строительные блоки Python:

```text
переменные
      ↓
типы данных
      ↓
операторы
      ↓
выражения
      ↓
условия
```

Следующим естественным шагом будут **циклы**, потому что после того, как программа научилась принимать решения, ей нужно научиться повторять действия.