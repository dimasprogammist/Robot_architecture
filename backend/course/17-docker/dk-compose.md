---
id: dk-compose
title: Docker Compose
module_id: docker
module_title: Docker
module_order: 17
order: 9
---

# Docker Compose

## Цель

Научиться описывать многосервисное приложение в Compose: сервисы, сети, тома, зависимости запуска, типичный цикл `up` / `down` / `logs` / `build`.

## Что уже нужно понимать

- Образ и контейнер; Dockerfile для своих сервисов.
- Тома для данных; bridge-сеть и DNS-имена сервисов.
- Переменные окружения и `.env` для секретов локалки.

## Объяснение

Docker Compose — способ сказать: «приложение состоит из нескольких контейнеров, вот как их собрать, связать и сконфигурировать». Вместо десятка ручных `docker run` с правильными флагами — один YAML.

Файл обычно `compose.yaml` или `docker-compose.yml`. Ключевые секции:

- `services` — именованные контейнеры (api, db, web);
- `volumes` — именованные тома верхнего уровня;
- `networks` — сети (или default автоматически);
- у сервиса: `image` или `build`, `ports`, `environment`, `volumes`, `depends_on`, `command`, `restart`.

Имя сервиса становится DNS-именем в сети проекта. Проект по умолчанию именуется по каталогу; можно задать `-p name`.

Команды дня:

```bash
docker compose up -d          # поднять в фоне
docker compose ps             # статус
docker compose logs -f api    # логи
docker compose build          # пересобрать образы
docker compose down           # остановить и удалить контейнеры сети проекта
docker compose down -v        # ещё и тома — осторожно
```

`depends_on` задаёт порядок **создания/старта**, но не ждёт готовности Postgres принимать соединения. Для «ждать БД» используют healthcheck + `depends_on.condition`, или retry в приложении, или entrypoint-скрипт с циклом ожидания. Иначе api может упасть при первом старте и не подняться без restart policy.

Build vs image:

- `image: postgres:16-alpine` — взять готовое;
- `build: ./api` — собрать из Dockerfile в каталоге;
- можно указать и `build`, и `image` (тег результата локальной сборки).

Масштаб: `docker compose up --scale worker=3` для простых случаев; одноразовые учебные стеки обычно без scale.

Override-файлы: `compose.override.yml` автоматически мержится для локальных отличий. В CI указывают явный `-f`.

Compose не заменяет Kubernetes в проде крупной системы, но отлично стандартизирует локальную разработку и небольшие VPS-деплои. Тот же файл — контракт команды: «как поднять систему».

Профили (`profiles`) позволяют не поднимать тяжёлые сервисы (например, mailhog) без флага. Полезно в больших монорепах.

Версия ключа `version:` в современных Compose необязательна; ориентируйтесь на актуальный формат Compose Specification.

## Термины

| Термин | Смысл |
|--------|--------|
| Service | Логический контейнер(ы) в compose-файле |
| Project | Группа ресурсов compose (имя префикса) |
| depends_on | Порядок старта, не полная готовность |
| Healthcheck | Проверка живости процесса/порта |
| Override | Доп. файл, мержащийся в основной |
| up / down | Поднять / разобрать стек |

## Как это устроено

Клиент Compose через API Docker Engine:

1. Создаёт сеть проекта и тома.
2. Собирает образы при необходимости.
3. Создаёт контейнеры с нужными mounts, env, labels.
4. Подключает их к сетям; настраивает publish ports.

Labels помечают ресурсы как принадлежащие проекту — поэтому `down` знает, что удалять. Ручные контейнеры вне compose эти labels не имеют.

DNS: встроенный resolver Docker на user-defined сети отвечает за имена сервисов. Несколько реплик одного сервиса получают DNS round-robin — для учёбы достаточно одной реплики.

## Пример

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 5s
      timeout: 5s
      retries: 10

  api:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://app:${POSTGRES_PASSWORD}@db:5432/app
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy

  web:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - api

volumes:
  pgdata:
```

`.env`:

```text
POSTGRES_PASSWORD=devpass
```

## Разбор

- Три сервиса: данные, API, статический фронт (или SPA за nginx).
- `db` без `ports` — с хоста не торчит, api ходит по имени `db`.
- Healthcheck снижает гонку «api раньше Postgres».
- Том `pgdata` сохраняет данные между `down` без `-v`.
- `web` публикует 8080; браузер не обязан знать про внутреннюю сеть.

Типичный день разработчика: правки кода → при bind mount достаточно restart процесса; при копировании в образ — `compose build api && compose up -d api`.

## Практическое применение

- Онбординг: README говорит `cp .env.example .env && docker compose up`.
- Демо клиенту на одном хосте.
- Интеграционные тесты в CI с compose и ephemeral Postgres.
- Документирование реальной топологии: кто с кем говорит.

## Типичные ошибки

- Путать `depends_on` с ожиданием готовности без healthcheck.
- `down -v` и потеря учебной/боевой БД.
- Разные compose-проекты и ожидание, что имя `db` видно «везде».
- Хардкод паролей в yaml, закоммиченный в git.
- Считать compose полным оркестратором для большого кластера.

## Что запомнить

- Compose описывает стек декларативно.
- Имя сервиса = DNS внутри сети проекта.
- Тома и сети создаются рядом с сервисами.
- `depends_on` ≠ «БД уже принимает запросы» без healthcheck.
- `down -v` удаляет тома — использовать осознанно.

## Задание

Опишите свой учебный стек из трёх сервисов в compose. Поднимите `up -d`, проверьте `ps` и `logs`. Остановите api, поднимите снова. Сделайте `down` и `up` — убедитесь, что данные БД на месте. Затем на копии стенда попробуйте `down -v` и сравните.

## Связь дальше

Следующий урок — **Backend в контейнере**: типичный Dockerfile API, host `0.0.0.0`, миграции и связь с БД по имени сервиса.
