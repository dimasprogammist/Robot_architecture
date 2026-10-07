---
id: cap-request
title: Путь одного HTTP-запроса
module_id: capstone
module_title: Как это собирается в одно приложение
module_order: 27
order: 2
---

# Путь одного HTTP-запроса

## Цель

Пройти один запрос от клика в React до строки в PostgreSQL и JSON-ответа — пошагово, с фрагментами кода на каждом слое. После урока вы сможете поставить breakpoint мысленно в любом месте цепочки.

## Что уже нужно понимать

Карта приложения (предыдущий урок). Базовый React, fetch, FastAPI, SQL INSERT/SELECT.

## Объяснение

### Сценарий

Пользователь на странице «Новый заказ» нажимает кнопку **Создать**. Браузер должен получить `{ "id": 90421, "status": "new", ... }` и показать карточку. Разберём путь.

### Шаг 1. Клик в React

Компонент держит состояние формы и вызывает обработчик:

```tsx
async function onSubmit(e: FormEvent) {
  e.preventDefault();
  setSaving(true);
  try {
    const order = await createOrder({
      customer_id: customerId,
      items: lines,
    });
    setCreated(order);
  } catch (err) {
    setError("Не удалось создать заказ");
  } finally {
    setSaving(false);
  }
}
```

До сети UI только собрал данные. Ошибки сети ещё впереди.

### Шаг 2. HTTP-клиент

Функция API-слоя фронта:

```ts
export async function createOrder(body: CreateOrderBody): Promise<Order> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}
```

Браузер открывает TCP (или переиспользует keep-alive) к origin, отправляет HTTP/1.1 или HTTP/2 запрос с JSON-телом.

### Шаг 3. Сеть и reverse proxy (если есть)

В Docker часто: браузер → `nginx`/`caddy` → контейнер `api:8000`. Прокси снимает TLS и проксирует `/api` на FastAPI. Для учебного стенда React dev-server может проксировать сам.

На этом шаге важны: CORS (если origin другой), таймауты, размер тела.

### Шаг 4. FastAPI принимает запрос

```python
@router.post("/orders", response_model=OrderOut, status_code=201)
def post_order(
    body: CreateOrderIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = order_service.create(db, user_id=user.id, data=body)
    return OrderOut.model_validate(order)
```

Что произошло:

1. маршрутизатор нашёл handler по методу и пути;
2. Pydantic проверил тело (`CreateOrderIn`) — иначе 422;
3. `get_current_user` достал пользователя из JWT/сессии — иначе 401;
4. `get_db` выдал сессию SQLAlchemy;
5. управление передано в service.

Роут **не** пишет SQL.

### Шаг 5. Service — правила

```python
def create(db: Session, user_id: int, data: CreateOrderIn) -> Order:
    if not data.items:
        raise DomainError("Пустой заказ")
    total = money.sum_lines(data.items)
    if total <= 0:
        raise DomainError("Некорректная сумма")
    order = orders_repo.insert(
        db,
        user_id=user_id,
        customer_id=data.customer_id,
        total=total,
        status="new",
        items=data.items,
    )
    db.commit()
    return order
```

Здесь живут инварианты. `DomainError` на границе API станет 400/409.

### Шаг 6. Repository — SQL

```python
def insert(db, user_id, customer_id, total, status, items) -> Order:
    order = Order(
        user_id=user_id,
        customer_id=customer_id,
        total=total,
        status=status,
    )
    db.add(order)
    db.flush()  # получаем order.id
    for line in items:
        db.add(OrderItem(order_id=order.id, product_id=line.product_id, qty=line.qty, price=line.price))
    return order
```

Фактически PostgreSQL выполнит что-то вроде:

```sql
INSERT INTO orders (user_id, customer_id, total, status)
VALUES (7, 55, 1990.00, 'new')
RETURNING id;
INSERT INTO order_items (order_id, product_id, qty, price) VALUES (...);
```

Данные попали в WAL и (после commit) устойчивы на диске тома БД.

### Шаг 7. Commit и ответ наружу

`db.commit()` фиксирует транзакцию. FastAPI сериализует `OrderOut` в JSON:

```json
{
  "id": 90421,
  "status": "new",
  "total": "1990.00",
  "customer_id": 55
}
```

Статус HTTP `201`. Заголовки уходят клиенту. Соединение может остаться keep-alive.

### Шаг 8. React получает JSON

`res.json()` → объект → `setCreated(order)` → React перерисовывает компонент. Пользователь видит номер заказа.

Если на шаге 4–6 была ошибка:

- 422 — показать поля формы;
- 401 — увести на логин;
- 500 — общее сообщение + correlation id в поддержку.

### Где что отлаживать

| Симптом | Куда смотреть |
|---------|----------------|
| Кнопка не вызывается | обработчик React |
| Network красный CORS | proxy/CORS на API |
| 422 | схема Pydantic vs тело |
| 401 | токен, Depends auth |
| 500 + traceback SQL | repository / миграция |
| 201, но UI пустой | парсинг JSON / state |

### Что не вошло в этот путь (намеренно)

- WebSocket — отдельный канал после создания;
- Kafka — может публиковаться после commit, но клиент HTTP уже мог получить ответ;
- кэш Redis — для этого POST обычно не нужен.

Синхронный путь запроса — **короткий и синхронный до commit**, если вы так спроектировали service.

### Идемпотентность на будущее

Повторный клик может создать два заказа. Защита:

- disable кнопки (`saving`);
- ключ идемпотентности в заголовке `Idempotency-Key`;
- уникальность на уровне БД.

Это уже часть зрелого пути запроса.

## Коротко

Клик → `fetch` JSON → FastAPI + валидация/auth → service (правила) → repository (SQL) → commit в PostgreSQL → JSON 201 → setState в React. Каждый слой чинит свой класс ошибок; SQL не должен жить в кнопке, а React — в репозитории.

## Проверьте себя

1. Что проверяет Pydantic до вызова service?
2. Зачем `db.commit()` после `insert`, а не «надежда на автокоммит» в учебном коде?
3. Как отличить ошибку фронта от 422 бэкенда в DevTools?
4. Почему роут не должен содержать сырой SQL?
