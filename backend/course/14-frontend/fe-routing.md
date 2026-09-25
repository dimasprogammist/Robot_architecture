---
id: fe-routing
title: Маршрутизация на клиенте
module_id: frontend
module_title: Frontend
module_order: 14
order: 15
---

# Маршрутизация на клиенте

## Цель

Понять, зачем одностраничному приложению маршруты и как связать URL с экраном списка или карточки заказа. После урока вы опишете маршруты React Router (или эквивалент) и передадите `id` заказа из пути в компонент.

## Что уже нужно понимать

В обычном многостраничном сайте каждый URL — новый HTML с сервера. В SPA React уже загружен; смена «страницы» — смена компонента при том же документе. URL всё равно нужен: ссылка «открой заказ 101», кнопка «назад», закладка. Маршрутизатор связывает путь с деревом компонентов.

## Объяснение

Клиентский роутер слушает History API (`pushState`, `popstate`) или hash. При изменении пути рендерит соответствующий элемент маршрута. Сервер для прямого захода на `/orders/101` должен уметь отдать оболочку SPA (fallback на `index.html`) — иначе deep link сломается в проде. На учебном Vite dev-сервере это обычно уже настроено.

Зачем не только `selectedId` в state: state помнит вкладка; URL можно послать коллеге. Обновление страницы восстановит контекст, если id в пути, а не только в памяти.

Структура для панели:

- `/orders` — список;
- `/orders/:id` — детали;
- `/orders/new` — форма создания (опционально).

Параметр `:id` читают хуком `useParams`. Навигация — `<Link>` (доступнее и правильнее, чем вручную `window.location`) или `useNavigate` после успешного POST.

Вложенные маршруты: layout с шапкой + `<Outlet />` для содержимого. Список и детали могут делить общий каркас.

## Термины

- **SPA** — single-page application.
- **Route** — правило путь → компонент.
- **Params** — переменные куски пути.
- **Deep link** — прямая ссылка на внутренний экран.
- **Fallback** — отдача SPA-оболочки для клиентских путей на сервере.

## Как это устроено

Клиент перехватывает клик по внутренней ссылке, меняет URL без полной перезагрузки, React рисует другой экран, при необходимости эффект грузит данные по id. Кнопка «назад» браузера возвращает предыдущий путь — роутер подписан на историю.

Не кладите секретные данные в query string. Не используйте роут вместо прав доступа: спрятать UI ≠ запретить API. Сервер всё равно проверяет.

Синхронизация search-параметров (`?status=new`) удобна для фильтров: ими делится ссылка. Читать/писать через API роутера, чтобы не разъехаться с History.

## Пример

```tsx
import { BrowserRouter, Routes, Route, Link, useParams, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

function OrdersLayout() {
  return (
    <div>
      <header>
        <Link to="/orders">Все заказы</Link>
        {" · "}
        <Link to="/orders/new">Создать</Link>
      </header>
      <Outlet />
    </div>
  );
}

function OrdersList() {
  const [orders, setOrders] = useState<{ id: number; customer: string }[]>([]);
  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders);
  }, []);
  return (
    <ul>
      {orders.map((o) => (
        <li key={o.id}>
          <Link to={`/orders/${o.id}`}>
            #{o.id} {o.customer}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState<{ id: number; customer: string; city: string } | null>(null);
  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then(setOrder);
  }, [id]);
  if (!order) return <p>Загрузка…</p>;
  return (
    <article>
      <h1>Заказ #{order.id}</h1>
      <p>
        {order.customer}, {order.city}
      </p>
    </article>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/orders" element={<OrdersLayout />}>
          <Route index element={<OrdersList />} />
          <Route path=":id" element={<OrderDetails />} />
          <Route path="new" element={<p>Форма создания (следующий урок)</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

## Разбор примера

`OrdersLayout` общий: ссылки не исчезают при смене экрана. `Outlet` — место вложенного маршрута. Index-маршрут — список на `/orders`.

`useParams().id` — строка; при запросе к API учитывайте тип (часто оставляют строкой в URL-шаблоне). Эффект зависит от `id`: переход с 101 на 102 перезагрузит детали.

`Link` строит якорные ссылки — можно открыть в новой вкладке. Это лучше, чем только `onClick` + state.

Порядок маршрутов: более конкретный `new` объявлен рядом с `:id`; в React Router v6 матчинг устойчив, но держите «new» явным сегментом, чтобы не принять его за id.

## Типичные ошибки

- Забыть server fallback и получить 404 на обновлении `/orders/101`.
- Хранить единственный способ навигации в state без URL.
- Путать клиентский роут с правом на действие.
- Не сбрасывать/не перезагружать данные при смене param.
- Полная перезагрузка через `<a href>` на внешний origin без нужды внутри SPA (для внутренних — `Link`).

## Что запомнить

Роутер связывает URL и экран SPA. Deep link и «назад» — часть UX. Params кормят загрузку деталей. Layout + Outlet собирают каркас. Сервер должен отдавать оболочку для клиентских путей.

## Задание

Добавьте маршрут `/orders?status=new` через search params: фильтр списка читается из URL и пишется при смене `<select>`. Обновление страницы сохраняет фильтр.

## Связь со следующим уроком

Соберём **формы в React**: контролируемые поля, валидация на клиенте и отправка создания заказа.
