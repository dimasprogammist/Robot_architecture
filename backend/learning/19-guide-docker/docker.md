---
id: guide-docker
title: Docker
category: guide-docker
section: Справочник
order: 1
description: справочник по контейнерам
---

# Справочник: Docker

Краткий поисковый справочник по контейнерам: команды, отличия сущностей, сети, тома, Compose и типичные ошибки. Не замена урокам модуля — карта памяти.

## 1. Базовые сущности

### Image (образ)

Неизменяемый шаблон: слои файловой системы + метаданные (Cmd, Env, Workdir, ExposedPorts). Образ сам по себе не слушает порты и не держит процесс. Его собирают (`build`), скачивают (`pull`), удаляют (`rmi`).

Идентификация:

- имя и тег: `postgres:16-alpine`;
- digest: `sha256:…` — точное содержимое.

`latest` — подвижный указатель; для воспроизводимости фиксируйте версию или digest.

### Container (контейнер)

Запущенный (или остановленный) экземпляр на базе образа: процесс в Linux namespaces + writable-слой поверх read-only слоёв образа. Удаление контейнера не удаляет образ. Данные вне томов в writable-слое пропадают вместе с контейнером.

Формула: **образ = класс/шаблон ФС, контейнер = процесс + слой записи**.

### Volume (том)

Хранилище вне эфемерного слоя контейнера. Named volume управляется Docker и переживает `rm` контейнера. Bind mount — путь хоста, смонтированный внутрь.

### Network

Виртуальная сеть (часто bridge). User-defined сети и сети Compose дают DNS по имени контейнера/сервиса.

### Dockerfile

Рецепт сборки образа. Инструкции создают слои (`RUN`, `COPY`) или метаданные (`ENV`, `CMD`, `EXPOSE`).

### Compose

YAML-описание набора сервисов, сетей и томов. Имя сервиса = DNS-имя внутри сети проекта.

---

## 2. Команды: образы

| Команда | Зачем |
|---------|--------|
| `docker pull NAME[:TAG]` | Скачать образ из registry, не запуская |
| `docker images` / `docker image ls` | Список локальных образов |
| `docker build -t NAME:TAG .` | Собрать образ из Dockerfile в текущем контексте |
| `docker build -f path -t NAME .` | Указать другой файл рецепта |
| `docker history NAME` | Показать слои и команды сборки |
| `docker image inspect NAME` | JSON метаданных, digests, Env, Cmd |
| `docker tag SRC DEST` | Дополнительное имя/тег на тот же образ |
| `docker push NAME:TAG` | Отправить в registry |
| `docker rmi NAME` | Удалить образ (если нет зависимостей-контейнеров) |
| `docker image prune` | Убрать висячие образы без тегов |

Зачем `build -t`: без тега останется только `<none>` или id — неудобно ссылаться. Зачем `history`: найти толстый слой и секрет, случайно попавший в `ENV`/`RUN`.

---

## 3. Команды: контейнеры

| Команда | Зачем |
|---------|--------|
| `docker run IMAGE` | Создать и стартовать контейнер |
| `docker run -d --name X IMAGE` | Фон + понятное имя |
| `docker run --rm IMAGE` | Удалить контейнер после выхода |
| `docker run -p HOST:CONT IMAGE` | Проброс порта на хост |
| `docker run -e KEY=VAL IMAGE` | Переменная окружения runtime |
| `docker run --env-file FILE IMAGE` | Пакет env из файла |
| `docker run -v VOL:/path IMAGE` | Named volume |
| `docker run -v /host:/cont IMAGE` | Bind mount |
| `docker run --network NET IMAGE` | Подключить к сети |
| `docker ps` | Только running |
| `docker ps -a` | Включая stopped |
| `docker stop X` | SIGTERM, затем SIGKILL |
| `docker start X` | Старт существующего |
| `docker restart X` | stop+start |
| `docker rm X` | Удалить остановленный |
| `docker rm -f X` | Остановить и удалить |
| `docker logs X` | stdout/stderr |
| `docker logs -f X` | Следить за потоком |
| `docker exec -it X sh` | Шелл в уже running контейнере |
| `docker inspect X` | Полный JSON конфиг |
| `docker container prune` | Удалить все stopped |

