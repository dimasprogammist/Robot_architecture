---
id: dk-backend
title: Backend в контейнере
module_id: docker
module_title: Docker
module_order: 19
order: 10
---

# Backend в контейнере

## Цель

Упаковать backend-сервис в образ: слушать `0.0.0.0`, подключаться к БД по DNS-имени compose, разделять зависимости и код для кэша, понимать миграции и логи в stdout.

## Что уже нужно понимать

- Dockerfile, слои, compose, env, сети и тома.
- HTTP API принимает соединения на TCP-порту.
- Backend обычно зависит от внешней БД.

## Объяснение

Backend в контейнере — обычный процесс фреймворка (Uvicorn, Gunicorn, Node http, и т.д.), запущенный в изоляции. Главные правила, на которых спотыкаются новички:

1. **Слушать не только 127.0.0.1.** Внутри контейнера `localhost` — сам контейнер. Чтобы принимать трафик с других контейнеров или с published-порта хоста, процесс биндится на `0.0.0.0`.
2. **Хост БД — имя сервиса**, например `db`, не `localhost` и не IP ноутбука (кроме особых host-gateway сценариев).
3. **Конфиг через env** — URL БД, секреты, режим debug.
4. **Логи в stdout/stderr** — `docker logs` / централизованный сбор; не единственный файл внутри ФС без тома.

Структура Dockerfile для Python API часто такая: slim-база → зависимости из lock/requirements → копирование пакета → non-root пользователь → CMD с uvicorn.

Миграции: отдельный one-shot контейнер или команда `compose run api alembic upgrade head` перед стартом API. Вшивать авто-миграцию в каждый старт можно для маленьких проектов, но в проде часто контролируют явно.

Hot-reload в dev: bind mount исходников + флаг reload. В prod: код только в образе, reload выключен, несколько воркеров за reverse proxy.

Health: endpoint `/health` для compose healthcheck и балансировщиков. Проверка «процесс жив» недостаточна, если пул к БД мёртв — решайте, что считать healthy.

Статика и медиа: либо отдаёт сам backend (просто, но грубо), либо том/S3 + nginx. В контейнере без тома загруженные файлы пропадут вместе с контейнером.

Сигналы и graceful shutdown: exec-форма CMD, обработка SIGTERM — добить запросы, закрыть пул БД.

Ресурсы: лимиты памяти в compose, чтобы утечка не роняла хост. Для начала достаточно понимать, что лимиты существуют.

Отладка: `compose logs -f api`, `exec` в шелл, проверка `env`, `curl` с соседнего контейнера на `http://api:8000/health`.

Не ставьте SSH-сервер «чтобы зайти в контейнер» — для этого `exec`. Образ API — приложение, не мини-ВМ.

## Термины

| Термин | Смысл |
|--------|--------|
| Bind 0.0.0.0 | Слушать на всех интерфейсах netns |
| WSGI/ASGI server | Процесс, запускающий Python web-приложение |
| Migration job | Одноразовый прогон схемы БД |
| Health endpoint | HTTP-проверка готовности |
| Reverse proxy | Nginx/Caddy перед API в более зрелых схемах |

## Как это устроено

Трафик с хоста: `localhost:8000` → publish → `0.0.0.0:8000` в netns api. Трафик от web-контейнера: DNS `api` → IP api → порт 8000, publish не обязателен.

Соединение с БД: TCP к `db:5432` в общей сети. Auth и имя БД — из env, которые задали и Postgres, и URL api.

Сборка в CI: `docker build` → тесты (иногда `compose run`) → push. На сервере pull того же тега/digest.

## Пример

```dockerfile
FROM python:3.12-slim

WORKDIR /app

RUN useradd --create-home appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

USER appuser
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Фрагмент compose:

```yaml
services:
  api:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://app:${POSTGRES_PASSWORD}@db:5432/app
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
```

## Разбор

- `--host 0.0.0.0` критичен: иначе publish с хоста не достучится до процесса, слушающего только 127.0.0.1.
- Пользователь `appuser` снижает риск от работы под root.
- `DATABASE_URL` с хостом `db` использует DNS compose.
- Порт 8000 публикуется для Postman/браузера с хоста; другим сервисам достаточно `http://api:8000`.

Если добавить reload для dev:

```yaml
command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
volumes:
  - ./backend/app:/app/app
```

В prod этот override не включают.

## Практическое применение

- Единый способ гонять API у всей команды.
- CI собирает тот же Dockerfile, что и разработчик.
- Простая схема: api + db в compose; позже добавить redis/worker тем же паттерном.
- Явные миграции перед выкатом новой версии образа.

## Типичные ошибки

- `--host 127.0.0.1` и «порт проброшен, но connection refused».
- `DATABASE_URL` с `localhost`.
- Секреты в образе.
- Хранение upload только в writable-слое.
- Shell-форма CMD и убийство воркеров без graceful stop.

## Что запомнить

- Backend — процесс в контейнере, слушающий 0.0.0.0.
- БД по имени сервиса и env.
- Логи — в stdout.
- Dev: bind + reload; prod: неизменяемый образ.
- Миграции — отдельный осознанный шаг.

## Задание

Упакуйте учебный API в Dockerfile с `0.0.0.0`. Подключите к Postgres в compose через env. Сломайте host на `127.0.0.1` и на `localhost` в URL БД — опишите симптомы. Добавьте `/health` и healthcheck.

## Связь дальше

Следующий урок — **Frontend в контейнере**: сборка статики, nginx, отличие build-time переменных и раздача SPA.
