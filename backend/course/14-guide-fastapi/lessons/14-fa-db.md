---
id: fa-db
title: FastAPI и БД
module_id: fastapi
module_title: FastAPI
module_order: 14
order: 14
---

# FastAPI и БД

## Цель

Подключить SQLAlchemy/session к роутам заметок через Depends.

## Что уже нужно знать

Авторизация.

## Объяснение с нуля

Движок БД создаётся при старте. SessionLocal фабрика сессий. Роут получает db, сервис/репозиторий делают запросы, commit при успехе. Ошибки уникальности мапятся в 409.

Не коммитьте в каждом мелком репозиторном методе хаотично — определите границу.

## Термины

- **Engine / Session**.
- **Unit of work**.

## Внутреннее устройство

lifespan: create engine; request: session; after: close.

## Пример

INSERT note + commit → SELECT list.

## Разбор

Падение до commit — записи нет.

## Код

```python
@router.post("", response_model=NoteOut, status_code=201)
def create_note(body: NoteCreate, db=Depends(get_db), user=Depends(get_current_user)):
    note = Note(title=body.title, user_id=user.id, done=False)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
```

## Практика

Где rollback?

## Типичные ошибки

- Держать сессию глобальной на процесс.
- Ленивые запросы после close.

## Что запомнить

Сессия на запрос — рабочий дефолт.

## Задание

Реализуйте list/get/patch/delete с фильтром по user_id.

## Связь со следующим уроком

Async.

### Закрепление 1

Объясните соседу суть урока без подглядывания в текст. Если запнулись — вернитесь к блоку «Разбор».
