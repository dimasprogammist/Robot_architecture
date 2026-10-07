---
id: python-testing-with-pytest
title: Тестирование Python-программ
module_id: python
module_title: Python
module_order: 7
order: 28
---

# Тестирование Python-программ

`assert` в `__main__` — начало. **pytest** — инструмент: находит тесты, гоняет, показывает дифф ожидаемого и фактического, даёт фикстуры.

Ставят в окружение: `python -m pip install pytest`. Файлы обычно `tests/test_clamp.py`, имена `test_...`.

```python
from mypkg.mathx import clamp


def test_clamp_inside():
    assert clamp(5, 0, 10) == 5


def test_clamp_low():
    assert clamp(-3, 0, 10) == 0
```

Запуск из корня проекта:

```text
python -m pytest
```

Падение покажет строку `assert` и значения. Не ловите AssertionError руками — pytest это и есть результат.

Фикстура — подготовка, которую переиспользуют:

```python
import pytest


@pytest.fixture
def tmp_db(tmp_path):
    return tmp_path / "t.db"
```

`tmp_path` уже есть в pytest: временный каталог на тест, не засоряет проект.

Исключения:

```python
import pytest


def test_zero_vector():
    with pytest.raises(ValueError):
        normalize((0, 0))
```

Маркеры, параметризация `@pytest.mark.parametrize` — когда много входов одна логика. Не плодите десять копий теста, отличающихся числом.

Тесты должны быть независимы: не «тест 2 ждёт файл, который создал тест 1». Параллельный запуск и случайный порядок иначе врут.

Покрытие 100% — не цель. Цель — важные ветки и баги, которые уже кусали.

## Практика

### Задание 1. Имена

Почему файл `test_clamp.py` и функция `test_clamp_low`, а не `check.py` / `run`? Как pytest вообще находит тесты?

### Задание 2. Независимость

Тест пишет `data.csv` в корень репозитория. Чем это вредит следующему тесту и git? Куда писать (`tmp_path`)?

### Задание 3. raises

Функция должна ругаться на пустую строку. Как оформить тест, что исключение *было*, и почему без `raises` падение выглядит как сломанный тест, а не как проверка?

### Задание 4. Параметры

Три assert на clamp в одном тесте vs три функции vs parametrize. Что яснее, когда упала только верхняя граница?

Дальше аннотации серьёзнее, чем поля dataclass: **typing**.
