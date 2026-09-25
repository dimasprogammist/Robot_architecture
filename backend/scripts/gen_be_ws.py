# -*- coding: utf-8 -*-
"""Generate backend, fastapi, websocket lessons + guides."""
from __future__ import annotations

from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
counts: list[tuple[str, int]] = []


def dump(rel: str, text: str, minimum: int) -> None:
    path = BASE / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    text = text.rstrip() + "\n"
    i = 0
    while text.count("\n") < minimum:
        i += 1
        text += (
            f"\n### Закрепление {i}\n\n"
            "Сформулируйте инвариант урока своими словами и один сценарий поломки. "
            "Сверьтесь с примером кода выше.\n"
        )
    path.write_text(text, encoding="utf-8")
    n = text.count("\n")
    counts.append((rel, n))
    print(f"{rel}: {n}")


def course(lid, title, mid, mtitle, morder, order, parts: dict[str, str], rel_dir: str):
    body = [f"# {title}", ""]
    for h in [
        "Цель", "Что уже нужно знать", "Объяснение с нуля", "Термины",
        "Внутреннее устройство", "Пример", "Разбор", "Код", "Практика",
        "Типичные ошибки", "Что запомнить", "Задание", "Связь со следующим уроком",
    ]:
        body += [f"## {h}", "", parts[h].rstrip(), ""]
    text = "\n".join([
        "---", f"id: {lid}", f"title: {title}", f"module_id: {mid}",
        f"module_title: {mtitle}", f"module_order: {morder}", f"order: {order}",
        "---", "", *body,
    ])
    dump(f"{rel_dir}/{lid}.md", text, 110)


def guide(filename, gid, title, category, sections: list[tuple[str, str]]):
    body = [f"# {title}", ""]
    for h, content in sections:
        body += [f"## {h}", "", content.rstrip(), ""]
    text = "\n".join([
        "---", f"id: {gid}", f"title: {title}", f"category: {category}",
        "section: Справочник", "order: 1",
        f"description: Развёрнутый справочник — {title}.",
        "tags: [справочник]", "---", "", *body,
    ])
    dump(f"learning/guides/{filename}", text, 220)


def P(**kw):
    keys = [
        "Цель", "Что уже нужно знать", "Объяснение с нуля", "Термины",
        "Внутреннее устройство", "Пример", "Разбор", "Код", "Практика",
        "Типичные ошибки", "Что запомнить", "Задание", "Связь со следующим уроком",
    ]
    # allow ascii aliases
    alias = {
        "goal": "Цель", "need": "Что уже нужно знать", "explain": "Объяснение с нуля",
        "terms": "Термины", "device": "Внутреннее устройство", "example": "Пример",
        "steps": "Разбор", "code": "Код", "practice": "Практика", "mistakes": "Типичные ошибки",
        "remember": "Что запомнить", "task": "Задание", "nxt": "Связь со следующим уроком",
    }
    out = {}
    for k, v in kw.items():
        out[alias.get(k, k)] = v
    for k in keys:
        if k not in out:
            raise KeyError(k)
    return out


# ================= BACKEND =================
BE = ("backend", "Backend", 11, "course/11-backend")
be = []

be.append(("be-what", "Что такое backend", 1, P(
goal="Понять backend как серверную часть: бизнес-правила, данные, API для клиентов.",
need="Клиент-сервер на уровне «браузер ходит в интернет», базовый HTTP.",
explain="""Backend — программы, которые работают на сервере (или в контейнере), принимают запросы, проверяют права, применяют правила, читают и пишут БД, отдают ответы. Frontend рисует UI; backend хранит истину данных и секреты.

Мини-сервис задач: создать задачу, список, отметить done — всё это backend-операции, даже если UI красивый.""",
terms="- **Клиент** — браузер, мобильное приложение, другой сервис.\n- **Сервер** — процесс, слушающий порт.\n- **API** — контракт запросов и ответов.",
device="Клиент → сеть → HTTP-сервер → роутинг → обработчик → сервис → БД → ответ обратно.",
example="POST /tasks с JSON {title} → 201 и тело задачи с id.",
steps="Сервер проверил JSON, вставил в БД, вернул объект. Без backend браузер не имеет безопасного места для общей БД всех пользователей.",
code="""```text
Клиент: POST /tasks {"title":"Молоко"}
Сервер: 201 {"id":10,"title":"Молоко","done":false}
```""",
practice="Какие секреты нельзя отдавать во frontend?",
mistakes="- Считать backend «только база».\n- Класть пароли в frontend-код.",
remember="Backend владеет данными, правилами и секретами; отдаёт API.",
task="Опишите 5 операций трекера задач для backend.",
nxt="Клиент и сервер: роли и границы.",
)))

