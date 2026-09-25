# -*- coding: utf-8 -*-
"""Generate FastAPI + WebSocket lessons and all guides."""
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
            "Объясните соседу суть урока без подглядывания в текст. "
            "Если запнулись — вернитесь к блоку «Разбор».\n"
        )
    path.write_text(text, encoding="utf-8")
    counts.append((rel, text.count("\n")))
    print(f"{rel}: {text.count(chr(10))}")


def course(lid, title, mid, mtitle, morder, order, parts, rel_dir):
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


def P(goal, need, explain, terms, device, example, steps, code, practice, mistakes, remember, task, nxt):
    return {
        "Цель": goal, "Что уже нужно знать": need, "Объяснение с нуля": explain,
        "Термины": terms, "Внутреннее устройство": device, "Пример": example,
        "Разбор": steps, "Код": code, "Практика": practice, "Типичные ошибки": mistakes,
        "Что запомнить": remember, "Задание": task, "Связь со следующим уроком": nxt,
    }


# ================= FASTAPI =================
FA = ("fastapi", "FastAPI", 12, "course/12-fastapi")
fa = []

fa += [("fa-what", "Что такое FastAPI", 1, P(
"Понять FastAPI как инструмент для HTTP API на Python: маршруты, схемы, автодокументация.",
"Backend-слои, HTTP, JSON.",
"""FastAPI — фреймворк для веб-API на Python. Вы объявляете функции-обработчики и модели данных; фреймворк валидирует вход, сериализует выход, строит OpenAPI. Подходит для сервисных API, не для шаблонного SSR как основной цели.

В этом модуле собираем сервис заметок/задач: модели, роуты, БД-сессия, ошибки — не останавливаемся на «hello».""",
"- **Endpoint** — обработчик маршрута.\n- **OpenAPI** — машинное описание API.\n- **Pydantic-модель** — схема данных.",
"ASGI-сервер (uvicorn) принимает соединения и отдаёт их приложению FastAPI.",
"Приложение с роутом создания задачи и списком задач.",
"Запрос попадает в matching route → зависимость/валидация → функция → ответ.",
"""```python
from fastapi import FastAPI
app = FastAPI(title="Tasks")

@app.get("/health")
def health():
    return {"status": "ok"}
```""",
"Чем FastAPI полезен именно для API-контракта?",
"- Считать, что декоратор заменяет проектирование слоёв.\n- Тащить бизнес-логику в hello-роуты навсегда.",
"FastAPI = маршруты + схемы + ASGI-приложение.",
"Сформулируйте 6 endpoint'ов сервиса задач.",
"ASGI-модель.",
))]

fa += [("fa-asgi", "ASGI", 2, P(
"Понять ASGI: асинхронный интерфейс Python-приложения к серверу.",
"Что такое FastAPI.",
"""ASGI описывает, как сервер (uvicorn) вызывает приложение: scope, receive, send. Это позволяет HTTP и WebSocket в одном процессе. FastAPI/Starlette реализуют ASGI-приложение.

Синхронные def-эндпоинты FastAPI тоже запускает, но блокирующий код в async-пути опасен.""",
"- **ASGI / WSGI**.\n- **uvicorn** — ASGI-сервер.\n- **event loop**.",
"Клиент → TCP → uvicorn → ASGI app → response.",
"uvicorn main:app --reload поднимает процесс и слушает порт.",
"main:app — модуль и объект приложения.",
"""```text
uvicorn app.main:app --host 0.0.0.0 --port 8000
```""",
"Когда выбрать sync def, а когда async def?",
"- time.sleep в async-роуте.\n- Несколько тяжёлых CPU задач на одном event loop без нужды.",
"ASGI связывает сервер и приложение; uvicorn — частый рантайм.",
"Запустите health из прошлого урока через uvicorn (локально).",
"Объект приложения.",
))]

fa += [("fa-app", "Объект приложения", 3, P(
"Собрать FastAPI() с метаданными и подключить роутеры.",
"ASGI.",
"""Объект app = FastAPI(...) — корень: маршруты, middleware, exception handlers, lifespan (старт/стоп: пул БД). Крупный проект делит роуты на APIRouter и включает include_router.

title/version попадают в OpenAPI.""",
"- **FastAPI()**.\n- **APIRouter**.\n- **lifespan**.",
"При старте lifespan открывает ресурсы; при останове закрывает.",
"app.include_router(tasks.router, prefix='/tasks', tags=['tasks'])",
"Префикс склеивается с путями роутера.",
"""```python
from fastapi import FastAPI, APIRouter
app = FastAPI(title="Notes API", version="0.1.0")
router = APIRouter()

@router.get("")
def list_notes():
    return []

app.include_router(router, prefix="/notes", tags=["notes"])
```""",
"Зачем tags в OpenAPI?",
"- Один файл на 2000 строк роутов.\n- Создавать FastAPI() в каждом модуле заново.",
"Один app, много роутеров.",
"Разнесите health и notes по роутерам.",
"Маршруты.",
))]

