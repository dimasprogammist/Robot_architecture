---
id: py-dataclasses
title: dataclass
module_id: python
module_title: Python
module_order: 8
order: 32
---

# dataclass

## Цель

Освоить @dataclass для генерации рутинных методов классов-данных.

Понять, когда dataclass уместен вместо ручного __init__.

## Что уже пройдено

Вы пишете классы и аннотации.

dataclass использует аннотации полей для шаблонного кода.

## Объяснение с нуля

Много классов — набор полей + repr/сравнение. @dataclass генерирует __init__, __repr__ и др.

Меньше бойлерплейта для конфигов и DTO. Настройки: frozen, order, field/default_factory. Это не ORM и не валидатор типов сам по себе.

## Термины

- **dataclass**.

- **Поле / field**.

- **frozen**.

- **default_factory**.

- **DTO**.

- **`__post_init__`**.

- **Бойлерплейт**.

## Внутреннее устройство

Декоратор читает аннотации и вставляет методы в namespace класса.

frozen подменяет __setattr__. default_factory нужен для изменяемых умолчаний — иначе ловушка разделяемого списка.

## Пример

```python

from dataclasses import dataclass, field

@dataclass(frozen=True)

class Point:

    x: float

    y: float

@dataclass

class Track:

    points: list[Point] = field(default_factory=list)

    def add(self, p: Point) -> None:

        self.points.append(p)

t = Track()

t.add(Point(1.0, 2.0))

print(t)

```

## Разбор

Point — замороженная запись. Track безопасно стартует с новым списком.

add — обычный метод рядом с сгенерированным init.

## Ошибки

- list = [] без default_factory.

- Ждать рантайм-валидации типов.

- Мутировать frozen.

- Любой сложный класс насильно в dataclass.

## Что запомнить

dataclass генерирует рутину по полям.

Изменяемые умолчания — default_factory.

frozen фиксирует неизменяемость.

## Задание

User(id, name, tags: list[str]) с безопасным умолчанием tags.

Два экземпляра — независимые списки tags.

## Связь со следующим уроком

Дальше — **async/await введение**. Переходите, когда своими словами объясняете модель из «Внутреннее устройство» и выполняете задание без пошаговых подсказок.