be.append(("be-client", "Клиент и сервер", 2, P(
goal="Разделить обязанности клиента и сервера без размытия границ.",
need="Что такое backend.",
explain="""Клиент инициирует запрос, показывает UI, держит эфемерное состояние экрана. Сервер проверяет подлинность, авторизует, валидирует, сохраняет. Нельзя доверять клиенту: он под контролем пользователя.

Общая БД и тарифные лимиты — только на сервере.""",
terms="- **Доверие границе** — сервер не доверяет клиенту.\n- **Контракт API**.",
device="Запрос проходит сеть; сервер не видит «что пользователь думал», только байты запроса.",
example="Клиент шлёт done=true для чужой задачи — сервер обязан отвергнуть по user_id сессии.",
steps="Проверка владельца на сервере обязательна, даже если кнопка скрыта в UI.",
code="""```python
# псевдокод
if task.user_id != current_user.id:
    raise Forbidden()
```""",
practice="Что можно кэшировать на клиенте, а что нельзя считать истиной?",
mistakes="- Валидация только в UI.\n- «Секретный» URL без авторизации.",
remember="Клиент ненадёжен; сервер — граница доверия.",
task="Разнесите проверки формы задачи: UI vs server.",
nxt="HTTP-запрос.",
)))

be.append(("be-request", "HTTP-запрос", 3, P(
goal="Разобрать метод, URL, заголовки, тело запроса.",
need="Клиент-сервер.",
explain="""HTTP-запрос: стартовая строка (метод + путь + версия), заголовки, опциональное тело. Метод говорит о намерении: GET читать, POST создавать, PUT/PATCH обновлять, DELETE удалять — в рамках вашего API-соглашения.

Тело часто JSON. Заголовки несут Content-Type, Authorization, Cookie.""",
terms="- **Метод**, **путь**, **заголовки**, **тело**.\n- **Query string** — параметры после ?.",
device="Сервер парсит байты сокета в структуру request.",
example="GET /tasks?user_id=5 HTTP/1.1\\nHost: api.local\\nAuthorization: Bearer ...",
steps="Метод GET, путь /tasks, query user_id=5, заголовок авторизации. Тела нет.",
code="""```http
POST /tasks HTTP/1.1
Host: api.local
Content-Type: application/json

{"title":"Молоко"}
```""",
practice="Разберите свой запрос из DevTools на метод/путь/заголовки/тело.",
mistakes="- Класть секрет в query-логи.\n- Игнорировать Content-Type.",
remember="Запрос = метод + URL + заголовки + тело.",
task="Составьте запрос на обновление title задачи 10.",
nxt="HTTP-ответ.",
)))