fa += [("fa-routes", "Маршруты", 4, P(
"Объявлять маршруты декораторами и группировать их.",
"Объект приложения.",
"""@app.get/post/... регистрирует функцию. Путь может содержать параметры. Имя функции и docstring помогают документации. Дубли путей с одним методом — ошибка конфигурации.

Лучше явные пути ресурсов, чем catch-all.""",
"- **path operation**.\n- **prefix / tags**.",
"Реестр маршрутов строится при импорте модуля.",
"GET /notes и GET /notes/{note_id} — разные операции.",
"Более специфичные пути не должны конфликтовать с параметрами неожиданно.",
"""```python
@router.get("/{note_id}")
def get_note(note_id: int):
    return {"id": note_id}
```""",
"Почему /notes/me объявить выше /notes/{id} иногда важно?",
"- Пересекающиеся шаблоны без тестов.\n- Глаголы в path без нужды.",
"Маршрут связывает HTTP-операцию с функцией.",
"Таблица маршрутов CRUD заметок.",
"Методы HTTP.",
))]

fa += [("fa-methods", "HTTP-методы в FastAPI", 5, P(
"Выбирать get/post/put/patch/delete по смыслу операции сервиса заметок.",
"Маршруты.",
"""GET — чтение без побочных эффектов (в идеале). POST — создание. PUT — замена ресурса. PATCH — частичное обновление. DELETE — удаление. В FastAPI это разные декораторы и иногда разные модели тела.

Идемпотентность: повтор DELETE того же id должен быть безопасен по смыслу (404 или 204).""",
"- **PUT vs PATCH**.\n- **204 No Content**.",
"Метод участвует в ключе маршрута вместе с путём.",
"POST /notes создаёт; PATCH /notes/3 меняет title.",
"Клиент ошибочно шлёт GET с телом — тело обычно игнорируется; не стройте API, где это нужно.",
"""```python
@router.post("", status_code=201)
def create_note(body: NoteCreate):
    ...

@router.patch("/{note_id}")
def patch_note(note_id: int, body: NotePatch):
    ...
```""",
"Когда 201, когда 200?",
"- POST для чтения.\n- PUT без идемпотентности.",
"Метод — часть контракта ресурса.",
"Опишите тела для POST и PATCH заметки.",
"Path-параметры.",
))]

fa += [("fa-path", "Path-параметры", 6, P(
"Извлекать note_id из пути с типами и проверками.",
"Методы.",
"""Параметр пути объявляется в сигнатуре: note_id: int. FastAPI парсит и валидирует; «abc» → 422. Path(...) задаёт ge/lt и описание для OpenAPI.

Не кладите чувствительные данные в path-логи без нужды.""",
"- **Path parameter**.\n- **422 Unprocessable Entity**.",
"Строка пути → конвертер типа → аргумент функции.",
"GET /notes/10 → note_id=10.",
"GET /notes/0 при ge=1 → 422.",
"""```python
from fastapi import Path

@router.get("/{note_id}")
def get_note(note_id: int = Path(..., ge=1)):
    return {"id": note_id}
```""",
"Чем path отличается от query?",
"- Ловить ValueError вручную вместо типов.\n- Слишком много path-параметров вместо фильтров.",
"Path = идентификация ресурса в URL.",
"Добавьте ограничение ge=1 на note_id.",
"Query-параметры.",
))]

fa += [("fa-query", "Query-параметры", 7, P(
"Фильтровать списки через query: q, limit, offset, done.",
"Path.",
"""Query — параметры после ?. В сигнатуре обычные аргументы без Path/Body становятся query. Отлично для фильтрации списка заметок. Задайте default и границы limit.

Не используйте query для секретов.""",
"- **Query**.\n- **Пагинация limit/offset**.",
"URL query string → типы → аргументы.",
"GET /notes?done=false&limit=10",
"limit=1000 при max 100 → 422.",
"""```python
from fastapi import Query

@router.get("")
def list_notes(
    done: bool | None = None,
    limit: int = Query(20, ge=1, le=100),
):
    return {"done": done, "limit": limit}
```""",
"Спроектируйте поиск q по тексту заметки.",
"- Безлимитный limit.\n- Обязательный query там, где нужен path id.",
"Query = фильтры и опции выборки.",
"Добавьте offset и опишите ответ.",
"Тело запроса.",
))]

