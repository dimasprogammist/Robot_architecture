---
id: git-remote-github
title: Remote, GitHub, clone, push и pull
category: git
section: Как устроен Git
order: 6
description: Копия репозитория на другом компьютере.
tags: [git, основы]
technologies: []
related: []
---

# Remote, GitHub, clone, push и pull

История сначала живёт у вас в `.git`. **Remote** — второе место, где лежит та же история. Часто это сервер.

**GitHub** — один из сайтов, которые дают такой сервер. Регистрация на GitHub не устанавливает Git. Git ставится отдельно на компьютер.

Скачать чужой или свой проект:

```bash
git clone https://github.com/пример/проект.git
```

`clone` создаёт папку, репозиторий и запоминает remote под именем `origin`.

Отправить свои коммиты:

```bash
git push
```

Забрать то, что появилось на сервере, пока вас не было:

```bash
git pull
```

`pull` имеет смысл после того, как кто-то другой (или вы с другого компьютера) сделал `push`. Если коммитов на сервере нет, забирать нечего.