be.append(("be-response", "HTTP-ответ", 4, P(
goal="Читать статус, заголовки и тело ответа; выбирать коды осознанно.",
need="HTTP-запрос.",
explain="""Ответ: статус (200, 201, 400, 401, 403, 404, 500), заголовки, тело. 2xx — успех, 4xx — ошибка клиента, 5xx — ошибка сервера. Тело ошибки лучше делать машиночитаемым JSON с кодом и сообщением.

Нельзя всё отдавать 200 с {ok:false} без причины — ломаете клиентов и мониторинг.""",
terms="- **Status code**.\n- **Reason phrase** (редко важен).\n- **Идемпотентность** рядом с методами.",
device="Фреймворк сериализует объект → JSON → байты + статус.",
example="201 Created с Location и телом задачи; 404 если id нет.",
steps="Клиент ветвится по статусу: 201 показать задачу, 400 подсветить поля.",
code="""```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id":10,"title":"Молоко","done":false}
```""",
practice="Подберите коды для: нет авторизации; нет прав; не найдено; ошибка БД.",
mistakes="- Всегда 200.\n- Отдавать stacktrace наружу.",
remember="Статус — часть контракта, не украшение.",
task="Опишите JSON ошибки валидации для пустого title.",
nxt="Маршрутизация.",
)))

be.append(("be-routing", "Маршрутизация", 5, P(
goal="Связать метод и путь с обработчиком.",
need="Запрос и ответ.",
explain="""Роутинг выбирает функцию по методу и шаблону пути: GET /tasks/{id} → get_task(id). Порядок маршрутов и конфликты важны. Параметры пути, query и body разделяют ответственность.

Версионирование /v1/... — способ эволюции API.""",
terms="- **Route / endpoint**.\n- **Path param**.\n- **Router** — группа маршрутов.",
device="Таблица маршрутов → match → вызвать handler с извлечёнными параметрами.",
example="GET /tasks/10 → id=10 в обработчик.",
steps="Не совпал метод — 405; не совпал путь — 404.",
code="""```python
# псевдокод роутера
routes = {
  ("GET", "/tasks"): list_tasks,
  ("GET", "/tasks/{id}"): get_task,
  ("POST", "/tasks"): create_task,
}
```""",
practice="Спроектируйте пути для комментариев задачи.",
mistakes="- Один гигантский if path.\n- Глаголы в пути вместо методов (/getTasks).",
remember="Маршрут = метод + шаблон пути → обработчик.",
task="Таблица маршрутов CRUD задач.",
nxt="Что такое API.",
)))

be.append(("be-api", "API", 6, P(
goal="Увидеть API как контракт между клиентами и backend.",
need="Маршрутизация.",
explain="""API фиксирует URL, методы, форматы тел, коды ошибок, авторизацию. Менять контракт без версии — ломать клиентов. Документация и примеры — часть продукта.

Внутренние функции Python — не API. API — то, что видно за границей процесса.""",
terms="- **Контракт**.\n- **Обратная совместимость**.\n- **Публичный / приватный API**.",
device="Контракт проверяется тестами и линтерами схем (OpenAPI).",
example="Соглашение: даты ISO-8601, id целые, ошибки {code,message,fields}.",
steps="Клиент обновлён раньше сервера — должен получить понятный 400/426, а не мусор.",
code="""```json
{"code":"validation_error","fields":{"title":"required"}}
```""",
practice="Что будет breaking change в API задач?",
mistakes="- Ломать поля без версии.\n- Разный формат ошибок на каждый endpoint.",
remember="API — обещание; меняйте осторожно.",
task="Черновик контракта POST /tasks.",
nxt="REST-стиль.",
)))

be.append(("be-rest", "REST-стиль", 7, P(
goal="Использовать ресурсы и HTTP-методы в духе REST без религиозных споров.",
need="API.",
explain="""Практический REST: существительные-ресурсы /tasks, /tasks/{id}; методы как действия над ресурсом; статусы по смыслу; JSON. Не обязательно «полный учебник Fielding», но единообразие помогает.

RPC-стиль /doCreateTask тоже живёт в мире, но смешивать без правил — хаос.""",
terms="- **Ресурс**.\n- **Коллекция / элемент**.\n- **Идемпотентность** GET/PUT/DELETE.",
device="Роуты отражают ресурсы; сервис — операции предметной области.",
example="POST /tasks создать; GET /tasks/{id} читать; PATCH /tasks/{id} частично обновить.",
steps="DELETE /tasks/10 → 204 без тела или 404.",
code="""```text
GET /tasks
POST /tasks
GET /tasks/10
PATCH /tasks/10
DELETE /tasks/10
```""",
practice="Смоделируйте /tasks/{id}/comments в REST.",
mistakes="- Глаголы в URL без причины.\n- POST на всё подряд.",
remember="Ресурсы + методы + статусы = понятный HTTP API.",
task="Таблица идемпотентности методов для задач.",
nxt="JSON в API.",
)))

