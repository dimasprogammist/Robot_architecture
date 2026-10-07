---
id: arch-api
title: API-слой
module_id: architecture
module_title: Архитектура ПО
module_order: 17
order: 10
---

# API-слой

## Цель

Спроектировать тонкий HTTP-слой заказов: маршруты как адаптеры к сценариям, предсказуемые коды ответов, без бизнес-лапищи в роутерах. После урока вы опишете набор эндпоинтов Orders API и ответственность каждого.

## Что уже нужно понимать

DTO, сервис, репозиторий. API — край системы для фронтенда и внешних клиентов. Здесь живут пути, методы, статусы HTTP, аутентификация, ограничения размера тела — не правила «когда можно cancel».

## Объяснение

Хороший API-слой:

- переводит HTTP → вызов use-case;
- переводит результат/ошибки → HTTP;
- документирует контракт (OpenAPI из FastAPI);
- не открывает Session и не пишет SQL.

Ресурсы думайте глаголами домена, не только тупым CRUD: `POST /orders/{id}/ship` яснее, чем `PATCH` с загадочным телом `{flag: 3}`. CRUD уместен для простых сущностей; заказы — с переходами состояния.

Коды: 201 create, 200/204 успех, 400/422 валидация входа, 404 нет сущности, 409 конфликт инварианта, 401/403 доступ. Не маскируйте 409 как 500.

Версия и совместимость: не ломайте поля без нужды; добавляйте опциональные. Префикс `/api` отделяет от статики фронта.

## Термины

- **Адаптер** — перевод внешнего протокола во внутренний сценарий.
- **Идемпотентный метод** — повтор без лишнего эффекта (GET безопасен; PUT часто идемпотентен).
- **Проблемный ответ** — тело ошибки машиночитаемо (`detail`).
- **OpenAPI** — описание контракта.

## Как это устроено

Роутер зависит от `Depends(get_service)`. Авторизация: dependency достаёт пользователя и передаёт `user_id` в сервис — сервис решает «можно ли», API только извлекает identity.

Пагинация: `limit`/`offset` или cursor на list. Таймауты и размер тела — настройки сервера. Логируйте `request_id`, прокидывайте в сервис для трассировки.

Не стройте «универсальный» endpoint на все действия ордера через одну кнопку `action` в теле — сложно документировать и авторизовать точечно. Лучше явные пути.

## Пример

```python
router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.get("", response_model=list[OrderOut])
def list_orders(status: str | None = None, svc: OrderService = Depends(get_svc)):
    return [to_out(o) for o in svc.list(status=status)]

@router.post("", response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, svc: OrderService = Depends(get_svc)):
    order = svc.create(payload.customer, payload.city)
    return to_out(order)

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, svc: OrderService = Depends(get_svc)):
    try:
        return to_out(svc.get(order_id))
    except NotFound as e:
        raise HTTPException(404, str(e)) from e

@router.post("/{order_id}/ship", response_model=OrderOut)
def ship_order(order_id: int, svc: OrderService = Depends(get_svc)):
    try:
        return to_out(svc.ship(order_id))
    except NotFound as e:
        raise HTTPException(404, str(e)) from e
    except Conflict as e:
        raise HTTPException(409, str(e)) from e
```

## Разбор примера

Каждый маршрут — три-пять строк плюс маппинг ошибок. Правил статусов в роутере нет. `201` на создание сообщает семантику. List фильтрует через query-параметр — транспортная деталь, сервис получает уже `status: str | None`.

Пути `ship` читаются в логах и в OpenAPI как сценарии. Фронт из модуля frontend попадает сюда один в один.

## Типичные ошибки

- Толстые роуты с бизнес-логикой.
- Все ошибки → 400 или 500.
- Ломающий change JSON без версии.
- Смешение публичного API и внутренних админ-ручек без защиты.
- Отдача stacktrace клиенту.

## Что запомнить

API-слой — адаптер HTTP↔сценарии заказов. Тонкий, документируемый, с честными кодами. Глаголы домена в путях помогают. Безопасность и валидация входа — здесь и на сервере глубже; правила статусов — ниже.

## Задание

Спроектируйте `POST /api/orders/{id}/cancel` с телом `{reason}`. Какие коды вернёте для уже cancelled, shipped, not found? Зафиксируйте решение письменно.

## Связь со следующим уроком

Углубимся в **доменный слой**: инварианты заказа и почему они не должны жить только в БД или только в API.
