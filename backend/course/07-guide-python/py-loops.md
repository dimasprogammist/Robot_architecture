---
id: py-loops
title: Циклы for и while
module_id: python
module_title: Python
module_order: 8
order: 13
---

# Циклы for и while

## Цель

Освоить for и while, break/continue.

Понять: for ходит по итератору, не только по индексам.

## Что уже пройдено

Вы умеете ветвить поток.

Циклы добавляют повторение.

## Объяснение с нуля

`for item in iterable` берёт элементы из итерации: list, str, dict, range, файл.

`while` — пока условие истинно; число шагов неизвестно. break выходит, continue пропускает итерацию. else у цикла — если не было break.

Не меняйте коллекцию, по которой идёт for — стройте новый список или итерируйте копию.

## Термины

- **Iterable / iterator**.

- **range**.

- **break / continue**.

- **else у цикла**.

- **Бесконечный цикл**.

- **Инвариант цикла**.

- **StopIteration** (внутри for).

## Внутреннее устройство

for: iter(iterable), затем next до StopIteration.

while каждый раз считает условие. range ленив — не строит весь список.

## Пример

```python

total = 0

for n in range(1, 6):

    if n % 2 == 0:

        continue

    total += n

print("odd sum", total)

i = 3

while i > 0:

    print("tick", i)

    i -= 1

else:

    print("done without break")

```

## Разбор

continue пропускает чётные; сумма 1+3+5.

while завершился без break — сработал else.

## Ошибки

- Модификация списка в своём for.

- Забыть обновление в while.

- `for i in len(xs)`.

- Путать else цикла и if.

- `list(range(огромное))` без нужды.

## Что запомнить

for — итератор; while — условие.

break/continue управляют потоком.

range ленив.

## Задание

Поиск первого чётного через for/break и else «не найдено».

while по имитации ввода до 0.

## Связь со следующим уроком

Дальше — **Функции def**. Переходите, когда своими словами объясняете модель из «Внутреннее устройство» и выполняете задание без пошаговых подсказок.
