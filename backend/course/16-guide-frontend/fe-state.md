---
id: fe-state
title: Состояние интерфейса
module_id: frontend
module_title: Frontend
module_order: 14
order: 8
---

# Состояние интерфейса

## Цель

Научиться явно хранить состояние панели (данные, загрузка, ошибка, фильтр) в структурах JavaScript и выводить UI как функцию от этого состояния. После урока вы перестанете искать «правду» в тексте DOM и начнёте обновлять экран предсказуемо.

## Что уже нужно понимать

Вы загружаете JSON, пишете в DOM, обрабатываете события. Когда кликов мало, можно импровизировать. Когда появляется фильтр, модалка, повторная загрузка и ошибка сети, импровизация превращается в рассинхрон: на экране одно, в переменных другое, после ответа сервера — третье.

## Объяснение

**Состояние (state)** — все данные, от которых зависит то, что видит пользователь *прямо сейчас*. Для панели заказов минимум:

- список заказов;
- идёт ли загрузка;
- текст ошибки (если есть);
- строка фильтра;
- выбранный id заказа (если есть панель деталей).

Правило новичка: DOM — отражение состояния, а не хранилище. Читать статус, парся `textContent` пункта, — путь к багам. Меняете status в объекте → вызываете `render(state)`.

Почему так: один источник правды. Легче логировать, легче воспроизвести баг, легче потом перейти на React, где тот же принцип обязателен. Серверное состояние (заказы в БД) и клиентское (открыт ли фильтр) различайте: первое синхронизируете через API, второе живёт только во вкладке.

Иммутабельность «по духу»: вместо молчаливой правки вложенного поля иногда удобнее создать новый объект состояния. В ванильном JS это дисциплина; в React позже — обычная практика для корректных обновлений.

## Термины

- **UI state** — состояние интерфейса во вкладке.
- **Server state** — данные с бэкенда (кэш на клиенте).
- **Render** — построение DOM из state.
- **Единый источник правды** — одно место, откуда читают данные для экрана.

## Как это устроено

Цикл: событие или ответ сети → функция обновляет state → `render(state)` → DOM совпадает с моделью. Никаких скрытых флагов «на кнопке через dataset, а список отдельно». Если нужно отладка — `console.log(state)` после каждого изменения.

Разделяйте чистые преобразования и побочные эффекты. `deriveVisibleOrders(state)` только фильтрует массив. `fetch` — побочный эффект: его результат *потом* пишет в state. Не вызывайте `fetch` изнутри `render` без защиты — получите цикл запросов.

Минимальный объект состояния лучше набора глобальных переменных вразнобой: его можно сбросить, подменить в тесте, сериализовать для отчёта об ошибке.

## Пример

```javascript
const state = {
  orders: [],
  loading: false,
  error: null,
  filter: "",
  selectedId: null,
};

function deriveVisible(state) {
  const q = state.filter.trim().toLowerCase();
  return state.orders.filter((o) => {
    if (!q) return true;
    return (
      String(o.id).includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q)
    );
  });
}

function render(state) {
  const statusLine = document.getElementById("status-line");
  const list = document.getElementById("orders");
  const details = document.getElementById("details");

  if (state.loading) {
    statusLine.textContent = "Загрузка…";
  } else if (state.error) {
    statusLine.textContent = state.error;
  } else {
    statusLine.textContent = `Найдено: ${deriveVisible(state).length}`;
  }

  list.replaceChildren();
  for (const order of deriveVisible(state)) {
    const li = document.createElement("li");
    li.textContent = `#${order.id} ${order.customer} — ${order.status}`;
    li.classList.toggle("selected", order.id === state.selectedId);
    li.addEventListener("click", () => {
      state.selectedId = order.id;
      render(state);
    });
    list.appendChild(li);
  }

  const selected = state.orders.find((o) => o.id === state.selectedId);
  details.textContent = selected
    ? `${selected.customer}, ${selected.city}, ${selected.status}`
    : "Выберите заказ";
}

async function loadOrders() {
  state.loading = true;
  state.error = null;
  render(state);
  try {
    const res = await fetch("/api/orders");
    if (!res.ok) throw new Error(`Ошибка ${res.status}`);
    state.orders = await res.json();
  } catch (e) {
    state.error = e.message;
  } finally {
    state.loading = false;
    render(state);
  }
}

document.getElementById("filter").addEventListener("input", (e) => {
  state.filter = e.target.value;
  render(state);
});

loadOrders();
```

## Разбор примера

Все ветки UI читают `state`. Фильтр не прячет заказы «удалением из массива» — он влияет только на `deriveVisible`. Исходный список после загрузки цел; сброс фильтра возвращает всё без нового запроса.

Выделение строки — это `selectedId` в state, а класс `selected` ставится при рендере. Не храним «какая подсвечена» только CSS-классом в DOM.

`loadOrders` сначала ставит `loading` и чистит ошибку: пользователь видит честный промежуточный кадр. После ответа — либо данные, либо сообщение; `loading` всегда выключается.

## Типичные ошибки

- Часть данных в переменных, часть только в DOM.
- Вызывать `fetch` из `render` при каждом чихе.
- Мутировать массив заказов фильтром «навсегда».
- Забывать перерисовать после async-ответа.
- Плодить флаги `isModalOpen2` без структуры.

## Что запомнить

Состояние — явная модель экрана. Render проецирует state в DOM. Разделяйте серверные данные и UI-флаги. Производные значения считайте функцией, не копируйте вручную в третью переменную без нужды. Этот навык — прямой мост к React.

## Задание

Добавьте в state `sortBy: 'id' | 'status'` и кнопки сортировки. Сортировка должна быть чистой функцией от state, без порчи исходного массива (`[...orders].sort(...)`).

## Связь со следующим уроком

Разберём **компонентный подход** без фреймворка: как разрезать UI на куски с входом и выходом, чтобы страница не стала одним бесконечным `render`.
