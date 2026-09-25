---
id: python-testing
title: pytest
category: python
section: Качество
order: 54
description: Юнит-тесты чистых функций и фейковых шин.
tags: [python, качество]
technologies: [Python]
related: [python-functions, python-protocols-abc, python-pid]
---

# pytest

PID, одометрия, парсер кадра тестируются без робота. Драйвер — против FakeSerial.

## Зачем это в робототехнической системе

CI на каждый PR архитектуры кода. Железо — nightly на стенде.

## Синтаксис и контракт

```python
def test_clamp():
    assert clamp(5, 0, 1) == 1
```

## Типичные ошибки

- тесты, которые ходят на реальный /dev без маркера integration
- случайный sleep «чтобы прошло»

## В Architecture Canvas

Требования → тесты. Свяжите REQ-id в имени теста. В Canvas requirement_ids на компоненте.

## Связанные разделы
- python-functions
- python-protocols-abc
- python-pid
