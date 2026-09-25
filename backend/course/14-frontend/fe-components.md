---
id: fe-components
title: Компоненты без фреймворка
module_id: frontend
module_title: Frontend
module_order: 14
order: 9
---

# Компоненты без фреймворка

## Цель

Научиться делить интерфейс на повторно используемые куски с понятными входами (данные) и выходами (события/колбэки) ещё до React. После урока вы вынесете «карточку заказа» и «баннер ошибки» в функции, которые можно вызвать из общего render.

## Что уже нужно понимать

У вас есть state и функция `render`. Когда `render` разрастается на сотни строк, править список страшно: можно сломать форму. Компонент — соглашение: «вот функция, которая знает, как показать один кусок UI».

## Объяснение

В фреймворках компонент — сущность со жизненным циклом. В ванильном JS достаточно дисциплины:

1. Функция принимает данные (props) и опционально колбэки.
2. Возвращает DOM-узел или DocumentFragment.
3. Не лезет в чужие глобальные переменные без нужды.
4. Не ходит в сеть сама, если это не оговорено (эффект лучше снаружи).

Так вы тренируете тот же мозг, что понадобится в React: сверху вниз данные, снизу вверх события. Карточка заказа не обязана знать URL API — она знает `order` и вызывает `onPack(order.id)` когда нажали кнопку.

Композиция: страница = шапка + список + детали + форма. Список = массив карточек. Ошибка = один баннер. Меняете карточку — список автоматически в новом облике при следующем render.

Граница ответственности: «глупые» (presentational) компоненты только рисуют; «умные» контейнеры знают state и fetch. Даже в одном файле полезно мысленно разделять.

## Термины

- **Props** — входные данные куска UI.
- **Callback** — функция «сообщить родителю о действии».
- **Композиция** — сборка сложных экранов из простых.
- **Presentational** — компонент без собственной загрузки данных.

## Как это устроено

Родитель владеет state. При render он вызывает `OrderItem({ order, selected, onSelect, onPack })` и монтирует результат в список. Дочерний кусок не пишет в `state` напрямую — просит родителя через колбэк. Это сохраняет единый источник правды.

Именование: `createOrderItem` / `renderOrderItem` — глагол создания узла. Позже в React имя с большой буквы `OrderItem` станет обычным. Не смешивайте в одной функции и фильтр всех заказов, и разметку кнопки — разрежьте.

Стили: классы на корне компонента (`order-item`) изолируют CSS по соглашению. Без Shadow DOM это не жёсткая изоляция, но порядок лучше, чем глобальные `div > span`.

## Пример

```javascript
function ErrorBanner({ message }) {
  if (!message) return null;
  const el = document.createElement("div");
  el.className = "error-banner";
  el.setAttribute("role", "alert");
  el.textContent = message;
  return el;
}

function OrderItem({ order, selected, onSelect, onPack }) {
  const li = document.createElement("li");
  li.className = "order-item" + (selected ? " is-selected" : "");
  li.tabIndex = 0;

  const title = document.createElement("button");
  title.type = "button";
  title.className = "order-item__title";
  title.textContent = `#${order.id} — ${order.customer}`;
  title.addEventListener("click", () => onSelect(order.id));

  const status = document.createElement("span");
  status.className = `status status-${order.status}`;
  status.textContent = order.status;

  const packBtn = document.createElement("button");
  packBtn.type = "button";
  packBtn.textContent = "В упаковку";
  packBtn.disabled = order.status === "packing";
  packBtn.addEventListener("click", () => onPack(order.id));

  li.append(title, status, packBtn);
  return li;
}

function OrderList({ orders, selectedId, onSelect, onPack }) {
  const ul = document.createElement("ul");
  ul.className = "order-list";
  for (const order of orders) {
    ul.appendChild(
      OrderItem({
        order,
        selected: order.id === selectedId,
        onSelect,
        onPack,
      })
    );
  }
  return ul;
}

function renderApp(root, state, actions) {
  root.replaceChildren();
  const banner = ErrorBanner({ message: state.error });
  if (banner) root.appendChild(banner);
  root.appendChild(
    OrderList({
      orders: state.orders,
      selectedId: state.selectedId,
      onSelect: actions.select,
      onPack: actions.pack,
    })
  );
}
```

## Разбор примера

`ErrorBanner` возвращает `null`, если ошибки нет — родитель проверяет. `role="alert"` помогает вспомогательным технологиям. Текст только через `textContent`.

`OrderItem` не знает, массив это или ответ сервера: ему дали `order`. Кнопка заголовка и кнопка действия разделены — клик по названию выбирает, клик «В упаковку» меняет статус через `onPack`. `disabled` вычисляется из данных, не из «памяти кнопки».

`renderApp` — тонкий оркестратор. `actions` приходят снаружи: там живут присвоения state и `fetch`. Компоненты остаются проверяемыми: можно вызвать `OrderItem` в изоляции.

## Типичные ошибки

- Компонент сам вызывает `fetch` и ещё три соседних компонента.
- Писать в глобальный `state` из глубины дерева.
- Передавать «всё подряд» огромным объектом без нужды.
- Дублировать разметку карточки в трёх местах копипастой.
- Считать, что раз нет React, то и границ не нужно.

## Что запомнить

Компонент — функция от данных к UI плюс колбэки наверх. Родитель владеет состоянием. Композиция бьёт монолитный `render`. Этот навык переносится в React почти буквально.

## Задание

Вынесите форму создания заказа в `OrderForm({ onSubmit })`: форма собирает поля и вызывает `onSubmit(payload)`, не зная URL. Подключите к существующему state/render.

## Связь со следующим уроком

Откроем **React**: тот же компонентный мир, но декларативный рендер и обновления за вас.