Зачем `-p`: без публикации порт виден только внутри Docker-сетей. Зачем `exec`: отладка без SSH в образе. Зачем `--rm`: не копить мусор после одноразовых job.

Частые флаги `run`:

- `-it` — интерактив + TTY (шелл);
- `--memory`, `--cpus` — лимиты cgroups;
- `--restart unless-stopped` — политика перезапуска;
- `--name` — стабильное имя вместо случайного.

---

## 4. Команды: тома и сети

| Команда | Зачем |
|---------|--------|
| `docker volume ls` | Список томов |
| `docker volume create NAME` | Создать заранее |
| `docker volume inspect NAME` | Mountpoint и метки |
| `docker volume rm NAME` | Удалить неиспользуемый том |
| `docker volume prune` | Удалить неиспользуемые тома |
| `docker network ls` | Список сетей |
| `docker network create NAME` | User-defined bridge с DNS |
| `docker network connect NET CONT` | Подключить контейнер к сети |
| `docker network inspect NET` | Кто подключён, подсеть |
| `docker network rm NAME` | Удалить сеть |

Зачем user-defined сеть: на default `bridge` удобный DNS имён как в Compose ограничен; для связки вручную создавайте сеть и подключайте оба контейнера.

---

## 5. Команды: система и диагностика

| Команда | Зачем |
|---------|--------|
| `docker version` | Клиент и сервер (демон) |
| `docker info` | Драйвер storage, root dir, runtime |
| `docker system df` | Место: images, containers, volumes |
| `docker system prune` | Очистка мусора (осторожно с флагами) |
| `docker compose version` | Версия Compose plugin |

`prune -a` и `prune --volumes` агрессивны: можно снести нужные образы и тома. На учебной машине ок после осознанного решения; на общей — нет.

---

## 6. Docker Compose: команды

| Команда | Зачем |
|---------|--------|
| `docker compose up` | Создать и стартовать, логи в foreground |
| `docker compose up -d` | В фоне |
| `docker compose up -d --build` | Пересобрать и поднять |
| `docker compose down` | Стоп и удаление контейнеров/сети проекта |
| `docker compose down -v` | То же + тома проекта |
| `docker compose ps` | Статус сервисов |
| `docker compose logs -f [SVC]` | Логи |
| `docker compose build [SVC]` | Сборка |
| `docker compose exec SVC CMD` | Как docker exec |
| `docker compose run --rm SVC CMD` | One-shot (миграции) |
| `docker compose config` | Показать итоговый YAML после подстановок |
| `docker compose pull` | Обновить образы image: | 

Зачем `config`: проверить, что `${VAR}` подставились, до `up`. Зачем `run` для миграций: не держать мигратор как долгоживущий сервис.

---

## 7. Отличие image и container (чеклист)

1. Образ не «запущен» — у него нет PID приложения.
2. Несколько контейнеров могут стартовать из одного образа.
3. Правки файлов в контейнере не меняют образ (пока нет `commit` — обычно не надо).
4. `docker rm` ≠ `docker rmi`.
5. Тег указывает на образ; имя контейнера — на экземпляр (`--name`).
6. Размер в `images` — про слои образа; растущий диск от контейнеров часто из writable-слоёв и логов.
7. Обновление кода в проде = новый образ + новый контейнер, а не «подкрутить» старый.

---

## 8. Слои и union FS (сжато)

- Слои образа read-only, шарятся между образами с общим предком.
- Контейнер видит union + свой writable слой (copy-on-write).
- `RUN rm` в новом слое скрывает файл whiteout, но байты нижнего слоя остаются в образе.
- Тяжёлое + очистка — в одном `RUN`.
- Multi-stage: артефакт копируют в тонкий финальный образ без toolchain.
- Секрет в любом слое остаётся в истории образа.

---

## 9. Тома: правила

