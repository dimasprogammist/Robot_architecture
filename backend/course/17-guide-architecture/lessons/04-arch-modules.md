---
id: arch-modules
title: Модули и пакеты
module_id: architecture
module_title: Архитектура ПО
module_order: 17
order: 4
---

# Модули и пакеты

## Цель

Научиться раскладывать код сервиса заказов по пакетам Python так, чтобы имена папок отражали роли, а импорты не превращались в клубок. После урока вы предложите структуру каталогов для Orders API и правила «кто кого импортирует».

## Что уже нужно понимать

Компоненты как роли. В Python модуль — файл `.py`, пакет — каталог с импортами. Модульность архитектуры и модульность языка связаны, но пакет `utils.py` сам по себе архитектуру не создаёт.

## Объяснение

Хорошая раскладка отвечает: «куда положить смену статуса?» за секунды. Плохая — «у нас есть `models`, `schemas`, `services`, `crud`, `helpers`, `core`, `manager`» и одно и то же лежит в трёх местах под разными именами.

Два популярных стиля:

1. **По слоям:** `api/`, `services/`, `repositories/`, `domain/`.
2. **По фичам:** `orders/`, `customers/`, внутри каждой — свои api/service/repo.

Для одного домена заказов в курсе удобен гибрид: пакет `orders` как фича, внутри — слои. Когда появится `telemetry`, добавите соседний пакет, а не размажете по общим `models`.

Правила импорта важнее красивых папок. Пример: `domain` не импортирует FastAPI; `api` не импортирует SQLAlchemy-модели напрямую, если используете DTO; `repo` может знать SQL.

Циклические импорты — запах: модули слишком сцеплены или неправильно разрезаны. Лечится выносом типов/интерфейсов или инверсией зависимости.

## Термины

- **Пакет фичи** — код одного ограниченного контекста.
- **Публичный API пакета** — то, что экспортируете в `__init__.py` осознанно.
- **Циклический импорт** — A→B→A.
- **Слой внутри фичи** — api/service/repo под одним зонтиком.

## Как это устроено

```text
app/
  main.py                 # сборка приложения
  api/
    router.py             # подключение маршрутов
  orders/
    api.py                # HTTP endpoints заказов
    schemas.py            # Pydantic DTO
    service.py            # сценарии
    domain.py             # сущности/инварианты
    repository.py         # SQL
    notifications.py
  db.py                   # сессия, engine
```

`main` знает про роутеры. `orders.api` знает про `service` и `schemas`. `service` знает `domain` + `repository` + порт уведомлений. Тесты могут импортировать `service` без `api`.

Не кладите бизнес-правила в `main.py`. Не создавайте пакет `shared` слишком рано — он станет свалкой.

## Пример

```python
# orders/service.py
from .domain import Order, Status
from .repository import OrderRepository
from .notifications import Notifier

class OrderService:
    def __init__(self, repo: OrderRepository, notifier: Notifier):
        self._repo = repo
        self._notifier = notifier

    def create(self, customer: str, city: str) -> Order:
        order = Order.new(customer=customer, city=city)
        return self._repo.add(order)

    def start_packing(self, order_id: int) -> Order:
        order = self._repo.get(order_id)
        updated = order.start_packing()
        saved = self._repo.save(updated)
        return saved
```

```python
# orders/api.py
from fastapi import APIRouter, Depends
from .schemas import OrderCreate, OrderOut
from .service import OrderService
from .deps import get_order_service

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("", response_model=OrderOut)
def create(payload: OrderCreate, svc: OrderService = Depends(get_order_service)):
    order = svc.create(payload.customer, payload.city)
    return OrderOut.model_validate(order)
```

## Разбор примера

Имена модулей читаются как роли. `api` зависит от `service`, не наоборот — направление к ядру. `OrderCreate` живёт в `schemas` (транспорт), `Order` — в `domain` (смысл). Иногда их сливают на старте; разделяйте, когда транспорт начинает отличаться от домена (лишние поля API, разные представления).

`deps.get_order_service` — место сборки зависимостей (простая DI), чтобы `api` не конструировал SQL-сессию руками в каждом хендлере.

## Типичные ошибки

- Пакет `models` на всю компанию без границ фич.
- Импорт `from app.orders.repository import Session` внутри domain.
- Тысяча однострочных файлов «как в статье», когда команда из одного человека тонет в навигации.
- Игнорировать циклы через отложенные импорты вместо переразрезки.

## Что запомнить

Модули — карта ответственности в коде. Фича `orders` со слоями внутри хорошо масштабируется на учебный монолит. Правила импорта важнее. `main` только собирает. Циклы — сигнал пересмотреть границы.

## Задание

Набросайте дерево пакетов, если добавите `telemetry` (точки измерений) рядом с заказами. Какие модули можно переиспользовать (`db.py`), какие нельзя (`orders.domain`)?

## Связь со следующим уроком

Разберём **зависимости** между модулями: направление, запреты, как читать граф импортов.
