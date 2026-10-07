---
id: linux-systemd
title: systemd — юниты и зависимости
module_id: linux
module_title: Linux
module_order: 4
order: 7
---

# systemd — юниты и зависимости

systemd описывает машину **юнитами**: `.service`, `.socket`, `.timer`, `.target`. Target — «хочу этот набор», родственник старых runlevel. Файл — декларация, не скрипт на 200 строк.

`[Unit]`: описание, `After=`, `Requires=` / `Wants=`. `After` — порядок, не обязанность; без `Requires` зависимость может отсутствовать, служба всё равно попытается. `[Service]`: `ExecStart=`, `User=`, `Restart=`, `Type=`. `Type=simple` — главный процесс это ExecStart; если программа сама fork'ается «как в 90-е», systemd теряет ребёнка. `[Install]`: `WantedBy=multi-user.target` — куда линковать при enable.

`enable` ≠ `start`. Первое — автозапуск после reboot, второе — сейчас. Кастом кладут в `/etc/systemd/system/`. Поправили файл — `daemon-reload`, иначе в памяти старое, затем restart. Чужой пакет не копируют целиком: drop-in `имя.service.d/*.conf`.

`journalctl -u имя.service` — журнал юнита. `-b` — эта загрузка. Таймер будит `.service`; сокет может стартовать по первому коннекту. Начните с обычного service.

Не складывайте десять `ExecStartPre`. Один ExecStart и скрипт с понятным кодом возврата.

```bash
systemctl status sshd 2>/dev/null || systemctl status ssh
systemctl show ssh --property=Type,Restart,User,FragmentPath 2>/dev/null || true
```

Гонка «сеть ещё не вверх» — типичное `After=` без понимания, что DHCP не равен «облако доступно».

## Практика

### Задание 1. enable vs start

Служба disabled, вы `start`. Перезагрузка. Будет ли она жива? Какая команда включает автозапуск?

### Задание 2. Type

Программа уходит в фон сама. Почему `Type=simple` врёт systemd и что случится при stop?

### Задание 3. daemon-reload

Поменяли ExecStart, restart без reload. Откуда возьмётся старая команда?

### Задание 4. After без Requires

Сеть в After, Requires нет. Интерфейс не поднялся. Что сделает ваша служба и хорошо ли это?

Дальше сеть глазами **этого** хоста, не курс протоколов.