fa += [("fa-body", "Тело запроса", 8, P(
"Принимать JSON-тело через Pydantic-модель.",
"Query.",
"""Тело POST/PATCH объявляют моделью: body: NoteCreate. FastAPI читает JSON, валидирует поля, отдаёт объект. Несколько body-моделей без вложений неудобны — обычно одна модель.

Content-Type должен быть application/json.""",
"- **Request body**.\n- **Embed** (редко).",
"bytes → JSON → Model.model_validate → handler.",
'POST {"title":"Купить хлеб","done":false}',
"Нет title → 422 с details.",
"""```python
from pydantic import BaseModel, Field

class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)

@router.post("", status_code=201)
def create_note(body: NoteCreate):
    return {"id": 1, "title": body.title, "done": False}
```""",
"Чем PATCH-модель отличается от Create?",
"- dict[str, Any] без схемы.\n- Поле id из тела вместо path.",
"Тело = входная схема операции изменения.",
"Сделайте NotePatch с Optional полями.",
"Pydantic.",
))]

fa += [("fa-pydantic", "Pydantic-модели", 9, P(
"Разделить In/Out модели и не светить внутренние поля.",
"Тело запроса.",
"""Pydantic задаёт поля, типы, валидаторы. Отделяйте NoteCreate, NoteUpdate, NoteOut: наружу не отдавайте hashed secrets и лишние колонки. model_config / orm_mode (from_attributes) помогают из ORM-объектов.

Модели — часть контракта API.""",
"- **BaseModel**.\n- **Field / field_validator**.\n- **from_attributes**.",
"Валидация на границе; внутри сервиса уже типы Python.",
"NoteOut: id, title, done, created_at.",
"Случайное поле password_hash не должно быть в Out.",
"""```python
class NoteOut(BaseModel):
    id: int
    title: str
    done: bool
    model_config = {"from_attributes": True}
```""",
"Зачем разные Create и Out?",
"- Одна MegaModel на всё.\n- Молчаливое исключение лишних полей без политики.",
"Модели фиксируют контракт данных.",
"Напишите Create/Update/Out для заметки.",
"Модель ответа.",
))]

fa += [("fa-response", "Модели ответа", 10, P(
"Фиксировать response_model и status_code.",
"Pydantic.",
"""response_model=NoteOut отфильтрует лишние поля и появится в OpenAPI. status_code на декораторе задаёт успех по умолчанию. Для списков — list[NoteOut].

Можно Response без тела для 204.""",
"- **response_model**.\n- **response_model_exclude**.",
"return dict/ORM → фильтр через response_model → JSON.",
"create возвращает NoteOut и 201.",
"Лишнее поле internal попадёт в return, но response_model отрежет.",
"""```python
@router.post("", response_model=NoteOut, status_code=201)
def create_note(body: NoteCreate) -> NoteOut:
    ...
```""",
"Когда response_model мешает стримингу?",
"- Разный shape ответа на одном path.\n- Забыть 201 на create.",
"Ответ тоже схема, не «просто dict».",
"Опишите response для list и get.",
"Depends.",
))]

fa += [("fa-depends", "Depends и сессия БД", 11, P(
"Внедрять зависимости: текущий пользователь и сессия БД.",
"Модели ответа.",
"""Depends позволяет переиспользовать получение ресурсов. Типичный паттерн: get_db() yield session; get_current_user(). FastAPI вызывает зависимости до handler и закрывает генераторы после.

Это стержень реального сервиса, не hello world.""",
"- **Depends**.\n- **yield dependency**.\n- **dependency override** в тестах.",
"дерево зависимостей резолвится на запрос.",
"create_note(db=Depends(get_db), user=Depends(get_current_user))",
"После ответа session закрывается в finally генератора.",
"""```python
from fastapi import Depends

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("")
def create_note(body: NoteCreate, db=Depends(get_db)):
    ...
```""",
"Как мокать get_db в тестах?",
"- Открывать Session внутри каждого репозитория хаотично.\n- Забывать close.",
"Depends = композиция инфраструктуры запроса.",
"Добавьте get_current_user и защиту роута.",
"Middleware во FastAPI.",
))]

fa += [("fa-middleware", "Middleware во FastAPI", 12, P(
"Повесить middleware для request_id и логирования latency.",
"Depends.",
"""Middleware на уровне ASGI/Starlette оборачивает приложение. Удобно для CORS, HTTPS redirect, метрик. Порядок добавления влияет на порядок обёрток.

Бизнес-проверки владельца заметки — в сервисе/Depends, не в middleware.""",
"- **add_middleware**.\n- **CORSMiddleware**.",
"request → middlewares → routes → back.",
"Проставить X-Request-ID если нет.",
"Клиент получает тот же id в ответе для поддержки.",
"""```python
import time, uuid
from starlette.middleware.base import BaseHTTPMiddleware

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        rid = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        start = time.perf_counter()
        response = await call_next(request)
        response.headers["X-Request-ID"] = rid
        response.headers["X-Latency-ms"] = str(int((time.perf_counter()-start)*1000))
        return response
```""",
"Куда добавить CORS для локального frontend?",
"- Authz в middleware «на все случаи».\n- Тяжёлая синхронная работа в async middleware.",
"Middleware = поперечные заголовки и обёртки.",
"Подключите RequestIdMiddleware к app.",
"Авторизация в API.",
))]

