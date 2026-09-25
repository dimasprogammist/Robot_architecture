---
id: dk-frontend
title: Frontend в контейнере
module_id: docker
module_title: Docker
module_order: 17
order: 11
---

# Frontend в контейнере

## Цель

Понять два режима фронтенда в Docker: dev-сервер с hot-reload и production-образ со статикой за nginx; разобраться с build-time переменными и проксированием API.

## Что уже нужно понимать

- Backend слушает в своей сети; браузер пользователя работает на хосте или в другом месте.
- SPA/статический сайт — файлы HTML/JS/CSS после сборки.
- Compose связывает сервисы по именам — но браузер не резолвит Docker DNS.

## Объяснение

Фронтенд в контейнере путают чаще бэкенда из-за двух разных миров.

**Мир браузера.** JS выполняется у пользователя. Запросы `fetch('/api/...')` идут с машины пользователя (или его сети), а не из Docker DNS. Имя сервиса `api` из compose **недоступно браузеру**, если только вы не пробросили порты и не используете `localhost:8000`, либо не настроили reverse proxy на одном origin.

**Мир сборки.** `npm run build` может подставить `VITE_API_URL` / `REACT_APP_API_URL` в бандл. Это значение «запекается». Поменять его через `-e` у nginx-контейнера после сборки нельзя без дополнительных трюков.

Типовые схемы:

1. **Dev:** контейнер Node с `npm run dev`, bind mount исходников, порт Vite/Webpack наружу. API_URL = `http://localhost:8000`, потому что браузер на хосте ходит на published порт api.
2. **Prod:** multi-stage — stage node собирает `dist`, stage nginx копирует `dist` и раздаёт. Один origin: nginx проксирует `/api` на `http://api:8000` **внутри** Docker-сети. Браузер видит только `https://site` / `localhost:8080`.

Почему proxy важен: нет CORS-боли на локалке, одни cookies/same-origin проще, DNS имя `api` использует nginx (серверный side), не браузер.

Nginx конфиг в образе:

- `try_files` для SPA (все маршруты → `index.html`);
- `location /api/ { proxy_pass http://api:8000/; }` (точность слэшей настроить под фреймворк).

Размер: не тащить node_modules и компилятор в финальный образ — только статика + nginx на alpine.

Dev на хосте без Docker для фронта тоже нормален; Docker полезен, когда хотят единообразия или нет Node на машине. Курс показывает контейнерный путь.

SSR (Next.js и т.п.) — отдельный долгий процесс Node в проде, не только nginx+статика. Идея env и сетей та же: серверные запросы могут использовать `http://api:8000`, клиентские — публичный URL.

Права и пользователи: nginx-образы уже настроены; для node-сборки иногда нужны нюансы UID на bind — реже критично, чем для томов БД.

Кэш слоёв: сначала `package.json` / lock, потом `npm ci`, потом исходники — как у backend с requirements.

## Термины

| Термин | Смысл |
|--------|--------|
| Static build | Каталог dist/build после сборки |
| Dev server | Vite/Webpack dev с HMR |
| Reverse proxy | Nginx, проксирующий /api к backend |
| Build-time env | Переменные, запечённые в JS |
| Same origin | API и UI на одном хосте/порту снаружи |
| SPA fallback | Отдача index.html для client routes |

## Как это устроено

Prod-цепочка запроса:

1. Браузер → `localhost:8080/index.html` (publish web).
2. Браузер → `localhost:8080/api/users` → nginx в web-контейнере.
3. Nginx → `http://api:8000/users` по Docker DNS.
4. Api → `db:5432` при необходимости.

Dev-цепочка без proxy:

1. Браузер грузит Vite с `localhost:5173`.
2. Браузер напрямую бьёт в `localhost:8000` (CORS должен быть разрешён на api).

Выбор схемы влияет на Dockerfile и на то, какие URL пишут в коде.

## Пример

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

`nginx.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    location /api/ {
        proxy_pass http://api:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    location / {
        try_files $uri /index.html;
    }
}
```

Compose-фрагмент:

```yaml
services:
  web:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - api
```

## Разбор

- Multi-stage: в финале нет Node и исходников TypeScript — только nginx и статика.
- `VITE_API_URL=/api` — относительный путь, браузер ходит на тот же хост, nginx проксирует.
- `proxy_pass` использует имя `api` — это работает внутри Docker-сети.
- SPA `try_files` чинит обновление страницы на клиентских маршрутах.

Если запечь `http://api:8000` в бандл, браузер пользователя не разрезолвит `api` — типичная ошибка.

## Практическое применение

- Прод-подобная раздача UI локально через compose.
- Единый origin для учебного full-stack проекта.
- CI: собрать фронт-образ тем же Dockerfile, что и на стенде.
- Разделение dev-override с Vite и prod-файл с nginx.

## Типичные ошибки

- Ждать, что браузер резолвит имя сервиса compose.
- Путать runtime `-e` с build-time env фронта.
- Тащить dev-сервер Node в прод.
- Забыть SPA fallback и ловить 404 на `/profile` при refresh.
- CORS-хаос из-за смеси localhost:5173 и localhost:8000 без настройки.

## Что запомнить

- Браузер вне Docker DNS; nginx может быть мостом к `api`.
- Прод-фронт часто = статика + nginx (для SPA).
- Multi-stage убирает toolchain из финального образа.
- Build-time URL должны быть осмысленны для браузера.
- Dev и prod Dockerfile/команды могут отличаться осознанно.

## Задание

Соберите multi-stage образ со статикой и nginx, добавьте proxy `/api` на сервис `api`. Откройте UI через published порт и проверьте сетевые запросы в DevTools: путь должен идти на тот же origin. Намеренно запеките `http://api:8000` и объясните ошибку в браузере.

## Связь дальше

Следующий урок — **База данных в Docker**: официальные образы СУБД, тома, пароли, почему данные пропали после recreate.
