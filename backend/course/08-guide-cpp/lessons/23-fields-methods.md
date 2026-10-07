---
id: cpp-23
title: Поля и методы
module_id: cpp
module_title: C++
module_order: 8
order: 23
---

# Поля и методы

## Цель

В предыдущем уроке мы познакомились с классами и увидели, что объект может объединять состояние и поведение. Теперь разберём подробнее две основные составляющие класса: поля и методы.

Поля описывают данные объекта, а методы определяют действия, которые объект может выполнять. Понимание этой связи особенно важно перед изучением конструкторов, инкапсуляции и более сложных объектных моделей.

После урока вы должны понимать:

* что такое поле объекта;
* что такое метод;
* как методы получают доступ к полям;
* чем локальная переменная отличается от поля;
* как параметры методов используются вместе с состоянием объекта;
* как методы могут возвращать значения;
* как организовать простой объект с понятным интерфейсом.

---

## Поля объекта

Поле — это переменная, которая принадлежит объекту.

Например:

```cpp
class Robot
{
private:
    std::string name;
    int battery;
    double speed;
};
```

У каждого объекта `Robot` будут собственные значения этих полей.

```cpp
Robot robot1;
Robot robot2;
```

У `robot1` и `robot2` разные:

```text
name
battery
speed
```

Изменение поля одного объекта не изменяет поле другого.

---

## Методы объекта

Метод — это функция, принадлежащая классу.

```cpp
class Robot
{
private:
    int battery = 100;

public:
    void consumeBattery(int value)
    {
        battery -= value;
    }
};
```

Здесь `consumeBattery()` является методом класса `Robot`.

Когда мы пишем:

```cpp
robot.consumeBattery(10);
```

метод работает с конкретным объектом `robot`.

---

## Метод работает с состоянием своего объекта

Рассмотрим два объекта:

```cpp
Robot robot1;
Robot robot2;
```

Если вызвать:

```cpp
robot1.consumeBattery(10);
```

изменится состояние `robot1`.

`robot2` при этом не изменится.

Можно представить это так:

```text
robot1
  battery = 90

robot2
  battery = 100
```

Один и тот же метод выполняется для разных объектов, но работает с состоянием того объекта, через который он был вызван.

---

## Поле и локальная переменная

Не следует путать поле класса с локальной переменной метода.

Например:

```cpp
class Robot
{
private:
    int battery = 100;

public:
    void charge(int amount)
    {
        int newBattery = battery + amount;

        battery = newBattery;
    }
};
```

Здесь:

```cpp
battery
```

является полем объекта.

А:

```cpp
newBattery
```

является локальной переменной метода.

Поле существует вместе с объектом, а локальная переменная существует только во время выполнения метода.

---

## Параметры методов

Метод может получать данные через параметры:

```cpp
void setSpeed(double value)
{
    speed = value;
}
```

Здесь `value` является параметром метода.

Вызов:

```cpp
robot.setSpeed(2.5);
```

передаст `2.5` в `value`.

После этого метод может использовать значение для изменения состояния объекта.

---

## Метод может читать состояние

Методы не обязаны изменять объект.

Например:

```cpp
class Robot
{
private:
    int battery = 75;

public:
    int getBattery() const
    {
        return battery;
    }
};
```

Вызов:

```cpp
std::cout << robot.getBattery();
```

только читает состояние.

Такие методы часто называют getter-методами.

---

## Метод может изменять состояние

Другой метод может изменять поле:

```cpp
void setBattery(int value)
{
    battery = value;
}
```

Однако хороший метод может дополнительно проверять входные данные:

```cpp
void setBattery(int value)
{
    if (value < 0)
    {
        value = 0;
    }

    if (value > 100)
    {
        value = 100;
    }

    battery = value;
}
```

Теперь объект не сможет получить значение батареи за пределами диапазона `0..100`.

---

## Несколько методов работают вместе

Класс может содержать много методов, которые используют одно состояние.

```cpp
class Robot
{
private:
    int battery = 100;
    bool enabled = false;

public:
    void enable()
    {
        if (battery > 0)
        {
            enabled = true;
        }
    }

    void disable()
    {
        enabled = false;
    }

    bool isEnabled() const
    {
        return enabled;
    }

    int getBattery() const
    {
        return battery;
    }
};
```

Теперь объект сам содержит правила работы.

Например, робот не включится, если заряд равен нулю.