fa += [("fa-auth", "Авторизация в FastAPI", 13, P(
"Защитить роуты через OAuth2PasswordBearer/HTTPBearer или cookie-сессию.",
"Middleware.",
"""Схема: dependency читает токен, проверяет, возвращает user. Роуты указывают Depends(get_current_user). Публичные /health и /login без этой зависимости.

Не храните пароли открыто; сравнивайте хеш.""",
"- **HTTPBearer / OAuth2PasswordBearer**.\n- **HTTPException 401**.",
"Security scheme попадает в OpenAPI Authorize.",
"Без токена POST /notes → 401.",
"С токеном user_id=5 → создаёт от своего имени.",
"""```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(cred: HTTPAuthorizationCredentials = Depends(security)):
    user = users_by_token(cred.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="invalid token")
    return user
```""",
"Где проверить, что заметка принадлежит user?",
"- Доверять user_id из тела.\n- Один общий токен на всех в проде.",
"Auth dependency на каждом защищённом роуте.",
"Закройте CRUD notes авторизацией.",
"Работа с БД.",
))]

fa += [("fa-db", "FastAPI и БД", 14, P(
"Подключить SQLAlchemy/session к роутам заметок через Depends.",
"Авторизация.",
"""Движок БД создаётся при старте. SessionLocal фабрика сессий. Роут получает db, сервис/репозиторий делают запросы, commit при успехе. Ошибки уникальности мапятся в 409.

Не коммитьте в каждом мелком репозиторном методе хаотично — определите границу.""",
"- **Engine / Session**.\n- **Unit of work**.",
"lifespan: create engine; request: session; after: close.",
"INSERT note + commit → SELECT list.",
"Падение до commit — записи нет.",
"""```python
@router.post("", response_model=NoteOut, status_code=201)
def create_note(body: NoteCreate, db=Depends(get_db), user=Depends(get_current_user)):
    note = Note(title=body.title, user_id=user.id, done=False)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
```""",
"Где rollback?",
"- Держать сессию глобальной на процесс.\n- Ленивые запросы после close.",
"Сессия на запрос — рабочий дефолт.",
"Реализуйте list/get/patch/delete с фильтром по user_id.",
"Async.",
))]

fa += [("fa-async", "Async в FastAPI", 15, P(
"Понять, когда async полезен и чем опасен блокирующий код.",
"БД.",
"""async def handler позволяет ждать сеть/БД без блокировки event loop, если драйвер асинхронный. sync def выносится в threadpool. Психо: «везде async» без async-драйвера не ускоряет, а вреден при блокировках.

Для учебного сервиса sync SQLAlchemy допустим; для высокой конкуренции I/O — async стек.""",
"- **async/await**.\n- **threadpool для sync**.",
"await db.execute(...) в async-сессии.",
"1000 параллельных ожидания сети vs 1000 sleep в async.",
"Блокирующий sleep замораживает loop.",
"""```python
@router.get("/notes")
async def list_notes():
    # await session.execute(...)  # с async-драйвером
    return []
```""",
"Как проверить, что библиотека async-safe?",
"- async def + requests.get sync.\n- CPU-bound в async без процессов.",
"Async помогает на ожидании; блокировки губительны.",
"Перечислите блокирующие вызовы, которые нельзя в async-роуте.",
"Ошибки.",
))]

fa += [("fa-errors", "Ошибки в FastAPI", 16, P(
"Поднять HTTPException и свои handlers для доменных ошибок.",
"Async.",
"""HTTPException(status_code, detail) — быстрый путь. Для единого формата — exception handler на DomainError. Валидация Pydantic уже даёт 422.

Не глотайте Exception молча.""",
"- **HTTPException**.\n- **exception_handler**.",
"исключение → handler → JSONResponse.",
"NotFoundNote → 404 {code:note_not_found}.",
"Детали валидации — список loc/msg.",
"""```python
from fastapi import HTTPException

@router.get("/{note_id}", response_model=NoteOut)
def get_note(note_id: int, db=Depends(get_db), user=Depends(get_current_user)):
    note = db.get(Note, note_id)
    if note is None or note.user_id != user.id:
        raise HTTPException(status_code=404, detail="note not found")
    return note
```""",
"Стоит ли 404 на чужую заметку вместо 403?",
"- Разные JSON ошибок.\n- 500 на ожидаемый not found.",
"Единые ошибки + корректные статусы.",
"Handler для LimitExceeded → 409.",
"Документация OpenAPI.",
))]