1. БД без volume при удалении контейнера теряет данные — пишет в writable-слой.
2. Named volume — данные под управлением Docker; переживает `compose down` без `-v`.
3. `compose down -v` удаляет тома, объявленные в проекте.
4. Bind — для кода в dev; для data directory СУБД на Desktop иногда лучше named volume.
5. Init-скрипты официальных образов Postgres срабатывают на **пустом** data dir.
6. Бэкап: `pg_dump` / бэкап тома; не `docker commit` БД.

---

## 10. Сети: правила

1. У контейнера свой network namespace.
2. Bridge связывает контейнеры на одном хосте.
3. В Compose имя сервиса резолвится DNS внутри сети проекта.
4. `localhost` внутри контейнера — сам контейнер, не хост и не сосед.
5. `-p` нужно для доступа с хоста/интернета; api↔db обходятся без publish.
6. Браузер не видит Docker DNS: либо publish, либо reverse proxy на одном origin.
7. Разные compose-проекты — разные сети по умолчанию.

---

## 11. Переменные окружения

| Место | Назначение |
|-------|------------|
| `ENV` в Dockerfile | Default в образе (не секреты) |
| `ARG` | Только build-time |
| `docker run -e` / compose `environment` | Runtime стенда |
| `env_file` / `.env` | Удобная локальная подача |
| Секрет-хранилище CI/CD | Прод |

Фронт: `VITE_*` / `REACT_APP_*` часто запекаются при `npm run build` — runtime `-e` на nginx их не меняет.

---

## 12. Пример Compose из трёх сервисов

Полный учебный стек: Postgres + API + nginx со статикой и proxy.

```yaml
# compose.yaml
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
      timeout: 3s
      retries: 10
    networks:
      - appnet

  api:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://app:${POSTGRES_PASSWORD}@db:5432/app
      APP_ENV: development
    depends_on:
      db:
        condition: service_healthy
    networks:
      - appnet

  web:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - api
    networks:
      - appnet

volumes:
  pgdata:

networks:
  appnet:
```

Файл `.env` (не коммитить с реальными секретами):

```text
POSTGRES_PASSWORD=dev-only-change-me
```

Минимальный backend Dockerfile:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Минимальный frontend Dockerfile (статика + proxy):

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

Фрагмент `nginx.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    location /api/ {
        proxy_pass http://api:8000/;
        proxy_set_header Host $host;
    }
    location / {
        try_files $uri /index.html;
    }
}
```

Запуск:

```bash
docker compose up -d --build
curl -s http://localhost:8080/api/health
docker compose logs -f api
docker compose down       # pgdata сохраняется
# docker compose down -v  # сотрёт pgdata — только осознанно
```

Путь запроса: браузер → `localhost:8080` → web(nginx) → DNS `api:8000` → DNS `db:5432` → файлы на томе `pgdata`.

---

## 13. Типичные ошибки и симптомы

| Симптом | Вероятная причина |
|---------|-------------------|
| Published порт, connection refused | Процесс слушает 127.0.0.1, нужен 0.0.0.0 |
| could not translate host name / resolve | Неверное имя; сервис не в той сети; опечатка |
| connection refused к БД на localhost | URL БД с localhost внутри api-контейнера |
| Пустая БД после recreate | Не было volume / сделали `down -v` |
| Пароль «не меняется» | Том уже инициализирован; env init не повторяется |
| Браузер не открывает `http://api:8000` | Браузер вне Docker DNS |
| CORS ошибки в dev | Фронт и API на разных origin без proxy/CORS |
| Образ раздут | Нет `.dockerignore`; rm в отдельном слое; devDeps в проде |
| Секрет «удалили» из образа | Он остался в нижнем слое history |
| api упал при первом up | depends_on без healthcheck; БД ещё не ready |
| Permission denied на томе | UID процесса ≠ владелец файлов на bind |
| Порт already allocated | Другой контейнер/процесс занял HOST-порт |
| Изменения кода не видны | Код скопирован в образ без bind; нужен rebuild |
| `exec` не коннектится | Контейнер не running (`ps -a`) |

---

## 14. Чеклист Dockerfile