be.append(("be-json", "JSON в API", 8, P(
goal="Сериализовать и принимать JSON без сюрпризов типов.",
need="REST.",
explain="""JSON — текст: объекты, массивы, строки, числа, true/false, null. Даты обычно строки ISO. Числа большие id лучше согласовать (int vs string). Невалидный JSON — 400.

Согласуйте snake_case или camelCase и не мешайте.""",
terms="- **Сериализация / десериализация**.\n- **Content-Type: application/json**.",
device="bytes → json.loads → объекты → проверка схемы → бизнес-логика → dumps.",
example='{"id":10,"title":"Молоко","done":false}',
steps="done как строка \"false\" — ошибка схемы, если ждёте boolean.",
code="""```python
import json
payload = json.loads('{"title":"Молоко"}')
assert payload["title"] == "Молоко"
```""",
practice="Как передать datetime? Приведите пример поля.",
mistakes="- Молча принимать лишние поля без политики.\n- Плывущие типы (то int, то string id).",
remember="JSON-контракт жёстче, чем «просто словарь».",
task="Схема ответа списка задач.",
nxt="Аутентификация.",
)))

be.append(("be-authn", "Аутентификация", 9, P(
goal="Отличать «кто ты» (authentication) от «что тебе можно».",
need="JSON/API.",
explain="""Аутентификация устанавливает личность: логин/пароль, сессия, токен, ключ. Результат — идентификатор пользователя в контексте запроса. Без неё все остальные проверки зыбки.

Пароли только как хеш (bcrypt/argon2), никогда в открытом виде.""",
terms="- **Authentication**.\n- **Credential**.\n- **Principal / current user**.",
device="Middleware читает Cookie/Authorization → проверяет → кладёт user в context.",
example="Authorization: Bearer <token> или Cookie session_id.",
steps="Невалидный токен → 401 Unauthorized.",
code="""```python
# псевдокод
user = auth_service.authenticate(request)
if user is None:
    raise Unauthorized()
```""",
practice="Чем 401 отличается от 403?",
mistakes="- Хранить пароль открытым текстом.\n- Путать 401 и 403.",
remember="Authn отвечает: кто это?",
task="Опишите поток логина с выдачей сессии.",
nxt="Авторизация.",
)))

be.append(("be-authz", "Авторизация", 10, P(
goal="Проверять права: владелец задачи, роли, политики.",
need="Аутентификация.",
explain="""Авторизация решает, разрешено ли действие. Пользователь аутентифицирован, но не может удалить чужую задачу. Модели: владение объектом, роли (admin), ACL, policy functions.

Проверку делают на сервере в одном месте сервиса — не только в UI.""",
terms="- **Authorization**.\n- **Role / permission**.\n- **Owner check**.",
device="После authn вызывается policy(user, action, resource).",
example="user=5, task.user_id=5 → ok; task.user_id=9 → 403.",
steps="403 Forbidden — личность известна, права нет.",
code="""```python
if task.user_id != user.id and not user.is_admin:
    raise Forbidden()
```""",
practice="Нужна ли авторизация на GET списка своих задач?",
mistakes="- Фильтр только в UI.\n- Admin-флаг с клиента.",
remember="Authz отвечает: можно ли?",
task="Политики для read/update/delete задачи.",
nxt="Cookies.",
)))