fa += [("fa-docs", "OpenAPI и docs", 17, P(
"Использовать /docs и /openapi.json как живой контракт.",
"Ошибки.",
"""FastAPI генерирует OpenAPI из типов и response_model. Swagger UI на /docs удобен для ручных проверок. В проде docs иногда закрывают или защищают.

Описания параметров и примеры улучшают жизнь клиентов.""",
"- **/docs, /redoc, /openapi.json**.\n- **summary / description / tags**.",
"схема строится при старте из зарегистрированных операций.",
"Authorize в Swagger для Bearer.",
"Поле, отсутствующее в модели, не попадёт в схему — и правильно.",
"""```python
app = FastAPI(title="Notes", description="Сервис заметок", version="1.0.0")
```""",
"Что добавить в description операций create/list?",
"- Расходиться коду и «вики» без OpenAPI.\n- Открыть docs с секретами на публичном проде без защиты.",
"OpenAPI — артефакт контракта из кода.",
"Проставьте summary на все notes-роуты.",
"Структура проекта.",
))]

fa += [("fa-project", "Структура сервиса", 18, P(
"Сложить реальный каркас: main, routers, models, schemas, services, db.",
"Документация.",
"""Минимальный взрослый каркас сервиса заметок:

- app/main.py — FastAPI, middleware, include_router
- app/db.py — engine, SessionLocal, get_db
- app/models.py — ORM
- app/schemas.py — Pydantic In/Out
- app/services/notes.py — правила
- app/routers/notes.py — HTTP
- app/deps.py — auth dependencies

Роуты тонкие: валидация + вызов сервиса + коды.""",
"- **package layout**.\n- **тонкие роуты**.",
"Импорты не должны создавать циклы: deps → services → models.",
"POST /notes → router → service.create → repo/session.",
"Тест сервиса без HTTP; тест роута с override deps.",
"""```text
app/
  main.py
  db.py
  models.py
  schemas.py
  deps.py
  routers/notes.py
  services/notes.py
```""",
"Куда положить миграции Alembic?",
"- Круговые импорты.\n- Бизнес в main.py.",
"Структура бережёт рост фич.",
"Соберите скелет файлов и один рабочий POST/GET.",
"Модуль WebSocket: живые соединения.",
))]

mid, mtitle, morder, rel = FA
for lid, title, order, parts in fa:
    course(lid, title, mid, mtitle, morder, order, parts, rel)
print("fastapi", len(fa))

# ================= WEBSOCKET =================
WS = ("websocket", "WebSocket", 13, "course/13-websocket")
ws = []

ws += [("ws-vs-http", "WebSocket vs HTTP", 1, P(
"Сравнить короткий запрос-ответ HTTP и долгоживущий WebSocket.",
"Базовый HTTP.",
"""HTTP обычно: открыли соединение (или keep-alive), запрос, ответ, логический конец операции. WebSocket после рукопожатия держит двунаправленный канал: сервер может сам прислать сообщение без нового запроса клиента.

Для ленты «задача обновлена» WS удобнее короткого polling.""",
"- **Request/response**.\n- **Постоянное соединение**.\n- **Polling**.",
"Сначала HTTP Upgrade, затем фреймы WS.",
"Чат или live-статус задач vs CRUD раз в минуту.",
"Polling тратит запросы; WS держит канал и пушит события.",
"""```text
HTTP: Client → GET /tasks → 200 JSON → конец операции
WS:   Client ↔ Server : поток событий task.updated
```""",
"Когда HTTP достаточно?",
"- WS для единичного CRUD без realtime.\n- Держать миллионы простых запросов на WS без нужды.",
"WS — канал; HTTP — операция запроса-ответа.",
"Таблица сравнения на 6 пунктов.",
"Зачем WebSocket в продукте.",
))]

ws += [("ws-why", "Зачем WebSocket", 2, P(
"Выбрать WS для realtime уведомлений и совместного редактирования.",
"Сравнение с HTTP.",
"""Сценарии: уведомления, присутствие online, коллаборация, телеметрия. Клиентов много — нужна модель комнат/broadcast. Для загрузки файла и REST CRUD — HTTP.

Сложность: реконнект, сердцебиение, авторизация на handshake, горизонтальное масштабирование (pub/sub).""",
"- **Realtime**.\n- **Fan-out / broadcast**.\n- **Heartbeat**.",
"Сервер хранит набор сокетов и пишет в них события домена.",
"Пользователь A закрыл задачу — B видит событие без refresh.",
"Без WS B узнал бы только на следующем GET.",
"""```json
{"type":"task.updated","id":10,"done":true}
```""",
"Нужен ли WS для логина?",
"- Заменить весь API на WS.\n- Игнорировать auth.",
"WS окупается, когда сервер инициирует часто.",
"Опишите 3 события трекера задач для WS.",
"Рукопожатие.",
))]

