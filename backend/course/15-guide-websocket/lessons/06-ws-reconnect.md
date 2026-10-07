---
id: ws-reconnect
title: Переподключение
module_id: websocket
module_title: WebSocket
module_order: 15
order: 6
---

# Переподключение

## Цель

Спроектировать клиентский reconnect с backoff и резynchronизацией.

## Что уже нужно знать

Жизненный цикл.

## Объяснение с нуля

Сеть рвётся. Клиент должен переподключаться с паузой (exponential backoff + jitter), заново авторизоваться и подтянуть пропущенное (snapshot по HTTP или resume cursor).

Сервер не обязан помнить недоставленное, если нет очереди — честно заложите модель доставки.

## Термины

- **Backoff / jitter**.
- **Resume token**.
- **At-most-once / at-least-once**.

## Внутреннее устройство

Клиент: onclose → wait → new WebSocket.

## Пример

После reconnect GET /tasks и затем слушать события.

## Разбор

Иначе UI покажет дыру между офлайном и онлайном.

## Код

```javascript
function connect() {
  const ws = new WebSocket("ws://localhost:8000/ws/tasks");
  ws.onclose = () => setTimeout(connect, 1000 + Math.random()*500);
}
```

## Практика

Почему нужен jitter?

## Типичные ошибки

- Жёсткий reconnect-шторм.
- Молча терять события без синхронизации.

## Что запомнить

Reconnect — часть протокола продукта, не только сети.

## Задание

Опишите стратегию sync после reconnect для задач.

## Связь со следующим уроком

Менеджер клиентов.

### Закрепление 1

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».
