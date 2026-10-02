---
id: arch-deps
title: Зависимости между частями
module_id: architecture
module_title: Архитектура ПО
module_order: 15
order: 5
---

# Зависимости между частями

## Цель

Научиться читать и проектировать направление зависимостей в сервисе заказов: кто имеет право импортировать кого. После урока вы нарисуете граф «api → service → domain/repo» и объясните, почему domain не зависит от FastAPI.

## Что уже нужно понимать

Пакеты `orders.api`, `service`, `domain`, `repository`. Зависимость «A зависит от B» значит: чтобы понять/собрать A, нужен B; в коде — import B из A. Чем больше входящих зависимостей у модуля, тем опаснее его ломать.

## Объяснение

Граф зависимостей — скелет архитектуры. Правило большого пальца: **зависимости указывают внутрь к стабильным правилам домена, а не наружу к фреймворкам.** HTTP, SQLAlchemy, Kafka — детали на краю. Домен заказа («new → packing») стабильнее выбора ORM.

Если `domain.py` импортирует `fastapi.HTTPException`, вы привязали смысл заказа к веб-фреймворку. CLI и consumer не смогут использовать правило без HTTP. Выносите собственные исключения (`Conflict`, `NotFound`) и на границе API переводите их в статусы.

Зависимость бывает:

- **прямая** (import);
- **транзитивная** (A→B→C, значит A косвенно на C);
- **временная** (создали объект и забыли) vs **постоянная** (храните ссылку в поле).

Инверсия зависимости: сервис зависит от абстракции `Notifier`, а не от `SmtpClient`. Реализацию внедряют с края (`main`/deps). Так домен/сервис не знают про SMTP.

## Термины

- **Направление зависимости** — стрелка «кто импортирует».
- **Стабильность** — как редко модуль вынужден меняться.
- **Инверсия зависимости** — зависимость от абстракции, не от детали.
- **Ациклический граф** — без циклов A↔B.

## Как это устроено

Желаемый граф Orders:

```text
api ──► service ──► domain
           │
           ├──► repository ──► db/sqlalchemy
           └──► notifier (интерфейс)
                    ▲
                    │
              smtp_notifier (деталь, собирается в main)
```

`smtp_notifier` зависит от интерфейса/доменных типов, `service` — от интерфейса. Оба смотрят на абстракцию; деталь не торчит в домен.

Проверка: удалили FastAPI — юнит-тесты `service` ещё работают. Удалили SMTP — `service` работает с `ConsoleNotifier`. Не можете удалить domain без поломки всего — так и должно быть: это ядро.

## Пример

```python
# orders/ports.py
class Notifier(Protocol):
    def order_shipped(self, order_id: int, customer: str) -> None: ...


# orders/service.py
class OrderService:
    def __init__(self, repo: OrderRepository, notifier: Notifier):
        self._repo = repo
        self._notifier = notifier

    def ship(self, order_id: int) -> Order:
        order = self._repo.get(order_id)
        shipped = order.ship()  # доменное правило
        self._repo.save(shipped)
        self._notifier.order_shipped(shipped.id, shipped.customer)
        return shipped


# orders/api.py — перевод исключений
from fastapi import APIRouter, HTTPException
from .errors import NotFound, Conflict

@router.post("/{order_id}/ship")
def ship(order_id: int, svc: OrderService = Depends(get_svc)):
    try:
        return svc.ship(order_id)
    except NotFound as e:
        raise HTTPException(404, str(e)) from e
    except Conflict as e:
        raise HTTPException(409, str(e)) from e
```

## Разбор примера

`OrderService` не импортирует FastAPI. `Notifier` — Protocol: структурная типизация без тяжёлого ABC, если удобно. API — адаптер: ловит доменные ошибки и делает HTTP.

Если бы `order.ship()` бросал `HTTPException`, зависимость пошла бы в неправильную сторону. Здесь стрелки соблюдены.

## Типичные ошибки

- Цикл api↔service через «удобный» импорт.
- Домен зависит от ORM-модели как от единственной сущности.
- «Абстракция» на каждый чих (интерфейс для одной функции без альтернатив) — преждевременная сложность.
- Скрытые зависимости через глобальные синглтоны.

## Что запомнить

Зависимости направьте к домену. Край (HTTP/БД/SMTP) зависит от ядра, ядро — нет. Инверсия через порты. Ацикличность. Граф импортов проверяйте ревью и инструментами.

## Задание

Найдите в своём коде (или набросайте) один import «внутрь наружу» (domain→fastapi или service→smtp напрямую). Перепишите стрелку через порт или перевод на границе.

## Связь со следующим уроком

Соберём **слои** явно: представление, приложение, домен, инфраструктура на том же Orders API.
