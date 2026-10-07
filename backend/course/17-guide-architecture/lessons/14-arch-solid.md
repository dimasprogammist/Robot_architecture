---
id: arch-solid
title: SOLID на примере сервиса заказов
module_id: architecture
module_title: Архитектура ПО
module_order: 17
order: 14
---

# SOLID на примере сервиса заказов

## Цель

Увидеть пять принципов SOLID как практические подсказки в коде Orders API, а не как священный чеклист. После урока вы приведёте по одному примеру соблюдения и нарушения каждого принципа на знакомом домене.

## Что уже нужно понимать

Сервис, порты, домен, SoC, связанность. SOLID — мнемоника; польза только в контексте изменений. Не нужно «внедрить SOLID» лозунгом — нужно узнать боль и приём.

## Объяснение

**S — Single Responsibility.** У класса/модуля одна причина меняться. `OrderRepository` меняют из-за хранения, не из-за шаблона письма. Нарушение: `OrderManager` пишет SQL и SMTP.

**O — Open/Closed.** Открыт к расширению, закрыт к правке проверенного ядра. Новый канал уведомлений — новая реализация `Notifier`, без правки `OrderService.ship`. Нарушение: каждый канал — новый `if kind ==` в сервисе, который уже стабилен.

**L — Liskov Substitution.** Подтип не ломает ожидания контракта. `FakeNotifier` в тестах должен соблюдать семантику «вызвали order_shipped». Нарушение: «реализация» Notifier, которая бросает Always, ломая сценарий, хотя контракт молчит об этом — или, наоборот, silently no-op там, где просили гарантированную доставку без оговорки.

**I — Interface Segregation.** Узкие интерфейсы. Не заставляйте `OrderService` зависеть от жирного `Infra` с методами склада, почты, PDF, CRM. Разрежьте порты. Нарушение: один `PlatformClient` на 40 методов.

**D — Dependency Inversion.** Зависьте от абстракций. Сервис зависит от `Notifier`, деталь SMTP внедряется с края. Нарушение: `from smtplib import SMTP` внутри domain/service.

Применяйте выборочно: для трёхстрочного скрипта миграции не стройте иерархий.

## Термины

- **Принцип** — направляющее правило, не закон физики.
- **Расширение** — новый код рядом, а не правка середины.
- **Контракт подтипа** — поведение, совместимое с ожиданиями клиента абстракции.

## Как это устроено

В Orders monolithic:

| Принцип | Где проявляется |
|---------|-----------------|
| S | api / service / repo / notifier разделены |
| O | новые Notifier без правки ship |
| L | InMemoryRepo соблюдает NotFound |
| I | WarehousePort отдельно от Notifier |
| D | Depends/конструктор внедряет реализации |

Рефакторинг «под SOLID» без сценария изменения — часто вред. Рефакторинг, когда добавление SMS ломает ship — оправдан.

## Пример

```python
# Нарушение O+D: каждый канал — правка сервиса
class OrderServiceBad:
    def ship(self, order_id: int, channels: list[str]) -> None:
        order = self._repo.get(order_id)
        order.ship()
        self._repo.save(order)
        if "email" in channels:
            smtp_send(order)
        if "sms" in channels:
            sms_send(order)
        if "push" in channels:
            push_send(order)


# Ближе к O+D+I
class Notifier(Protocol):
    def order_shipped(self, order: Order) -> None: ...

class CompositeNotifier:
    def __init__(self, parts: list[Notifier]):
        self._parts = parts
    def order_shipped(self, order: Order) -> None:
        for p in self._parts:
            p.order_shipped(order)

class OrderService:
    def __init__(self, repo: OrderRepository, notifier: Notifier):
        self._repo = repo
        self._notifier = notifier
    def ship(self, order_id: int) -> None:
        order = self._repo.get(order_id)
        order.ship()
        self._repo.save(order)
        self._notifier.order_shipped(order)
```

## Разбор примера

В плохом коде добавление Telegram — правка `ship` и риск регрессии отгрузки. В хорошем — новый класс + включение в `CompositeNotifier` на сборке в `main`. Сервис закрыт к этой правке. Зависимость — от `Notifier`. Интерфейс узкий — один метод.

S соблюдён: сервис не знает протоколы доставки. L: каждая часть композита должна быть безопасной; если SMS падает, решите политику (лог/ретрай/не валить весь ship) явно — иначе подтип нарушает ожидание «уведомили».

## Типичные ошибки

- Плодить интерфейсы на каждую функцию заранее.
- Цитировать SOLID в PR без указания, какую боль лечит.
- Ломать простоту CRUD ради «настоящего OCP».

## Что запомнить

SOLID — пять линз на код заказов. S режет роли, O/D расширяют каналы, I сужает порты, L требует честных фейков. Применяйте к боли изменений. Пример с Notifier закрывает сразу несколько букв.

## Задание

Возьмите нарушение S в своём коде (файл с двумя причинами меняться). Предложите два имени модулей после разреза и что останется в каждом.

## Связь со следующим уроком

Сфокусируемся на **внедрении зависимостей (DI)** — как собирать сервис заказов на краю приложения.