---

## Методы могут возвращать разные типы

Метод может возвращать `void`:

```cpp
void stop()
{
    speed = 0;
}
```

Может возвращать `bool`:

```cpp
bool isRunning() const
{
    return speed > 0;
}
```

Может возвращать число:

```cpp
double getSpeed() const
{
    return speed;
}
```

Или строку:

```cpp
std::string getName() const
{
    return name;
}
```

Тип возвращаемого значения определяется перед именем метода.

---

## Методы могут принимать несколько параметров

Например:

```cpp
void move(double x, double y)
{
    positionX = x;
    positionY = y;
}
```

Вызов:

```cpp
robot.move(10.0, 20.0);
```

Метод получает два значения и изменяет два поля объекта.

---

## Передача объектов в методы

Один объект может получать другой объект в качестве параметра.

Например:

```cpp
struct Position
{
    double x;
    double y;
};

class Robot
{
private:
    Position position;

public:
    void setPosition(const Position& newPosition)
    {
        position = newPosition;
    }
};
```

Здесь метод получает структуру `Position` по константной ссылке.

Такой подход позволяет передавать более сложные данные, не создавая множество отдельных параметров.

---

## Метод может вызывать другой метод

Методы одного класса могут вызывать друг друга:

```cpp
class Robot
{
private:
    int battery = 100;

public:
    bool hasBattery() const
    {
        return battery > 0;
    }

    void enable()
    {
        if (hasBattery())
        {
            // включение
        }
    }
};
```

`enable()` использует `hasBattery()` для проверки состояния.

Это позволяет не дублировать одну и ту же проверку в нескольких местах.

---

## Именование методов

Хорошие имена методов должны описывать действие или получение значения.

Например:

```cpp
start()
stop()
reset()
setSpeed()
getSpeed()
isEnabled()
hasError()
```

По имени должно быть понятно, что произойдёт при вызове метода.

Плохо:

```cpp
doSomething()
process()
handle()
```

если из контекста невозможно понять, что именно делает метод.

---

## const-методы

Метод, который не изменяет объект, рекомендуется помечать `const`:

```cpp
double getSpeed() const
{
    return speed;
}
```

А метод, который изменяет состояние, обычно не является `const`:

```cpp
void setSpeed(double value)
{
    speed = value;
}
```

Это позволяет компилятору контролировать правильность использования объекта.

---

## Практический пример

Создадим класс для датчика:

```cpp
#include <iostream>
#include <string>

class Sensor
{
private:
    std::string name;
    double value = 0;
    bool active = false;

public:
    void setName(const std::string& newName)
    {
        name = newName;
    }

    void setValue(double newValue)
    {
        value = newValue;
    }

    void activate()
    {
        active = true;
    }

    void deactivate()
    {
        active = false;
    }

    bool isActive() const
    {
        return active;
    }

    double getValue() const
    {
        return value;
    }

    void print() const
    {
        std::cout << name
                  << ": "
                  << value
                  << ", active="
                  << active
                  << '\n';
    }
};

int main()
{
    Sensor sensor;

    sensor.setName("Temperature");
    sensor.setValue(24.5);
    sensor.activate();

    sensor.print();

    return 0;
}
```

Здесь хорошо видно разделение ответственности. Поля хранят состояние датчика, а методы предоставляют операции для управления этим состоянием.

---

## Главное

Поле хранит состояние объекта, а метод описывает действие или операцию над этим состоянием.

Хороший класс обычно не заставляет внешний код напрямую управлять внутренними данными. Вместо этого он предоставляет понятные методы, которые проверяют входные значения и поддерживают объект в корректном состоянии.

---

## Практика

### Задание 1

Создайте класс `Lamp` с полями:

```text
enabled
brightness
```

Добавьте методы включения, выключения и изменения яркости.

### Задание 2

Создайте класс `Motor` с полями:

```text
speed
running
```

Добавьте методы:

```text
start()
stop()
setSpeed()
getSpeed()
isRunning()
```

### Задание 3

Сделайте так, чтобы `setSpeed()` не принимал отрицательные значения.

### Задание 4

Создайте класс `Counter`, который хранит число и имеет методы:

```text
increment()
decrement()
getValue()
reset()
```

### Задание 5

Добавьте в `Counter` метод:

```cpp
bool isZero() const
```

который возвращает `true`, если счётчик равен нулю.