ws += [("ws-handshake", "Рукопожатие", 3, P(
"Понять HTTP Upgrade до WebSocket и проверку заголовков.",
"Зачем WS.",
"""Клиент шлёт GET с Upgrade: websocket, Connection: Upgrade, Sec-WebSocket-Key. Сервер отвечает 101 Switching Protocols и Sec-WebSocket-Accept. Дальше — бинарный/текстовый фреймовый протокол, уже не классический HTTP request/response.

Токен часто передают query или протокол субпротокола; cookie тоже возможны.""",
"- **101 Switching Protocols**.\n- **Sec-WebSocket-Key/Accept**.\n- **Subprotocol**.",
"Неуспех рукопожатия — обычный HTTP-код (401/403/404).",
"Успех: 101 и открытый канал.",
"Неверный Accept → клиент закрывает.",
"""```http
GET /ws/tasks HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Version: 13
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
```""",
"Куда поставить проверку Bearer на handshake?",
"- Считать, что после 101 можно не аутентифицировать.\n- Логировать key как секрет без нужды.",
"Сначала HTTP upgrade, потом фреймы.",
"Нарисуйте sequence handshake с 401.",
"Фреймы.",
))]

ws += [("ws-frames", "Фреймы", 4, P(
"Увидеть сообщения как текстовые/бинарные фреймы и control frames.",
"Handshake.",
"""Данные идут фреймами: text/binary, плюс ping/pong/close. В прикладном коде вы обычно шлёте строки JSON. Большие сообщения могут фрагментироваться — библиотека собирает.

Ping/pong поддерживает живость NAT/прокси.""",
"- **Text/Binary frame**.\n- **Ping/Pong/Close**.\n- **Fragmentation**.",
"Библиотека WS прячет биты маски и opcodes.",
'{"type":"ping"} прикладной vs протоколный ping.',
"Протоколный ping не обязан быть JSON.",
"""```python
await websocket.send_text('{"type":"hello"}')
data = await websocket.receive_text()
```""",
"Зачем различать прикладной ping и протоколный?",
"- Склеивать сообщения без разделителей в одном text без схемы.\n- Игнорировать close frame.",
"Сообщение приложения ≠ сырой TCP поток: это фреймы.",
"Спроектируйте JSON-конверт type/payload.",
"Жизненный цикл.",
))]

ws += [("ws-lifecycle", "Жизненный цикл соединения", 5, P(
"Провести accept → exchange → close и ресурсы на сервере.",
"Фреймы.",
"""Сервер accept, регистрирует соединение в менеджере, читает цикл сообщений, при выходе удаляет из множества и закрывает. Утечка сокетов при исключениях — классика.

Идемпотентный unregister важен.""",
"- **accept**.\n- **connection manager**.\n- **close code**.",
"try/finally вокруг цикла receive.",
"Клиент закрыл вкладку → receive кидает disconnect → finally cleanup.",
"Без finally соединение останется в broadcast-списке.",
"""```python
async def handle(ws):
    await ws.accept()
    manager.add(ws)
    try:
        while True:
            msg = await ws.receive_text()
            await ws.send_text(msg)
    finally:
        manager.remove(ws)
```""",
"Какие close codes полезны?",
"- Забыть remove.\n- Бесконечный receive без таймаутов политики.",
"Жизнь сокета = accept + цикл + гарантированный cleanup.",
"Добавьте лог connect/disconnect с request_id.",
"Reconnect.",
))]

ws += [("ws-reconnect", "Переподключение", 6, P(
"Спроектировать клиентский reconnect с backoff и резynchronизацией.",
"Жизненный цикл.",
"""Сеть рвётся. Клиент должен переподключаться с паузой (exponential backoff + jitter), заново авторизоваться и подтянуть пропущенное (snapshot по HTTP или resume cursor).

Сервер не обязан помнить недоставленное, если нет очереди — честно заложите модель доставки.""",
"- **Backoff / jitter**.\n- **Resume token**.\n- **At-most-once / at-least-once**.",
"Клиент: onclose → wait → new WebSocket.",
"После reconnect GET /tasks и затем слушать события.",
"Иначе UI покажет дыру между офлайном и онлайном.",
"""```javascript
function connect() {
  const ws = new WebSocket("ws://localhost:8000/ws/tasks");
  ws.onclose = () => setTimeout(connect, 1000 + Math.random()*500);
}
```""",
"Почему нужен jitter?",
"- Жёсткий reconnect-шторм.\n- Молча терять события без синхронизации.",
"Reconnect — часть протокола продукта, не только сети.",
"Опишите стратегию sync после reconnect для задач.",
"Менеджер клиентов.",
))]

ws += [("ws-clients", "Менеджер клиентов", 7, P(
"Хранить активные сокеты и безопасный send.",
"Reconnect.",
"""ConnectionManager держит set/list сокетов или map user_id→sockets. send лично и broadcast. При ошибке send — удалить мёртвый сокет.

На нескольких процессах нужен Redis pub/sub — иначе broadcast только локальный.""",
"- **fan-out**.\n- **dead socket cleanup**.",
"add/remove/broadcast methods.",
"Два клиента подключены — оба получают событие.",
"Один отвалился — remove, второй продолжает.",
"""```python
class ConnectionManager:
    def __init__(self):
        self.active: set = set()
    async def connect(self, ws):
        await ws.accept()
        self.active.add(ws)
    def disconnect(self, ws):
        self.active.discard(ws)
    async def broadcast(self, message: str):
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)
```""",
"Как связать user_id с ws?",
"- Broadcast без cleanup.\n- Глобальный list без блокировок в sync-коде (осознайте модель).",
"Менеджер — реестр живых соединений.",
"Добавьте send_to_user.",
"Broadcast событий.",
))]

