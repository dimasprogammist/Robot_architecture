---
id: networking-tls
title: TLS и сертификаты
category: networking
section: Безопасность
order: 10
description: MQTT/HTTPS в парке.
tags: [networking, безопасность]
technologies: [Networking]
related: [protocols-mqtt, protocols-http, linux-ssh]
---

# TLS и сертификаты

Сертификаты с сроком. Провизия на борт. Не самоподписанный навечно без процедуры.

## Зачем это в робототехнической системе

Брокер с TLS между цехами. Внутри шкафа — риск/решение явное.

## Синтаксис и контракт

```text
openssl s_client -connect mqtt:8883
```

## Типичные ошибки

- отключить verify «временно»
- один сертификат на всех роботов без учёта

## В Architecture Canvas

Протокол MQTT/HTTPS: port 8883, notes TLS.

## Связанные разделы
- protocols-mqtt
- protocols-http
- linux-ssh
