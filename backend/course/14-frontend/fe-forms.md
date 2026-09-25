---
id: fe-forms
title: Формы в React
module_id: frontend
module_title: Frontend
module_order: 14
order: 16
---

# Формы в React

## Цель

Научиться строить контролируемые формы создания и редактирования заказа: state полей, проверка, блокировка кнопки, отправка JSON. После урока вы реализуете форму «новый заказ» с понятными сообщениями об ошибках.

## Что уже нужно понимать

HTML-формы, `FormData`, `fetch` POST, `useState`. В React есть два стиля: контролируемые поля (`value` + `onChange`) и неконтролируемые (`ref` / FormData при submit). Для обучения и валидации «на лету» контролируемые предсказуее: одно состояние — и UI, и проверка.

## Объяснение

Контролируемое поле: React владеет строкой в state, input отображает её. Каждый символ → `setCustomer`. Плюс: легко отключить submit, показать ошибку под полем, синхронизировать с props (редактирование). Минус: больше кода, чем «нативная форма без JS».

Валидация на клиенте — для скорости UX, не для безопасности. Пустой customer можно отсечь до запроса; сервер всё равно вернёт 422, если обойти UI. Показывайте серверные `detail` рядом с полями, когда возможно.

UX формы заказа: disabled на время запроса, сброс полей после успеха, фокус на первое ошибочное поле, не чистить форму при ошибке сети (пользователь не перепечатывает всё).

Сложные формы (много шагов, маски) позже уводят в библиотеки. Сначала освоите ручной контроль — иначе библиотека станет магией.

## Термины

- **Контролируемый input** — value из state React.
- **Неконтролируемый** — DOM хранит value, читаем при submit.
- **Client validation** — проверка до запроса.
- **Dirty/touched** — поле трогали; ошибку показывают не с первого кадра.

## Как это устроено

Схема: state полей → derive `canSubmit` → submit handler → `preventDefault` → validate → POST → navigate к детали или очистка. Ошибки поля храните в `errors: Record<string, string>` или отдельных переменных.

Для select статуса при редактировании тот же паттерн. Чекбоксы — boolean в state. Числа — либо строка в поле + parse при submit (меньше боли с пустым вводом), либо number с осторожностью.

Не кладите весь серверный Order в форму без нужды: форма создания имеет другой контракт (без id).

## Пример

```tsx
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

type FormState = { customer: string; city: string };
type FormErrors = Partial<Record<keyof FormState, string>> & { form?: string };

export function CreateOrderForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>({ customer: "", city: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(v: FormState): FormErrors {
    const next: FormErrors = {};
    if (!v.customer.trim()) next.customer = "Укажите клиента";
    if (!v.city.trim()) next.city = "Укажите город";
    return next;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: values.customer.trim(),
          city: values.city.trim(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? `Ошибка ${res.status}`);
      }
      const created = await res.json();
      navigate(`/orders/${created.id}`);
    } catch (err) {
      setErrors({ form: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label>
        Клиент
        <input
          value={values.customer}
          onChange={(e) => setField("customer", e.target.value)}
        />
        {errors.customer && <span role="alert">{errors.customer}</span>}
      </label>
      <label>
        Город
        <input
          value={values.city}
          onChange={(e) => setField("city", e.target.value)}
        />
        {errors.city && <span role="alert">{errors.city}</span>}
      </label>
      {errors.form && <p role="alert">{errors.form}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Создание…" : "Создать"}
      </button>
    </form>
  );
}
```

## Разбор примера

`noValidate` отключает встроенные браузерные балуны — мы показываем свои сообщения единообразно. `validate` чистая: легко покрыть тестом без DOM.

После успеха используем `navigate` на карточку: URL и экран совпадают. Поля не сбрасываем вручную — уходим со страницы формы. При ошибке значения остаются: пользователь правит опечатку.

`setField` типизирован ключом — меньше шансов опечатать имя поля. `submitting` блокирует двойной POST.

## Типичные ошибки

- Смешать controlled и uncontrolled на одном input (value то есть то нет).
- Доверять только клиентской валидации.
- Чистить форму в `finally` даже при ошибке.
- Забыть `preventDefault`.
- Хранить ошибки только в `alert` без привязки к полю.

## Что запомнить

Контролируемые формы = state полей + проверка + submit. Клиентская валидация улучшает UX, серверная обязательна. Блокируйте повторную отправку. Сохраняйте ввод при ошибке сети. После успеха ведите пользователя к следующему осмысленному экрану.

## Задание

Добавьте поле `comment` (опционально, max 200 символов) и счётчик оставшихся символов. Покажите ошибку, если длина превышена, до запроса.

## Связь со следующим уроком

Сведём работу с API в аккуратный слой клиента: функции запросов, типы ответов, единая обработка ошибок для панели.
