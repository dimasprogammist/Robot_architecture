---
id: fe-architecture
title: Архитектура фронтенд-приложения
module_id: frontend
module_title: Frontend
module_order: 14
order: 18
---

# Архитектура фронтенд-приложения

## Цель

Сложить из уроков модуля цельную картину: как устроена панель заказов на React+TS — слои, границы, поток данных. После урока вы сможете нарисовать схему своего учебного фронта и объяснить, где живёт каждый кусок ответственности.

## Что уже нужно понимать

HTML/CSS/JS, DOM-события, state, React, props, хуки, роутинг, формы, клиент API. Архитектура здесь — не лозунги, а договорённости папок и потоков для конкретного маленького продукта: **Orders Desk**.

## Объяснение

Фронтенд — клиент. Он не хранит бухгалтерскую правду и не заменяет ACL сервера. Его задачи: показать состояние, принять ввод, ходить в API, держать UI-state, маршруты и доступность. Всё, что должно быть истинным для всех операторов, уходит на бэкенд.

Практичная нарезка папок для панели:

- `api/` — HTTP-клиент и типы транспорта;
- `types/` — доменные типы, если не хотите мешать с api;
- `components/` — переиспользуемые куски UI;
- `pages/` или `routes/` — экраны, привязанные к URL;
- `hooks/` — связки эффекта+state (например `useOrders`);
- `styles/` — глобальные токены и сетка.

Поток: URL → page → hook/api → state → components. Обратно: событие в component → колбэк/page → api mutation → обновление state → новый UI. Если mutation знает про CSS-классы — граница нарушена. Если button сам пишет `fetch` и ещё парсит три формата ошибок — вернитесь к `ordersApi`.

Не тащите Redux «на всякий случай». Локальный state + подъём + тонкий контекст для темы/сессии часто достаточно. Сложность инструмента не должна превышать сложность панели.

## Термины

- **Page / Screen** — компонент маршрута.
- **Feature** — вертикальный срез (заказы, настройки).
- **UI state vs server state** — фильтр открыт vs список из БД.
- **Граница слоя** — что модулю запрещено знать.

## Как это устроено

Orders Desk в проде рядом с FastAPI: статику отдаёт nginx или тот же origin, API под `/api`. Docker позже упакует оба. На фронте окружение задаёт базовый URL. Git хранит код; секреты — не в репозитории.

Тестирование по слоям: чистые функции фильтра/валидации — юнит; api — контрактными тестами/моком; компоненты — на действия пользователя. Не требуется покрыть всё сразу, но архитектура должна позволять тестировать кусок без запуска всего браузера.

Эволюция: сегодня список и форма; завтра WebSocket статусов. Слой api/hooks добавит `subscribe`, pages не перепишут с нуля, если не смешали сокет с разметкой кнопки.

## Пример

```text
src/
  api/
    http.ts
    orders.ts
  pages/
    OrdersPage.tsx
    OrderDetailsPage.tsx
    CreateOrderPage.tsx
  components/
    OrderCard.tsx
    StatusBadge.tsx
    ErrorBanner.tsx
  hooks/
    useOrders.ts
  App.tsx          # Router
  main.tsx
```

```tsx
// hooks/useOrders.ts — склейка, не UI
import { useEffect, useState } from "react";
import { ordersApi, Order, ApiError } from "../api/orders";

export function useOrders(filter: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    ordersApi
      .list(filter)
      .then((data) => {
        if (alive) setOrders(data);
      })
      .catch((e) => {
        if (alive) setError(e instanceof ApiError ? e.message : "Сеть");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [filter]);

  return { orders, loading, error };
}
```

```tsx
// pages/OrdersPage.tsx — экран
export function OrdersPage() {
  const [filter, setFilter] = useState("");
  const { orders, loading, error } = useOrders(filter);
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <ErrorBanner message={error} />
      {loading ? <p>Загрузка…</p> : <OrderList orders={orders} />}
    </div>
  );
}
```

## Разбор примера

Хук не импортирует `OrderCard` — только данные. Страница не знает URL FastAPI — только `useOrders` и компоненты. Карточка не знает про фильтр. Каждый файл можно читать и менять с меньшим страхом.

Когда добавится смена статуса, mutation останется в api, страница вызовет `ordersApi.setStatus` и либо обновит локально, либо попросит хук перезагрузить. Решение одно в одном месте.

Такая скромная архитектура масштабируется до телеметрии: тот же каркас, другие `api/telemetry.ts` и страницы.

## Типичные ошибки

- Свалка всего в `App.tsx`.
- Бизнес-правила только на клиенте.
- Циклические импорты pages ↔ components ↔ api.
- Копирование типов Order в пяти местах с расхождениями.
- Внедрение тяжёлого state-менеджера раньше боли.

## Что запомнить

Фронт Orders Desk — слои api, hooks, pages, components. Данные с сервера и UI-флаги различайте. Поток вниз/вверх соблюдайте. Архитектура служит изменению фич, а не красивой диаграмме. Этот модуль подготовил вас к сборке полного приложения в финале курса.

## Задание

Нарисуйте на листе стрелки для сценария «оператор создаёт заказ»: какие файлы вызываются от клика до появления id в URL. Отметьте, где проверка прав должна быть на сервере.

## Связь со следующим модулем

Дальше — **архитектура ПО** на бэкенде того же домена заказов: слои, зависимости, монолит и границы сервисов.
