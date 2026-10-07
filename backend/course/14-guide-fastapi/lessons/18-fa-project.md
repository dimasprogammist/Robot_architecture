---
id: fa-project
title: Структура сервиса
module_id: fastapi
module_title: FastAPI
module_order: 14
order: 18
---

# Структура сервиса

## Цель

Сложить реальный каркас: main, routers, models, schemas, services, db.

## Что уже нужно знать

Документация.

## Объяснение с нуля

Минимальный взрослый каркас сервиса заметок:

- app/main.py — FastAPI, middleware, include_router
- app/db.py — engine, SessionLocal, get_db
- app/models.py — ORM
- app/schemas.py — Pydantic In/Out
- app/services/notes.py — правила
- app/routers/notes.py — HTTP
- app/deps.py — auth dependencies

Роуты тонкие: валидация + вызов сервиса + коды.

## Термины

- **package layout**.
- **тонкие роуты**.

## Внутреннее устройство

Импорты не должны создавать циклы: deps → services → models.

## Пример

POST /notes → router → service.create → repo/session.

## Разбор

Тест сервиса без HTTP; тест роута с override deps.

## Код

```text
app/
  main.py
  db.py
  models.py
  schemas.py
  deps.py
  routers/notes.py
  services/notes.py
```

## Практика

Куда положить миграции Alembic?

## Типичные ошибки

- Круговые импорты.
- Бизнес в main.py.

## Что запомнить

Структура бережёт рост фич.

## Задание

Соберите скелет файлов и один рабочий POST/GET.

## Связь со следующим уроком

Модуль WebSocket: живые соединения.

### Закрепление 1

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».
