---
id: fe-api
title: Клиент API на фронтенде
module_id: frontend
module_title: Frontend
module_order: 14
order: 17
---

# Клиент API на фронтенде

## Цель

Вынести вызовы HTTP в отдельный модуль с типами и единой обработкой ошибок, чтобы компоненты React не размножали `fetch` копипастой. После урока у вас будет `ordersApi` для списка, детали, создания и смены статуса.

## Что уже нужно понимать

`fetch`, JSON-контракт, TypeScript-типы `Order`, компоненты с `useEffect`. Когда один и тот же POST написан в форме, в кнопке и в тесте по-разному — расходятся заголовки и разбор ошибок. Слой API — тонкий клиент поверх HTTP.

## Объяснение

Компонент должен знать: «создай заказ с этими полями», а не «какой Content-Type и как достать detail из 422». Модуль `api/orders.ts` инкапсулирует URL, методы, парсинг, выброс доменных ошибок.

Иногда добавляют обёртку `apiFetch` с базовым URL, авторизационным заголовком, логированием. Для курса достаточно ясных функций. Не превращайте слой в «второй бэкенд» с бизнес-правилами скидок — правила на сервере.

Ошибки: класс `ApiError` с `status` и `detail` удобнее, чем голый `Error`, когда UI хочет разный текст для 404 и 409. Пустой список — не ошибка. 204 без тела — отдельная ветка.

Кэширование и retry — позже (React Query и т.д.). Сначала честные функции, возвращающие данные или бросающие.

## Термины

- **API client** — модуль функций доступа к HTTP API.
- **DTO на клиенте** — типы транспортного JSON (часто совпадают с ответом).
- **Базовый URL** — префикс окружения (`VITE_API_URL`).
- **Нормализация ошибки** — приведение ответов сервера к одному виду.

## Как это устроено

Компонент → вызывает `ordersApi.list()` → `fetch` → проверка → `Order[]`. Мутации возвращают обновлённый объект или void; UI решает: обновить state или перезагрузить. Не прячьте `setState` внутри api-модуля — иначе клиент станет зависеть от React.

Конфиг базы через env: в dev прокси Vite на FastAPI, в prod — тот же origin или явный URL. Не хардкодьте `http://localhost:8000` в десяти файлах.

Версионирование: `/api/v1/orders` заранее проще, чем потом ломать всех клиентов. Учебный курс может жить на `/api/orders` — главное единообразие.

## Пример

```ts
// api/http.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const BASE = import.meta.env.VITE_API_URL ?? "";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const detail = data?.detail ?? data;
    throw new ApiError(
      typeof detail === "string" ? detail : `HTTP ${res.status}`,
      res.status,
      detail
    );
  }
  return data as T;
}
```

```ts
// api/orders.ts
import { apiFetch } from "./http";

export type OrderStatus = "new" | "packing" | "shipped" | "cancelled";
export type Order = {
  id: number;
  customer: string;
  city: string;
  status: OrderStatus;
};
export type OrderCreate = { customer: string; city: string };

export const ordersApi = {
  list: (q?: string) =>
    apiFetch<Order[]>(`/api/orders${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  get: (id: number) => apiFetch<Order>(`/api/orders/${id}`),
  create: (body: OrderCreate) =>
    apiFetch<Order>("/api/orders", { method: "POST", body: JSON.stringify(body) }),
  setStatus: (id: number, status: OrderStatus) =>
    apiFetch<Order>(`/api/orders/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
};
```

```tsx
// использование в эффекте
useEffect(() => {
  let cancelled = false;
  ordersApi
    .list()
    .then((data) => {
      if (!cancelled) setOrders(data);
    })
    .catch((e) => {
      if (!cancelled) setError(e instanceof ApiError ? e.message : "Ошибка сети");
    });
  return () => {
    cancelled = true;
  };
}, []);
```

## Разбор примера

`apiFetch` централизует заголовки и разбор ошибок. Пустой 204 поддержан. Парсинг через `text` + `JSON.parse` аккуратно переживает пустое тело.

`ordersApi` — словарь операций домена заказов, не «generic CRUD helper» без имён. Имена методов читаются в компоненте как сценарии.

Флаг `cancelled` в эффекте — простой способ не писать в state после размонтирования, если не используете AbortController на этом уровне (ещё лучше прокинуть signal в `apiFetch`).

## Типичные ошибки

- Дублировать URL и заголовки в каждом компоненте.
- Возвращать `any` из клиента API.
- Ловить ошибки в api-слое через `alert`.
- Смешивать React state внутрь `ordersApi`.
- Забыть прокси/CORS и винить слой API.

## Что запомнить

Клиент API — тонкая типизированная обёртка над HTTP. Компоненты вызывают сценарии домена. Ошибки нормализуются. Конфиг базы — из окружения. Так проще менять бэкенд и тестировать UI на моках.

## Задание

Добавьте `ordersApi.remove(id)` и кнопку удаления на карточке. На 404 покажите «Заказ уже удалён» отдельно от прочих ошибок (`e.status === 404`).

## Связь со следующим уроком

Соберём **архитектуру фронтенда** панели: слои UI, state, api, как не превратить React-приложение в свалку.
