---
id: arch-dto
title: DTO и модели на границе
module_id: architecture
module_title: Архитектура ПО
module_order: 17
order: 9
---

# DTO и модели на границе

## Цель

Различить транспортные DTO, доменные сущности и ORM-строки в сервисе заказов и понять, зачем их не склеивать в один класс навсегда. После урока вы опишете `OrderCreate`, `OrderOut` и доменный `Order` с разными полями осознанно.

## Что уже нужно понимать

API принимает JSON, домен держит правила, репозиторий пишет в таблицу. У каждого края свой интерес к данным. DTO (Data Transfer Object) — структура для переноса через границу, без поведения домена.

## Объяснение

Наивный старт: один класс на всё. Потом оказывается:

- клиенту нельзя видеть внутренний `fraud_score`;
- при создании нельзя принимать `id` и `status` от клиента;
- в БД есть `updated_at`, которого нет в доменной логике отмены;
- в событии Kafka нужен другой набор полей.

Разделение моделей фиксирует эти различия. Да, больше классов; зато изменение API не ломает таблицу молча и наоборот.

Pydantic-модели в FastAPI — отличный DTO-слой: валидация типов на входе, сериализация на выходе. Домен может быть dataclass. ORM — `OrderRow`. Маппинг — явные функции/`model_validate` с `from_attributes`.

Не тащите методы `ship()` в Pydantic-DTO: смешаете транспорт и правила.

## Термины

- **DTO** — объект переноса данных через границу.
- **Контракт API** — поля и типы публичного JSON.
- **Утечка модели** — внутреннее поле стало публичным случайно.
- **Версионирование DTO** — эволюция без ломания клиентов.

## Как это устроено

Вход: JSON → `OrderCreate` → сервис → `Order` → repo → `OrderRow`.
Выход: `OrderRow` → `Order` → `OrderOut` → JSON.

Иногда пропускают домен на чистом CRUD: DTO↔Row. Как только появляются инварианты — верните домен в середину.

Версии: `OrderOutV1`, или поле `schema_version` в событиях. Не переименовывайте поля «тихо» в проде без миграции клиентов.

## Пример

```python
from pydantic import BaseModel, Field
from dataclasses import dataclass

class OrderCreate(BaseModel):
    customer: str = Field(min_length=1, max_length=200)
    city: str = Field(min_length=1, max_length=120)

class OrderOut(BaseModel):
    id: int
    customer: str
    city: str
    status: str
    model_config = {"from_attributes": True}

@dataclass
class Order:
    id: int | None
    customer: str
    city: str
    status: str
    fraud_score: int  # внутрь системы, не в OrderOut

    @staticmethod
    def create(customer: str, city: str) -> "Order":
        return Order(id=None, customer=customer, city=city, status="new", fraud_score=0)


def to_out(order: Order) -> OrderOut:
    assert order.id is not None
    return OrderOut(
        id=order.id,
        customer=order.customer,
        city=order.city,
        status=order.status,
    )
```

## Разбор примера

`OrderCreate` не содержит `status` — клиент не назначает себе `shipped`. `OrderOut` не содержит `fraud_score` — утечки нет. Домен хранит score для будущей политики.

`to_out` — явный антикоррупционный шаг. Можно использовать `OrderOut.model_validate` если формы близки; при расхождении явная функция честнее.

Валидация длины на DTO отсекает мусор рано; домен всё равно может проверять смысл города/клиента глубже.

## Типичные ошибки

- Отдавать ORM-модель напрямую в `response_model` с лишними связями и паролями.
- Принимать тот же тип, что и отдают, и удивляться подмене id.
- Дублировать валидацию в трёх моделях без нужды — делите только различающееся.
- «Божественный» Schema на вход и выход сразу.

## Что запомнить

DTO — контракт края. Домен — смысл. ORM — таблица. Разделение защищает от утечек и ломающих изменений. Маппинг явный. Клиент не задаёт то, что принадлежит системе.

## Задание

Добавьте `OrderStatusUpdate` DTO с полем `status` и словарём допустимых значений. Покажите, почему нельзя переиспользовать `OrderCreate` для этого.

## Связь со следующим уроком

Соберём **API-слой**: тонкие эндпоинты, коды ошибок, идемпотентность на границе HTTP.
