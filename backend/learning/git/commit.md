---
id: git-commit
title: Коммиты
category: git
section: Основы
order: 3
description: Атомарность: протокол + парсер Python + парсер C++ вместе.
tags: [git, основы]
technologies: [Git]
related: [protocols-versioning, git-tag]
---

# Коммиты

Изменили кадр UART — один коммит на оба конца и документ message_structure.

## Зачем это в робототехнической системе

Иначе робот в поле с новой прошивкой и старым шлюзом.

## Синтаксис и контракт

```bash
git commit -m 'uart: add seq byte to frame v2'
```

## Типичные ошибки

- раздельные коммиты несовместимых концов без версии протокола
- огромный diff с форматером

## В Architecture Canvas

Версия протокола на связи Canvas.

## Связанные разделы
- protocols-versioning
- git-tag