be.append(("be-cookie", "Cookies", 11, P(
goal="Понять Cookie как хранилище на клиенте, которое браузер сам прикрепляет.",
need="Authn.",
explain="""Set-Cookie в ответе просит браузер хранить пару и слать её обратно. Для сессий важны HttpOnly (недоступно JS), Secure, SameSite. Cookie удобны для браузерных клиентов; для мобильных часто Bearer-токен.

Размер и число cookie ограничены.""",
terms="- **Set-Cookie / Cookie**.\n- **HttpOnly, Secure, SameSite**.",
device="Браузер хранит cookie по домену/пути; сервер читает заголовок Cookie.",
example="Set-Cookie: session=abc; HttpOnly; Path=/; SameSite=Lax",
steps="Следующий запрос автоматически несёт Cookie: session=abc.",
code="""```http
HTTP/1.1 200 OK
Set-Cookie: session=abc; HttpOnly; Path=/
```""",
practice="Зачем HttpOnly против XSS-кражи сессии?",
mistakes="- Класть токен в cookie без флагов.\n- Хранить огромный JSON в cookie.",
remember="Cookie — автоматический заголовок браузера с политикой флагов.",
task="Спроектируйте cookie сессии для API на HTTPS.",
nxt="Сессии.",
)))

be.append(("be-session", "Сессии", 12, P(
goal="Сделать серверную сессию: id в cookie, данные на сервере.",
need="Cookies.",
explain="""Сессия: клиент хранит случайный session_id, сервер хранит {user_id, ...} в памяти/Redis/БД. Logout удаляет серверную запись. Удобно отзывать доступ.

Минус — нужна общая хранилка сессий при нескольких инстансах сервера.""",
terms="- **Session id**.\n- **Server-side session store**.",
device="login → создать id → save store → Set-Cookie; request → load store → user.",
example="store['abc'] = {user_id:5, exp:...}",
steps="Нет записи в store → 401, даже если cookie пришла.",
code="""```python
session_id = secrets.token_urlsafe(32)
store[session_id] = {"user_id": user.id}
response.set_cookie("session", session_id, httponly=True)
```""",
practice="Как инвалидировать все сессии пользователя?",
mistakes="- Предсказуемый session_id.\n- Сессия в памяти одного инстанса без sticky/store.",
remember="Сессия = id у клиента + состояние на сервере.",
task="Нарисуйте login/logout/request sequence.",
nxt="JWT.",
)))

be.append(("be-jwt", "JWT", 13, P(
goal="Понять JWT как самодостаточный токен с подписью и его риски.",
need="Сессии.",
explain="""JWT несёт claims (sub, exp) и подпись. Сервер проверяет подпись секретом/ключом без хранения сессии (часто). Отзыв сложнее — нужны blacklist/короткий TTL/refresh.

Не кладите секреты в payload: он только кодирован, не зашифрован (обычно).""",
terms="- **Header.Payload.Signature**.\n- **Claims: sub, exp, iat**.\n- **Bearer token**.",
device="Authorization: Bearer eyJ... → verify → user_id из sub.",
example="payload {sub:5, exp: ...} подписан HS256.",
steps="Подпись неверна или exp прошёл → 401.",
code="""```python
# псевдокод
claims = jwt.decode(token, secret, algorithms=["HS256"])
user_id = int(claims["sub"])
```""",
practice="Когда сессия лучше JWT?",
mistakes="- alg=none.\n- Долгий TTL без refresh-стратегии.\n- Секреты в claims.",
remember="JWT удобен для stateless, но отзыв и утечка — цена.",
task="Сравните session vs JWT для трекера задач в таблице плюсов/минусов.",
nxt="Middleware.",
)))

