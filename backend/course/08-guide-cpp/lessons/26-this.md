---
id: cpp-26
title: this и доступ к объекту
module_id: cpp
module_title: C++
module_order: 8
order: 26
---

# this и доступ к объекту

## Цель

В предыдущих уроках мы разобрали классы, поля, методы, конструкторы и инкапсуляцию. Теперь нужно понять, как метод узнаёт, с каким именно объектом он работает.

Для этого в C++ существует специальный указатель `this`. Он автоматически доступен внутри нестатического метода класса и указывает на текущий объект.

После урока вы должны понимать:

* что такое `this`;
* почему у каждого объекта свой `this`;
* как обращаться к полям через `this`;
* зачем использовать `this->`;
* как разрешать конфликт имён;
* как возвращать текущий объект из метода;
* почему `this` нельзя использовать в `static`-методе;
* как `this` связан с указателями и объектами.

---

## Что такое this

Рассмотрим простой класс:

```cpp
class Robot
{
private:
    int speed;

public:
    void setSpeed(int speed)
    {
        this->speed = speed;
    }
};
```

Здесь у нас два объекта с именем `speed`:

```cpp
int speed
```

является параметром метода, а:

```cpp
this->speed
```

является полем текущего объекта.

Поэтому:

```cpp
this->speed = speed;
```

означает:

```text
полю текущего объекта ← параметр метода
```

---

## Почему вообще нужен this

Рассмотрим:

```cpp
class Robot
{
private:
    int speed;

public:
    void setSpeed(int newSpeed)
    {
        speed = newSpeed;
    }
};
```

Здесь всё понятно: `speed` — поле, `newSpeed` — параметр.

Но часто удобно использовать одинаковые имена:

```cpp
void setSpeed(int speed)
{
    this->speed = speed;
}
```

Без `this->` выражение:

```cpp
speed = speed;
```

не имело бы нужного смысла: оба имени в теле метода относятся к параметру.

`this->speed` явно говорит:

> возьми поле `speed` текущего объекта.

---

## У каждого объекта свой this

Предположим:

```cpp
Robot first;
Robot second;
```

И вызываем:

```cpp
first.setSpeed(10);
second.setSpeed(20);
```

Во время первого вызова:

```text
this → first
```

Во время второго:

```text
this → second
```

То есть один и тот же метод работает с разными объектами.

Упрощённо можно представить:

```text
first.setSpeed(10)
        ↓
this → first

second.setSpeed(20)
        ↓
this → second
```

Поэтому один метод класса может изменять состояние конкретного объекта, для которого он был вызван.

---

## this похож на скрытый параметр

Можно представить метод:

```cpp
class Robot
{
public:
    void setSpeed(int speed)
    {
        this->speed = speed;
    }

private:
    int speed;
};
```

как функцию, которой неявно передаётся текущий объект.

Условно:

```text
setSpeed(currentObject, speed)
```

На самом деле синтаксис C++ устроен иначе, но такая модель помогает понять принцип.

Когда выполняется:

```cpp
robot.setSpeed(50);
```

метод получает доступ к объекту `robot` через `this`.

---

## Доступ к полям

Через `this` можно обращаться к любому доступному члену текущего объекта:

```cpp
class Robot
{
private:
    double x;
    double y;

public:
    void move(double dx, double dy)
    {
        this->x += dx;
        this->y += dy;
    }
};
```

Здесь:

```cpp
this->x
```

означает поле `x` текущего объекта.

А:

```cpp
this->y
```

означает поле `y` текущего объекта.

---

## this можно разыменовать

`this` является указателем на текущий объект.

Поэтому:

```cpp
this
```

представляет адрес текущего объекта.

А:

```cpp
*this
```

представляет сам текущий объект.

Например:

```cpp
class Robot
{
public:
    void printAddress()
    {
        std::cout << this << '\n';
    }
};
```

Можно вывести адрес объекта:

```cpp
Robot robot;

robot.printAddress();
```

Полученное значение будет связано с адресом `robot`.

---

## Передача this в другую функцию

Поскольку `this` — указатель, его можно передать другой функции.

Например:

```cpp
void inspectRobot(const Robot* robot)
{
    // ...
}
```

Внутри метода:

```cpp
inspectRobot(this);
```

Таким образом, текущий объект передаётся как указатель.

Однако в обычном прикладном коде такой приём нужен не всегда. Часто достаточно передать объект по ссылке или использовать другие архитектурные решения.

---

## Возврат *this

Иногда метод возвращает ссылку на текущий объект:

```cpp
class Robot
{
public:
    Robot& setSpeed(double speed)
    {
        this->speed = speed;
        return *this;
    }

private:
    double speed = 0;
};
```

Теперь можно написать:

```cpp
Robot robot;

robot.setSpeed(50);
```

А поскольку метод возвращает `Robot&`, можно построить цепочку вызовов:

