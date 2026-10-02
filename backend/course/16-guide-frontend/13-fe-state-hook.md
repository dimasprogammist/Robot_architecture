---
id: fe-state-hook
title: useState — локальное состояние
module_id: frontend
module_title: Frontend
module_order: 14
order: 13
---

# useState — локальное состояние

## Цель

Уверенно хранить и обновлять локальное состояние React-компонента через `useState`: списки, флаги, поля формы. После урока вы реализуете выбор заказа и переключение статуса без ручного DOM.

## Что уже нужно понимать

Компонент перерисовывается, когда меняется его state или props. В ванильном JS вы писали `state.x = ...; render(state)`. В React присваивание в переменную не запустит перерисовку — нужен сеттер из `useState`.

## Объяснение

`const [value, setValue] = useState(initial)` создаёт кусок состояния, привязанный к экземпляру компонента на экране. `value` — текущее; `setValue` — запланировать обновление и новый рендер. Initial используется только при первом монтировании (если не ленивый инициализатор-функция).

Обновляйте объекты и массивы иммутабельно: новый массив/объект. Причина не «религия», а механизм сравнения и предсказуемость. Для смены статуса заказа: `setOrders(prev => prev.map(...))`. Функциональная форма `setX(prev => ...)` нужна, когда новое значение зависит от старого — особенно в быстрых последовательных обновлениях и внутри асинхронных колбэков.

Несколько кусков state: можно несколько `useState`, можно один объект. Для учебной панели удобно разделить `orders`, `loading`, `error`, `selectedId` — меньше случайных пропусков полей при копировании объекта.

Правила хуков: только на верхнем уровне компонента (не в циклах/условиях). Иначе React потеряет соответствие «номер хука → значение».

## Термины

- **Сеттер** — функция обновления state.
- **Функциональное обновление** — `setX(prev => next)`.
- **Монтирование** — первое появление компонента в дереве.
- **Локальный state** — принадлежит компоненту, не серверу сам по себе.

## Как это устроено

Вызов `setOrders` не меняет `orders` синхронно в следующей строке того же обработчика так, как думают новички: вы читаете ещё старое значение переменной замыкания кадра. Поэтому «прочитал orders, поменял, setOrders(orders)» после await часто использует устаревший снимок — берите `prev` или опирайтесь на id из события.

Подъём состояния (lifting state up): если два ребёнка должны видеть один selectedId, state живёт в родителе и передаётся props. Не дублируйте копии одного и того же выбранного id в каждом ребёнке.

Локальный UI-state (открыта ли подсказка) держите рядом с виджетом. Серверные данные после `fetch` тоже кладут в `useState`, но источник правды — API; state — кэш на клиенте.

## Пример

```tsx
import { useState } from "react";

type Order = { id: number; customer: string; status: "new" | "packing" };

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([
    { id: 101, customer: "Ромашка", status: "new" },
    { id: 102, customer: "Василёк", status: "new" },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState("");

  const visible = orders.filter((o) =>
    o.customer.toLowerCase().includes(filter.trim().toLowerCase())
  );

  function pack(id: number) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "packing" } : o))
    );
  }

  function addDemo() {
    setOrders((prev) => {
      const id = prev.reduce((m, o) => Math.max(m, o.id), 100) + 1;
      return [...prev, { id, customer: `Клиент ${id}`, status: "new" }];
    });
  }

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Фильтр по клиенту"
      />
      <button type="button" onClick={addDemo}>
        Демо-заказ
      </button>
      <ul>
        {visible.map((o) => (
          <li key={o.id}>
            <button type="button" onClick={() => setSelectedId(o.id)}>
              #{o.id} {o.customer} [{o.status}]
            </button>
            <button type="button" onClick={() => pack(o.id)}>
              В упаковку
            </button>
          </li>
        ))}
      </ul>
      <aside>{selected ? selected.customer : "Не выбрано"}</aside>
    </div>
  );
}
```

## Разбор примера

Фильтр — контролируемый ввод: `value` из state, `onChange` пишет в state. Не используем `defaultValue` здесь, иначе React не управляет полем.

`visible` — производное: не храним второй массив отфильтрованного в state, иначе придётся синхронизировать два списка. `selected` тоже вычисляется из `orders` и `selectedId`.

`pack` и `addDemo` используют функциональные обновления — безопасно при быстрых кликах. Новый заказ добавляется через новый массив `[...prev, newOrder]`, старые объекты не трогаем без нужды.

## Типичные ошибки

- Мутация `orders.push` + `setOrders(orders)` той же ссылкой.
- Ожидание, что после `setState` следующая строка уже видит новое значение.
- Хранить в state то, что однозначно выводится из другого state.
- Вызывать хуки условно.
- Плодить state «на каждый чих DOM», который должен быть обычной переменной в render.

## Что запомнить

`useState` — локальная память компонента с перерисовкой. Обновляйте иммутабельно, для зависимости от прошлого — форма с `prev`. Поднимайте state, когда им делятся дети. Производные значения считайте при render.

## Задание

Добавьте `loading` и кнопку «Сбросить фильтр». Сделайте `setOrders` для пометки всех `new` → `packing` одной кнопкой через одно функциональное обновление.

## Связь со следующим уроком

Подключим **эффекты (`useEffect`)**: загрузка заказов с API при монтировании и реакция на смену фильтра с осторожностью к циклам.