be.append(("be-middleware", "Middleware", 14, P(
goal="Встроить поперечные слои: лог, auth, CORS — вокруг обработчика.",
need="JWT/сессии.",
explain="""Middleware — обёртка пайплайна запроса: до и после handler. Логирование latency, аутентификация, CORS, rate limit. Порядок важен: сначала request-id, потом auth, потом handler.

Не пихайте бизнес-логику «закрыть задачу» в middleware.""",
terms="- **Pipeline / onion**.\n- **CORS**, **rate limiting**.",
device="request → mw1 → mw2 → handler → mw2 → mw1 → response.",
example="Auth middleware пишет request.user; handler просто использует.",
steps="Если auth mw вернул 401, handler не вызывается.",
code="""```python
def auth_middleware(request, call_next):
    request.user = authenticate(request)
    if request.user is None and needs_auth(request):
        return Response(status_code=401)
    return call_next(request)
```""",
practice="В каком порядке: logging, auth, business?",
mistakes="- Бизнес-правила в middleware.\n- Тихий swallow исключений.",
remember="Middleware = поперечные касания, не доменные операции.",
task="Список middleware для API задач.",
nxt="Валидация входа.",
)))

be.append(("be-validation", "Валидация", 15, P(
goal="Проверять входные данные схемой до бизнес-логики.",
need="Middleware.",
explain="""Валидация проверяет типы, обязательность, диапазоны, форматы. Делается на границе API (Pydantic и аналоги). Бизнес-правила («лимит 100 задач») — в сервисе, но тоже явно.

Невалидно → 400 с полями ошибок.""",
terms="- **Schema validation**.\n- **Sanitize vs validate**.",
device="JSON → модель → ошибки или объект.",
example="title: str min_length=1 max_length=200; done: bool.",
steps="title=\"\" → 400 fields.title.",
code="""```python
from pydantic import BaseModel, Field
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
```""",
practice="Что валидировать ещё на create?",
mistakes="- Доверять клиенту после UI-проверок.\n- Молча обрезать данные.",
remember="Сначала схема, потом бизнес.",
task="Схема TaskUpdate (опциональные поля).",
nxt="Ошибки API.",
)))

be.append(("be-errors", "Ошибки API", 16, P(
goal="Единый формат ошибок и правильные статусы.",
need="Валидация.",
explain="""Ошибки делят на ожидаемые (4xx) и сбои (5xx). Единый JSON: code, message, fields, request_id. Логируйте 5xx с стеком внутри; наружу — коротко.

Не маскируйте 403 под 404 без политики (иногда делают для скрытия существования).""",
terms="- **Problem details** (идея).\n- **request_id**.",
device="exceptions → handler → JSON response.",
example='{"code":"not_found","message":"task not found","request_id":"..."}',
steps="Слой API ловит DomainError и мапит в статус.",
code="""```python
class NotFound(Exception):
    pass

# handler
except NotFound:
    return JSONResponse({"code":"not_found"}, status_code=404)
```""",
practice="Словарь code → status для задач.",
mistakes="- Разный формат на каждый endpoint.\n- Стек в проде наружу.",
remember="Ошибка — тоже контракт.",
task="Опишите 4 ошибки create_task.",
nxt="Логирование.",
)))

be.append(("be-logging", "Логирование", 17, P(
goal="Логировать структурированно: request_id, user_id, latency, без секретов.",
need="Ошибки.",
explain="""Логи — телеметрия для отладки и аудита. Пишите JSON-поля: level, msg, request_id, path, status, duration_ms. Не логируйте пароли и токены. Коррелируйте запросы request_id через middleware.

Уровни: debug/info/warning/error.""",
terms="- **Structured logging**.\n- **Correlation id**.",
device="middleware ставит request_id → handlers логируют с ним → агрегатор.",
example='{"level":"info","path":"/tasks","status":201,"duration_ms":12,"request_id":"a1"}',
steps="Инцидент: ищете request_id из ответа клиента в логах.",
code="""```python
log.info("task_created", extra={"task_id": 10, "request_id": rid})
```""",
practice="Что нельзя писать в лог из заголовков?",
mistakes="- print() без структуры.\n- Логировать Authorization.",
remember="Лог = наблюдаемость; секреты вне лога.",
task="Чеклист полей лога для POST /tasks.",
nxt="Слои архитектуры.",
)))

