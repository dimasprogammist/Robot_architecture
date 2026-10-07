---
id: arch-di
title: Внедрение зависимостей
module_id: architecture
module_title: Архитектура ПО
module_order: 17
order: 15
---

# Внедрение зависимостей

## Цель

Научиться собирать Orders API через внедрение зависимостей: сервис не создаёт SQL-сессию и SMTP сам, а получает их с края. После урока вы напишете `deps.py` для FastAPI и поймёте отличие от Service Locator-хаоса.

## Что уже нужно понимать

Dependency Inversion: зависимость от порта. DI (Dependency Injection) — техника подачи реализаций снаружи через конструктор/параметры/фабрики фреймворка. Это не обязательный «DI-контейнер на 10 МБ».

## Объяснение

Без DI сервис делает `SessionLocal()`, `SmtpClient(os.environ[...])` внутри методов. Тесты не подменят. Конфиг расползается. С DI: `OrderService(repo, notifier)` чистый; `main` или `Depends` знает, как достать session и склеить объекты.

В FastAPI типичный путь: функции-зависимости `get_db`, `get_order_service`. Можно вручную в lifespan создать синглтоны клиентов. Контейнеры (punq, dependency-injector) имеют смысл позже; сначала явные фабрики.

Антипатерн: глобальный `get_service()` из случайного места глубоко в домене — скрытый Service Locator, связанность невидима. Лучше параметр конструктора.

Жизненный цикл: session — на запрос; SmtpClient — часто на приложение; сервис — на запрос (с session) или тонкий singleton с фабрикой repo на запрос. Неправильный scope даёт утечки соединений и данные «чужого» запроса.

## Термины

- **Injection** — передача зависимости извне.
- **Composition root** — место сборки графа (`main`, deps).
- **Scope** — время жизни объекта.
- **Service Locator** — «достань из глобального мешка» (осторожно).

## Как это устроено

```text
composition root (deps/main)
    создаёт engine
    на запрос: session → SqlOrderRepository → OrderService(+Notifier)
    отдаёт в endpoint через Depends
```

Тест: создаёт `OrderService(InMemoryRepo(), FakeNotifier())` без FastAPI. Это главный выигрыш.

## Пример

```python
# orders/deps.py
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db import get_db
from .repository import SqlOrderRepository
from .notifications import HttpNotifier, ConsoleNotifier
from .service import OrderService
import os

def get_notifier() -> Notifier:
    if os.getenv("NOTIFIER", "console") == "http":
        return HttpNotifier(os.environ["MAILER_URL"])
    return ConsoleNotifier()

def get_order_service(
    db: Session = Depends(get_db),
    notifier: Notifier = Depends(get_notifier),
) -> OrderService:
    repo = SqlOrderRepository(db)
    return OrderService(repo=repo, notifier=notifier, uow=SessionUoW(db))


# orders/api.py
@router.post("/{order_id}/ship")
def ship(order_id: int, svc: OrderService = Depends(get_order_service)):
    return to_out(svc.ship(order_id))
```

```python
# test без FastAPI
def test_ship():
    repo = InMemoryRepo([Order(id=1, status="packing", customer="A", city="B")])
    notes = FakeNotifier()
    svc = OrderService(repo, notes, NullUoW())
    svc.ship(1)
    assert notes.shipped == [1]
```

## Разбор примера

Эндпоинт не знает, console или http notifier — только env на composition root. Смена реализации — правка `get_notifier`/`env`, не `ship`.

Тест собирает граф руками: быстрый и точный. `Depends` — DI от фреймворка на время HTTP-запроса; тот же принцип.

UoW из session связывает commit с запросом. Важно не создать две session на один сценарий случайно.

## Типичные ошибки

- Создавать Session внутри доменного метода.
- Хранить state пользователя в singleton-сервисе.
- Магический контейнер, где не видно графа.
- Путать DI с «везде интерфейсы».

## Что запомнить

DI подаёт реализации с края. Composition root собирает Orders. FastAPI Depends — удобный DI на запрос. Тесты собирают проще. Scope соответствует ресурсу. Явные конструкторы лучше глобальных мешков.

## Задание

Добавьте `get_uow` и передайте в сервис. Напишите, какой scope у `engine`, `session`, `OrderService` в вашем учебном приложении и почему.

## Связь со следующим уроком

Соберём всё в **монолит**: когда один деплой с внутренними модулями — правильный ответ для заказов.