1. Конкретный тег базы, не слепой `latest` в проде.
2. `.dockerignore`: `.git`, venv, `node_modules`, `.env`, кэши.
3. Сначала манифест зависимостей и install, потом копирование кода.
4. Очистка кэша пакетного менеджера в том же `RUN`.
5. Exec-форма `CMD`/`ENTRYPOINT` для сигналов.
6. Non-root `USER`, если пути и порты позволяют.
7. Секреты не в `ENV`/`ARG`, попадающих в слои.
8. Multi-stage для сборки фронта и компилируемых языков.
9. `EXPOSE` документирует; publish отдельно.
10. Приложение слушает `0.0.0.0` для сетевого доступа.

---

## 15. Чеклист Compose / стека

1. Том на data directory БД.
2. Пароли через `.env` / секреты, не в git.
3. Имена хостов в URL = имена сервисов.
4. Healthcheck БД + condition для api.
5. Не публиковать БД наружу без нужды.
6. Фронт в проде: proxy `/api` на api, а не `http://api` в бандле для браузера.
7. Понимать разницу `down` и `down -v`.
8. Логи сервисов смотреть по отдельности при отладке.
9. Миграции — явный `compose run`, не магия.
10. Один проект — одна сеть по умолчанию; внешняя связь — через `external` network осознанно.

---

## 16. Краткая модель изоляции

Контейнер — не виртуальная машина. Ядро одно (хостовое / Linux VM на Desktop). Namespaces ограничивают видимость:

- PID — своё дерево процессов (часто приложение = PID 1 внутри);
- Mount — своя корневая ФС из слоёв;
- Net — свои интерфейсы и порты;
- UTS/IPC и др. — по необходимости.

Cgroups ограничивают CPU/память, если задать лимиты. Без лимитов изоляция видимости не спасает от исчерпания ресурсов хоста.

---

## 17. Быстрые рецепты

**Только посмотреть файлы образа:**

```bash
docker create --name tmp IMAGE
docker export tmp | tar -t | head
docker rm tmp
```

**Зайти в сеть и проверить DNS:**

```bash
docker compose exec api getent hosts db
# или
docker compose exec api python -c "import socket; print(socket.gethostbyname('db'))"
```

**Дамп Postgres:**

```bash
docker compose exec -T db pg_dump -U app app > backup.sql
```

**Восстановление в пустой том (упрощённо):**

```bash
docker compose exec -T db psql -U app app < backup.sql
```

**Пересобрать один сервис:**

```bash
docker compose up -d --build api
```

**Свободное место:**

```bash
docker system df
docker builder prune
```

---

## 18. Что не смешивать

| Не делать | Вместо этого |
|-----------|--------------|
| Хранить прод-данные только в контейнере | Том / внешняя БД |
| Класть секреты в образ | Runtime env / secret store |
| Учить браузер имени `db`/`api` | Proxy или localhost publish |
| `docker commit` как релиз | Dockerfile + build + tag |
| Один огромный контейнер «как ВМ» | Сервисы по ролям |
| Игнорировать digest в проде | Фиксация версии артефакта |

---

## 19. Связь с уроками модуля

| Урок | Фокус |
|------|--------|
| dk-why | Зачем контейнеры, namespaces vs VM |
| dk-image | Шаблон ФС, теги, digest |
| dk-container | Процесс, lifecycle, writable |
| dk-dockerfile | Рецепт сборки |
| dk-layers | Union FS, размер, кэш |
| dk-volumes | Данные переживают контейнер |
| dk-networks | Bridge, DNS имён |
| dk-env | Конфиг без пересборки |
| dk-compose | Стек декларативно |
| dk-backend | 0.0.0.0, URL на db |
| dk-frontend | Статика, nginx, бандл env |
| dk-db | Том для СУБД, init |
| dk-together | Сквозной путь запроса |

---

## 20. Памятка на одну минуту

1. Образ — шаблон; контейнер — процесс в namespaces.
2. Слои read-only; запись контейнера — сверху или в том.
3. Том для БД обязателен, иначе данные умрут с контейнером.
4. Compose-имя сервиса — хост для соседей; браузер его не видит.
5. Слушай `0.0.0.0`; в URL БД пиши `db`, не `localhost`.
6. Секреты и стенд — в env, не в слоях.
7. `down -v` опасен для данных; `history` хранит ошибки сборки навсегда.