be.append(("be-layers", "Слои backend", 18, P(
goal="Разделить API, service, repository: кто за что отвечает.",
need="Логирование.",
explain="""Слои уменьшают кашу. API-слой: HTTP, валидация, коды. Service: бизнес-правила, транзакции. Repository: SQL/ORM. Доменные ошибки рождаются в service, API мапит в HTTP.

Прямой SQL из роута работает в прототипе и мешает расти.""",
terms="- **API / Service / Repository**.\n- **DTO / Domain model**.",
device="Handler → service.create_task() → repo.insert() → DB.",
example="create_task проверяет лимит 100 задач, repo только INSERT.",
steps="Если лимит превышен — сервис бросает ошибку; SQL не вызывается.",
code="""```python
def create_task(repo, user_id, title):
    if repo.count_open(user_id) >= 100:
        raise LimitExceeded()
    return repo.insert(user_id, title)
```""",
practice="Куда отнести уникальность title на пользователя?",
mistakes="- Толстые роуты.\n- Репозиторий с бизнес-if'ами UI.",
remember="Слои = границы ответственности.",
task="Разложите complete_task по слоям.",
nxt="Сервисный слой.",
)))

be.append(("be-service", "Сервисный слой", 19, P(
goal="Собрать use-case в сервисе: правила, транзакция, вызовы репозитория.",
need="Слои.",
explain="""Сервис оркестрирует один сценарий: «создать задачу», «закрыть задачу». Он знает правила и границы транзакции. Не знает про FastAPI Request и статус-коды.

Тестировать сервис легче с фейковым репозиторием.""",
terms="- **Use-case / application service**.\n- **Транзакционная граница**.",
device="service method = open tx → checks → repo ops → commit.",
example="complete_task: загрузить, проверить владельца, done=true, audit log.",
steps="Чужая задача — исключение до UPDATE.",
code="""```python
class TaskService:
    def complete(self, user_id: int, task_id: int) -> None:
        task = self.repo.get(task_id)
        if task is None:
            raise NotFound()
        if task.user_id != user_id:
            raise Forbidden()
        self.repo.mark_done(task_id)
```""",
practice="Нужен ли отдельный сервис для простого GET?",
mistakes="- Сервис, принимающий HTTP Request.\n- Commit в репозитории и ещё раз в сервисе хаотично.",
remember="Сервис = сценарий предметной области.",
task="Напишите псевдокод create_task с лимитом и audit.",
nxt="Репозиторий.",
)))

be.append(("be-repository", "Репозиторий", 20, P(
goal="Изолировать SQL/ORM за интерфейсом репозитория.",
need="Сервисный слой.",
explain="""Репозиторий прячет детали таблицы: get, list_open, insert, mark_done. Сервис не пишет SQL-строки. Легче сменить SQLite на PostgreSQL и мокать в тестах.

Репозиторий не принимает решения «можно ли пользователю» — только данные.""",
terms="- **Repository / DAO**.\n- **Persistence**.",
device="методы ↔ SQL. Маппинг row → dataclass.",
example="list_open(user_id) → SELECT ... WHERE user_id=? AND done=0",
steps="Пустой список — [] , не ошибка; отсутствие id в get — None.",
code="""```python
class TaskRepo:
    def __init__(self, conn):
        self.conn = conn

    def insert(self, user_id: int, title: str) -> int:
        cur = self.conn.execute(
            "INSERT INTO tasks(user_id, title, done) VALUES (?, ?, 0)",
            (user_id, title),
        )
        return cur.lastrowid
```""",
practice="Какие методы нужны для комментариев?",
mistakes="- Authz внутри repo.\n- Леaking cursor наружу без нужды.",
remember="Репозиторий = доступ к данным, не бизнес-политика.",
task="Интерфейс TaskRepo на 6 методов.",
nxt="Модуль FastAPI: как собрать HTTP API на Python.",
)))

mid, mtitle, morder, rel = BE
for lid, title, order, parts in be:
    course(lid, title, mid, mtitle, morder, order, parts, rel)
print("backend", len(be))