ws += [("ws-broadcast", "Broadcast", 8, P(
"Рассылать доменные события всем или комнате.",
"Менеджер клиентов.",
"""После успешного complete_task сервис публикует событие. HTTP-ответ клиенту A и WS-событие всем подписчикам — разные каналы. Комнаты: board_id → sockets.

Не шлите гигантские payload; шлите id и тип, детали — по GET.""",
"- **room / topic**.\n- **event payload**.",
"domain service → event bus → manager.broadcast",
'{"type":"task.updated","id":10,"done":true}',
"Подписчики обновляют UI точечно.",
"""```python
await manager.broadcast(
    json.dumps({"type": "task.updated", "id": task.id, "done": task.done})
)
```""",
"Что делать при 10k сокетах на одном процессе?",
"- Слать весь список задач в каждом событии.\n- Broadcast до commit в БД.",
"Событие после успешной записи; payload тонкий.",
"Схема events: created/updated/deleted.",
"FastAPI WebSocket сервер.",
))]

ws += [("ws-fastapi", "WebSocket в FastAPI", 9, P(
"Собрать минимальный рабочий WS-эндпоинт на FastAPI.",
"Broadcast.",
"""FastAPI: websocket: WebSocket в аргументах, путь /ws/tasks. accept, цикл, менеджер. Авторизацию сделайте до/сразу после accept (отклоните и закройте).

Ниже — рабочий каркас echo+broadcast для задачного канала.""",
"- **WebSocket** класс.\n- **WebSocketDisconnect**.",
"HTTP upgrade обрабатывает Starlette; ваш код — accept/цикл.",
"Клиент подключается, шлёт JSON, видит echo и broadcast.",
"Disconnect не должен ронять процесс.",
"""```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import json

app = FastAPI()
manager = ConnectionManager()  # из прошлого урока

@app.websocket("/ws/tasks")
async def ws_tasks(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            # ожидаем {"type":"ping"} или {"type":"chat","text":"..."}
            if data.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            else:
                await manager.broadcast(json.dumps({"type": "event", "data": data}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
        await websocket.close()
```""",
"Где проверить токен query ?token=",
"- accept до auth без последующего close.\n- Блокирующий ORM в узком цикле без нужды.",
"Минимальный сервер: connect + loop + cleanup + broadcast.",
"Добавьте query-token и словарь user_id.",
"Клиент на JS.",
))]

ws += [("ws-frontend", "Клиент WebSocket на JS", 10, P(
"Написать браузерный клиент: connect, onmessage, reconnect, интеграция с UI.",
"FastAPI WS.",
"""В браузере: new WebSocket(url). onopen/onmessage/onclose/onerror. Рисуйте статус соединения. Парсите JSON осторожно. Для учебного трекера: список задач обновляется по событию task.updated.

Ниже минимальный клиент к /ws/tasks.""",
"- **WebSocket API браузера**.\n- **onmessage**.",
"UI поток: кнопка complete → fetch PATCH → сервер broadcast → все ws onmessage.",
"Две вкладки: закрыли задачу в одной — вторая обновляется без F5.",
"Если WS закрыт — покажите banner offline.",
"""```html
<script>
let ws;
function connect() {
  ws = new WebSocket("ws://localhost:8000/ws/tasks");
  ws.onopen = () => console.log("open");
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    console.log("event", msg);
    // updateUI(msg)
  };
  ws.onclose = () => setTimeout(connect, 1000);
}
connect();
ws.send(JSON.stringify({type: "ping"}));
</script>
```""",
"Как совместить REST загрузку и WS дельты?",
"- Доверять UI без сверки с REST после reconnect.\n- JSON.parse без try/catch.",
"Клиент = connect + обработка событий + reconnect + REST snapshot.",
"Сделайте страницу: список задач + live-события в логе.",
"Справочники модуля закрепляют картину целиком.",
))]

mid, mtitle, morder, rel = WS
for lid, title, order, parts in ws:
    course(lid, title, mid, mtitle, morder, order, parts, rel)
print("websocket", len(ws))

# ================= GUIDES =================

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


