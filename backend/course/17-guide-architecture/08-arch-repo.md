---
id: arch-repo
title: Репозиторий и хранение
module_id: architecture
module_title: Архитектура ПО
module_order: 15
order: 8
---

# Репозиторий и хранение

## Цель

Научиться прятать детали SQL за репозиторием заказов так, чтобы сервис работал с доменными объектами, а смена СУБД или схемы била в одно место. После урока вы спроектируете интерфейс `OrderRepository` и простую реализацию.

## Что уже нужно понимать

Сервисный слой оркестрирует. Репозиторий — порт хранения: «дай заказ», «сохрани», «список по статусу». Не путать с паттерном «Repository» как догмой DDD — нам нужна практичная изоляция SQL.

## Объяснение

Без репозитория сервис Impортирует `Session`, пишет запросы, знает имена колонок. Тесты поднимают БД. Смена `status` varchar → enum в SQL размазывается. С репозиторием сервис говорит `repo.get(id)`, а как устроен SELECT — деталь.

Репозиторий **не** место для бизнес-правил «нельзя ship». Он может отказаться сохранить невалидную строку на уровне БД (constraint), но смысл перехода статусов — домен.

Отображение ORM↔домен: либо доменные объекты отделены от `OrderRow`, либо на старте ORM-модель осторожно используют как сущность (проще, но липнет). Учебный курс: покажите явный маппинг — полезно для понимания границы.

Методы: `add`, `get`, `save`, `list`. Не делайте `get_orders_where_customer_like_and_city_and_date` бесконечно — для сложных чтений заведите query-сервис/отдельные методы с именами по смыслу (`list_open_for_city`).

## Термины

- **Репозиторий** — коллекция сущностей с точки зрения приложения.
- **ORM-модель** — класс строки таблицы.
- **Маппинг** — перевод row ↔ domain.
- **Constraint** — ограничение БД (UNIQUE, CHECK).

## Как это устроено

```text
OrderService → OrderRepository (протокол)
                    ↑
            SqlOrderRepository (Session, OrderRow)
            InMemoryOrderRepository (для тестов)
```

Транзакция: часто UnitOfWork владеет session; репозиторий использует ту же session. `commit` — на границе UoW/сценария, не обязательно внутри каждого метода repo.

Пагинация и фильтры — параметры list. Не возвращайте «все заказы мира» без лимита в проде.

## Пример

```python
from typing import Protocol

class OrderRepository(Protocol):
    def get(self, order_id: int) -> Order: ...
    def add(self, order: Order) -> Order: ...
    def save(self, order: Order) -> Order: ...
    def list(self, status: str | None = None) -> list[Order]: ...


class SqlOrderRepository:
    def __init__(self, session: Session):
        self._session = session

    def get(self, order_id: int) -> Order:
        row = self._session.get(OrderRow, order_id)
        if row is None:
            raise NotFound(f"order {order_id}")
        return self._to_domain(row)

    def add(self, order: Order) -> Order:
        row = OrderRow(
            customer=order.customer,
            city=order.city,
            status=order.status,
        )
        self._session.add(row)
        self._session.flush()  # получить id без commit
        return self._to_domain(row)

    def save(self, order: Order) -> Order:
        row = self._session.get(OrderRow, order.id)
        if row is None:
            raise NotFound(f"order {order.id}")
        row.status = order.status
        row.customer = order.customer
        row.city = order.city
        self._session.flush()
        return self._to_domain(row)

    def list(self, status: str | None = None) -> list[Order]:
        q = self._session.query(OrderRow)
        if status:
            q = q.filter(OrderRow.status == status)
        return [self._to_domain(r) for r in q.all()]

    def _to_domain(self, row: OrderRow) -> Order:
        return Order(id=row.id, customer=row.customer, city=row.city, status=row.status)
```

## Разбор примера

Протокол позволяет подменить память в тестах. `flush` без `commit` даёт id и проверки constraint внутри внешней транзакции сценария. `_to_domain` — единая точка маппинга: если добавите поле `created_at`, правите здесь.

`list` тонкий. Сложный отчёт «среднее время упаковки» не обязан жить здесь — другой читающий модуль.

## Типичные ошибки

- Бизнес-правила в query filter как единственная защита.
- Репозиторий возвращает `OrderRow` повсюду, сервис течёт SQL.
- `commit()` внутри каждого метода при вложенных вызовах.
- God-repo на все таблицы системы.

## Что запомнить

Репозиторий изолирует хранение заказов. Сервис говорит языком сущностей. Маппинг явный. Транзакция снаружи. In-memory реализация ускоряет тесты правил. SQL-детали не протекают вверх.

## Задание

Напишите `InMemoryOrderRepository` со словарём по id. Прогоните мысленно `create` + `start_packing` на нём. Какие методы Protocol обязательны минимуму?

## Связь со следующим уроком

Разберём **DTO**: чем транспортная модель отличается от доменной и ORM-строки.