```cpp
robot.setSpeed(50).setSpeed(80);
```

Один метод возвращает тот же объект, и следующий вызов выполняется уже на нём.

---

## Метод, возвращающий текущий объект

Такой подход часто используется в интерфейсах, где операции можно объединять:

```cpp
class Motor
{
private:
    int speed = 0;

public:
    Motor& setSpeed(int value)
    {
        speed = value;
        return *this;
    }

    Motor& stop()
    {
        speed = 0;
        return *this;
    }
};
```

Можно написать:

```cpp
Motor motor;

motor.setSpeed(100)
     .stop()
     .setSpeed(50);
```

Это называется цепочкой вызовов.

---

## const-методы и this

Рассмотрим:

```cpp
class Robot
{
public:
    void print() const
    {
        // ...
    }
};
```

`const` после списка параметров означает, что метод не должен изменять состояние объекта через обычный доступ к его членам.

В таком методе `this` также учитывает константность объекта.

Это позволяет безопасно вызывать метод у `const`-объекта:

```cpp
const Robot robot;

robot.print();
```

Если метод не объявлен как `const`, такой вызов обычно невозможен.

---

## this в конструкторе

`this` доступен и внутри конструктора.

Например:

```cpp
class Robot
{
private:
    std::string name;

public:
    Robot(const std::string& name)
    {
        this->name = name;
    }
};
```

Здесь:

```cpp
this->name
```

означает поле объекта, а:

```cpp
name
```

справа означает параметр конструктора.

Однако для инициализации полей предпочтительнее список инициализации:

```cpp
Robot(const std::string& name)
    : name(name)
{
}
```

Он будет подробнее рассмотрен при изучении конструкторов.

---

## this нельзя использовать в static-методе

Рассмотрим:

```cpp
class Robot
{
public:
    static void test()
    {
        // this недоступен
    }
};
```

Почему?

Потому что `static`-метод не вызывается для конкретного объекта.

Например:

```cpp
Robot::test();
```

Здесь нет:

```text
robot → текущий объект
```

Поэтому нет и `this`.

---

## this и несколько объектов

Рассмотрим:

```cpp
class Robot
{
private:
    int id;

public:
    Robot(int id)
        : id(id)
    {
    }

    void printId()
    {
        std::cout << this->id << '\n';
    }
};
```

Создадим:

```cpp
Robot first(1);
Robot second(2);
Robot third(3);
```

Теперь:

```cpp
first.printId();
second.printId();
third.printId();
```

выведет:

```text
1
2
3
```

Метод один, но каждый вызов работает со своим объектом через собственный `this`.

---

## Практический пример

Рассмотрим контроллер робота:

```cpp
#include <iostream>

class Robot
{
private:
    double x = 0;
    double y = 0;
    double speed = 0;

public:
    Robot& setSpeed(double speed)
    {
        this->speed = speed;
        return *this;
    }

    Robot& move(double dx, double dy)
    {
        this->x += dx;
        this->y += dy;

        return *this;
    }

    void print() const
    {
        std::cout
            << "Position: ("
            << x
            << ", "
            << y
            << "), speed: "
            << speed
            << '\n';
    }
};

int main()
{
    Robot robot;

    robot.setSpeed(20)
         .move(10, 5)
         .setSpeed(30);

    robot.print();

    return 0;
}
```

Здесь `this` используется для доступа к полям:

```cpp
this->speed
this->x
this->y
```

а:

```cpp
return *this;
```

возвращает текущий объект для следующего вызова.

---

## Главное

`this` — специальный указатель на текущий объект.

Основная форма:

```cpp
this->field
```

означает поле текущего объекта.

Особенно часто `this` используется, когда имя параметра совпадает с именем поля:

```cpp
void setSpeed(int speed)
{
    this->speed = speed;
}
```

Также важно запомнить:

```cpp
this
```

— указатель на текущий объект;

```cpp
*this
```

— сам текущий объект;

```cpp
return *this;
```

— возврат текущего объекта по ссылке.

В `static`-методе `this` отсутствует, потому что такой метод не связан с конкретным экземпляром класса.

---

## Практика

### Задание 1

Создайте класс `Robot` с полями:

```cpp
name
speed
```

и методом:

```cpp
setSpeed(int speed)
```

Используйте `this->`.

### Задание 2

Создайте метод:

```cpp
Robot& setPosition(double x, double y)
```

который изменяет координаты и возвращает `*this`.

### Задание 3

Создайте несколько объектов одного класса и с помощью метода выведите их значения. Обратите внимание, что `this` для каждого объекта будет указывать на разные адреса.

### Задание 4

Попробуйте использовать `this` внутри `static`-метода и объясните ошибку компилятора.

### Задание 5

Создайте класс с несколькими методами, возвращающими `*this`, и реализуйте цепочку вызовов.