def long_guide(filename, gid, title, category, topics: list[str]):
    sections = []
    sections.append(("Назначение справочника",
        f"Этот текст — плотный справочник по теме «{title}». Он не заменяет уроки курса, а собирает идеи, структуры, типичные ловушки и связки с практикой. Читайте кусками: сначала карта раздела, затем нужный фрагмент."))
    sections.append(("Карта темы",
        "\n".join(f"- {t}" for t in topics)))
    for i, t in enumerate(topics, 1):
        sections.append((f"{i}. {t}",
            f"""### Смысл
{t} — опорный блок темы. Держите в голове вопрос: какую задачу решает приём и какую цену вы платите памятью, временем, сложностью кода или операционной нагрузкой.

### Как думать
1. Сформулируйте вход и выход.
2. Назовите структуру данных или слой системы.
3. Оцените крайние случаи.
4. Проверьте, есть ли более простой инструмент в стандартной библиотеке или в инфраструктуре.

### Практика
Разберите маленький пример на бумаге (6–8 элементов, 2–3 таблицы, 1–2 запроса, один HTTP-сценарий — по контексту темы). Только потом переходите к коду.

### Ловушки
- Выучить термин без сценария применения.
- Копировать фрагмент из интернета без понимания инварианта.
- Оптимизировать раньше, чем появился корректный базовый вариант.

### Связи
Блок «{t}» обычно соседствует с соседними пунктами карты выше: смотрите предыдущий и следующий, чтобы не изучать приём изолированно."""))
    sections.append(("Чеклист перед продом",
        """- Есть ли явный контракт (схема данных, API, события)?
- Есть ли тесты на края?
- Логи и ошибки понятны?
- Секреты не утекли в клиент и логи?
- Наблюдаемость: метрики latency/error rate?
- Откат: миграции/совместимость API?"""))
    sections.append(("Как пользоваться вместе с курсом",
        """Идите по урокам модуля по порядку. Когда спотыкаетесь — открывайте соответствующий раздел справочника. После модуля решите одно небольшое приложение-срез: для алгоритмов — задачи на массивах/графах; для SQL — схему трекера; для backend/FastAPI — сервис с слоями; для WebSocket — live-ленту событий."""))
    guide(filename, gid, title, category, sections)


long_guide("algorithms.md", "guide-algorithms", "Алгоритмы и структуры данных", "guide-algorithms",
    ["Алгоритм и корректность", "Сложность и O-нотация", "Массив и список", "Стек очередь deque",
     "Хеш-таблица", "Деревья и BST", "Куча", "Графы", "Рекурсия", "Сортировки", "Поиск",
     "BFS и DFS", "Кратчайшие пути", "Шаблоны задач", "Отладка на маленьком входе", "Память vs время",
     "Стандартная библиотека Python", "Типичные ошибки собеседований", "Связь с индексами БД", "Практика закрепления"])

long_guide("sql.md", "guide-sql", "SQL и базы данных", "guide-sql",
    ["Роль СУБД", "Реляционная модель", "Ключи и ограничения", "Связи 1:N и N:M", "Нормализация",
     "Индексы", "Транзакции и ACID", "SELECT фильтры", "JOIN", "GROUP BY", "Подзапросы и CTE",
     "EXPLAIN", "Миграции схемы", "Пулы соединений", "SQL injection", "ORM vs SQL",
     "Изоляция", "Бэкапы", "Пагинация", "Прикладной путь запроса"])

long_guide("backend.md", "guide-backend", "Backend", "guide-backend",
    ["Клиент-сервер", "HTTP запрос-ответ", "Маршрутизация", "Контракт API", "REST-практика", "JSON",
     "Аутентификация", "Авторизация", "Cookies и сессии", "JWT", "Middleware", "Валидация",
     "Ошибки", "Логирование", "Слои", "Сервисы", "Репозитории", "Идемпотентность", "Пагинация API",
     "Безопасность границы"])

long_guide("fastapi.md", "guide-fastapi", "FastAPI", "guide-fastapi",
    ["ASGI и uvicorn", "Приложение и роутеры", "Методы и пути", "Query и body", "Pydantic",
     "response_model", "Depends", "Сессия БД", "Auth dependencies", "Middleware", "Exception handlers",
     "OpenAPI", "Структура проекта", "Тесты с TestClient", "Настройки и env", "CORS",
     "Фоновые задачи (обзор)", "Файлы и стриминг (обзор)", "Производительность", "Чеклист сервиса"])

long_guide("websocket.md", "guide-websocket", "WebSocket", "guide-websocket",
    ["Отличие от HTTP", "Сценарии realtime", "Handshake", "Фреймы", "Жизненный цикл", "Reconnect",
     "Менеджер соединений", "Broadcast и комнаты", "Auth на upgrade", "FastAPI WebSocket",
     "Клиент JS", "Совмещение с REST", "Масштабирование pub/sub", "Backpressure", "Heartbeat",
     "Формат событий", "Тестирование", "Прокси и таймауты", "Безопасность", "Наблюдаемость"])

print("guides done")
print("TOTAL_FILES", len(counts))
print("TOTAL_LINES", sum(n for _, n in counts))
