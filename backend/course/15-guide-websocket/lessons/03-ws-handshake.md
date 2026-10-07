---
id: ws-handshake
title: Рукопожатие
module_id: websocket
module_title: WebSocket
module_order: 15
order: 3
---

# Рукопожатие

## Цель

Понять HTTP Upgrade до WebSocket и проверку заголовков.

## Что уже нужно знать

Зачем WS.

## Объяснение с нуля

Клиент шлёт GET с Upgrade: websocket, Connection: Upgrade, Sec-WebSocket-Key. Сервер отвечает 101 Switching Protocols и Sec-WebSocket-Accept. Дальше — бинарный/текстовый фреймовый протокол, уже не классический HTTP request/response.

Токен часто передают query или протокол субпротокола; cookie тоже возможны.

## Термины

- **101 Switching Protocols**.
- **Sec-WebSocket-Key/Accept**.
- **Subprotocol**.

## Внутреннее устройство

Неуспех рукопожатия — обычный HTTP-код (401/403/404).

## Пример

Успех: 101 и открытый канал.

## Разбор

Неверный Accept → клиент закрывает.

## Код

```http
GET /ws/tasks HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Version: 13
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
```

## Практика

Куда поставить проверку Bearer на handshake?

## Типичные ошибки

- Считать, что после 101 можно не аутентифицировать.
- Логировать key как секрет без нужды.

## Что запомнить

Сначала HTTP upgrade, потом фреймы.

## Задание

Нарисуйте sequence handshake с 401.

## Связь со следующим уроком

Фреймы.

### Закрепление 1

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».
