---
id: linux-systemd
title: systemd — юниты и зависимости
module_id: linux
module_title: Linux
module_order: 4
order: 7
---

# systemd — юниты и зависимости

## Цель

Научиться читать unit-файлы systemd: типы юнитов, секции `[Service]`, зависимости и базовые операции `systemctl`/`journalctl`.

## Исходные знания

Службы как идея супервизора. Пути FHS и сервисные пользователи.

## Объяснение

systemd — менеджер системы и служб. Он описывает систему набором юнитов: `.service`, `.socket`, `.timer`, `.target` и другие. Target похож на «уровень запуска»: группа желаемых юнитов.

Unit-файл — декларация. В `[Unit]` пишут описание и зависимости (`After=`, `Requires=`). В `[Service]` — как запускать: `ExecStart=`, `User=`, `Restart=`, тип `Type=`. В `[Install]` — куда линковать для автозапуска (`WantedBy=multi-user.target`).

`systemctl start/stop/restart/enable/disable/status` — основной интерфейс. enable делает автозапуск, start — немедленный запуск. Это разные действия.

Кастомные юниты кладут в `/etc/systemd/system/`. После правок нужен `daemon-reload`, иначе systemd не увидит изменения файла. Затем restart службы.

Журнал: `journalctl -u имя.service`. Логи структурированы и связаны с юнитом. Для отладки старта смотрят `-b` (текущая загрузка) и приоритеты.

Таймеры заменяют часть cron-задач: `.timer` активирует `.service`. Сокеты могут стартовать службу по первому подключению. Начните с обычных service — этого хватает большинству приложений.

Не пишите сложную логику в `ExecStartPre` из десяти скриптов без нужды. Лучше один понятный ExecStart и отдельный скрипт с явным кодом возврата.

## Термины

**Unit** — единица конфигурации systemd.

**Target** — группа/цель синхронизации юнитов.

**enable** — включить автозапуск.

**daemon-reload** — перечитать unit-файлы с диска.

**journald** — журнал systemd.

## Как это работает

При старте systemd стремится к default target, активируя зависимости. Для service он порождает процесс согласно Type. Если Type=simple, главный процесс — тот, что ExecStart. Если программа сама уходит в фон неправильно, systemd потеряет учёт — отсюда рекомендация работать на переднем плане.

Зависимости задают порядок и жёсткость. `After` не означает `Requires`: порядок без обязательности возможен. Читайте документацию внимательно при сетевых гонках.

Drop-in каталоги `имя.service.d/*.conf` позволяют править чужие юниты точечно, не копируя весь файл пакета.

## Пример

```ini
# пример unit (иллюстрация)
[Unit]
Description=Example API
After=network-online.target

[Service]
Type=simple
User=api
WorkingDirectory=/var/lib/example
ExecStart=/usr/local/bin/example-api
Restart=on-failure
Environment=ENV=prod

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl status networking 2>/dev/null | head || true
journalctl -u ssh -n 20 --no-pager 2>/dev/null || true
```

## Разбор

В примере unit явно задаёт пользователя, каталог, бинарник и политику restart. Autostart через WantedBy.

`daemon-reload` нужен после изменения файлов. `journalctl -u` режет журнал по службе.

На реальной машине имена юнитов отличаются; важна структура секций.

## Ошибки

- Править unit и забывать `daemon-reload`.
- Путать `enable` и `start`.
- Молчаливый краш из-за неверного WorkingDirectory/User.
- Копировать unit пакета в `/etc` целиком вместо drop-in.

## Что запомнить

- systemd управляет юнитами и зависимостями.
- Service описывает процесс, права и restart.
- enable ≠ start; reload файлов ≠ reload приложения.
- journalctl — первый инструмент логов службы.

## Задание

Прочитайте unit любой системной службы через `systemctl cat`. Выпишите ExecStart, User (если есть) и Restart. Найдите последние строки журнала этой службы.

## Связь дальше

Следующий урок — сеть на хосте Linux: интерфейсы, адреса и диагностика.
