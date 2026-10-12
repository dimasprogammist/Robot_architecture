from __future__ import annotations

from typing import Any

# Answers are never sent in the public list. Check endpoint compares normalized text.


SECRET_KEYS = {
    "answer",
    "accept",
    "answers",
    "tests",
    "sql_schema",
    "expected_rows",
    "expected_stdout",
    "explain",
    "hint",
    "hints",
}


def _choice(id: str, title: str, prompt: str, options: list[tuple[str, str]], answer: str, explain: str, level: int, hints: list[str] | None = None) -> dict[str, Any]:
    return {
        "id": id,
        "title": title,
        "kind": "choice",
        "prompt": prompt,
        "options": [{"id": oid, "text": text} for oid, text in options],
        "answer": answer,
        "explain": explain,
        "level": level,
        "hints": hints or [],
        "runnable": False,
    }


def _multi(id: str, title: str, prompt: str, options: list[tuple[str, str]], answers: list[str], explain: str, level: int, hints: list[str] | None = None) -> dict[str, Any]:
    return {
        "id": id,
        "title": title,
        "kind": "multi",
        "prompt": prompt,
        "options": [{"id": oid, "text": text} for oid, text in options],
        "answers": answers,
        "explain": explain,
        "level": level,
        "hints": hints or [],
        "runnable": False,
    }


def _text(id: str, title: str, prompt: str, accept: list[str], explain: str, level: int, hint: str = "", hints: list[str] | None = None) -> dict[str, Any]:
    packed = list(hints or [])
    if hint:
        packed = [hint, *packed]
    return {
        "id": id,
        "title": title,
        "kind": "text",
        "prompt": prompt,
        "accept": accept,
        "explain": explain,
        "level": level,
        "hint": hint,
        "hints": packed,
        "runnable": False,
    }


def _code(
    id: str,
    title: str,
    prompt: str,
    lang: str,
    tests: list[dict[str, Any]],
    explain: str,
    level: int,
    starter: str = "",
    hints: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "id": id,
        "title": title,
        "kind": "code",
        "lang": lang,
        "prompt": prompt,
        "tests": tests,
        "starter": starter,
        "explain": explain,
        "level": level,
        "hints": hints or [],
        "runnable": lang in {"python", "sql"},
        "run_note": "C++ запускается только если в среде есть компилятор g++/clang++." if lang == "cpp" else "",
    }


def _sql(
    id: str,
    title: str,
    prompt: str,
    schema: str,
    expected_rows: list[list[Any]],
    explain: str,
    level: int,
    hints: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "id": id,
        "title": title,
        "kind": "sql",
        "lang": "sql",
        "prompt": prompt,
        "sql_schema": schema,
        "expected_rows": expected_rows,
        "starter": "SELECT ",
        "explain": explain,
        "level": level,
        "hints": hints or [],
        "runnable": True,
    }


def SECTIONS() -> list[dict[str, Any]]:
    from app.domain.exercise_pack import restored_sections

    core = [
        {
            "id": "terminal",
            "title": "Терминал",
            "intro": "Командная строка. Если синтаксис Linux и Windows различается, в условии указана среда. Не предполагайте, что команды bash работают в PowerShell.",
            "items": [
                _choice(
                    "term-pwd",
                    "Текущий каталог",
                    "Как посмотреть полный путь текущей папки?",
                    [
                        ("a", "Linux/macOS: pwd. Windows PowerShell: pwd или Get-Location. CMD: cd (без аргументов)."),
                        ("b", "Везде одна команда ls"),
                        ("c", "Только cd .."),
                    ],
                    "a",
                    "pwd — print working directory. В PowerShell pwd — псевдоним Get-Location. В CMD голый cd печатает текущий путь.",
                    1,
                ),
                _choice(
                    "term-ls",
                    "Содержимое каталога",
                    "Нужно увидеть имена файлов в текущей папке.",
                    [
                        ("a", "Linux: ls. PowerShell: ls или Get-ChildItem. CMD: dir."),
                        ("b", "Везде cat ."),
                        ("c", "Только pwd"),
                    ],
                    "a",
                    "ls и dir не взаимозаменяемы между оболочками без псевдонимов.",
                    1,
                ),
                _text(
                    "term-cd",
                    "Переход в каталог",
                    "Linux. Вы в /home/user. Напишите команду перехода в подкаталог robot (относительный путь).",
                    ["cd robot", "cd ./robot"],
                    "Относительный путь от текущего каталога: cd robot.",
                    1,
                    "Две буквы команды и имя папки.",
                ),
                _text(
                    "term-abs",
                    "Абсолютный путь",
                    "Windows CMD. Перейти в C:\\Users\\me\\src. Напишите команду.",
                    ["cd C:\\Users\\me\\src", "cd /d C:\\Users\\me\\src", "cd C:/Users/me/src"],
                    "В CMD путь с другой буквы диска часто требует cd /d.",
                    2,
                ),
                _choice(
                    "term-mkdir",
                    "Создание каталога",
                    "Создать папку notes.",
                    [
                        ("a", "Linux: mkdir notes. PowerShell: mkdir notes или New-Item -ItemType Directory notes. CMD: mkdir notes."),
                        ("b", "touch notes"),
                        ("c", "rmdir notes"),
                    ],
                    "a",
                    "touch создаёт файл, не каталог.",
                    1,
                ),
                _choice(
                    "term-rm",
                    "Удаление",
                    "Удалить пустую папку tmp.",
                    [
                        ("a", "Linux: rmdir tmp или rm -r tmp. PowerShell: Remove-Item tmp. CMD: rmdir tmp."),
                        ("b", "del tmp на Linux"),
                        ("c", "format tmp"),
                    ],
                    "a",
                    "del в CMD удаляет файлы, не каталоги. rm -r опасен для непустых деревьев.",
                    2,
                ),
                _choice(
                    "term-cp",
                    "Копирование и перемещение",
                    "Скопировать a.txt в b.txt.",
                    [
                        ("a", "Linux: cp a.txt b.txt. PowerShell: Copy-Item a.txt b.txt. CMD: copy a.txt b.txt. Перемещение: mv / Move-Item / move."),
                        ("b", "Везде copy-paste"),
                        ("c", "git clone a.txt"),
                    ],
                    "a",
                    "mv/move переносят, cp/copy оставляют исходный файл.",
                    2,
                ),
                _choice(
                    "term-cat",
                    "Чтение файла",
                    "Показать содержимое readme.md в терминале.",
                    [
                        ("a", "Linux: cat readme.md или less. PowerShell: Get-Content readme.md. CMD: type readme.md."),
                        ("b", "cd readme.md"),
                        ("c", "mkdir readme.md"),
                    ],
                    "a",
                    "cat/type/Get-Content печатают файл в стандартный вывод.",
                    1,
                ),
                _choice(
                    "term-find",
                    "Поиск",
                    "Найти строки «TODO» в файлах проекта.",
                    [
                        ("a", "Linux: grep -R TODO . или rg TODO. PowerShell: Select-String -Path * -Pattern TODO -Recurse. find ищет имена файлов, не текст."),
                        ("b", "pwd TODO"),
                        ("c", "Только ls TODO"),
                    ],
                    "a",
                    "grep/Select-String ищут текст. find/Get-ChildItem -Filter — имена.",
                    2,
                ),
                _choice(
                    "term-redir",
                    "Перенаправление",
                    "Linux bash. Записать вывод ls в файл listing.txt (перезаписать файл).",
                    [
                        ("a", "ls > listing.txt. Дописать в конец: ls >> listing.txt. Конвейер | передаёт другой команде, не в файл."),
                        ("b", "ls | listing.txt"),
                        ("c", "cd > listing.txt создаёт каталог"),
                    ],
                    "a",
                    "В PowerShell то же > и >>. Не путайте с |.",
                    2,
                ),
                _choice(
                    "term-pipe",
                    "Конвейер",
                    "Что делает команда ls | more в bash (или Get-ChildItem | more в PowerShell)?",
                    [
                        ("a", "Вывод первой команды становится входом второй. | не копирует файлы на диск."),
                        ("b", "Запускает обе команды независимо"),
                        ("c", "Удаляет каталог ls"),
                    ],
                    "a",
                    "Перенаправление > пишет в файл, >> дописывает, 2> — поток ошибок.",
                    2,
                ),
                _choice(
                    "term-env",
                    "Переменные окружения",
                    "Показать значение PATH.",
                    [
                        ("a", "Linux: echo $PATH. PowerShell: $env:PATH. CMD: echo %PATH%."),
                        ("b", "Везде echo PATH"),
                        ("c", "cd PATH"),
                    ],
                    "a",
                    "Синтаксис переменных — частая ошибка при копировании команд между ОС.",
                    2,
                ),
                _choice(
                    "term-diag",
                    "Диагностика сети",
                    "Проверить, отвечает ли хост example.com.",
                    [
                        ("a", "ping example.com (есть и в Linux, и в Windows). Дополнительно: Linux ip a / ss; Windows ipconfig / netstat."),
                        ("b", "mkdir example.com"),
                        ("c", "git ping"),
                    ],
                    "a",
                    "ping проверяет доступность. ipconfig не работает в обычном bash.",
                    2,
                ),
            ],
        },
        {
            "id": "algorithms",
            "title": "Алгоритмы",
            "intro": "От переменных к поиску и сортировке. Ответы — короткие тексты или выбор. Код на сервере не выполняется.",
            "items": [
                _text(
                    "algo-var",
                    "Переменные",
                    "x = 3, y = 4. Чему равно x * y + 2?",
                    ["14"],
                    "Сначала умножение: 12 + 2 = 14.",
                    1,
                ),
                _choice(
                    "algo-if",
                    "Условие",
                    "if n % 2 == 0: print('чёт'). Что напечатается при n = 7?",
                    [("a", "Ничего (условие ложно)"), ("b", "чёт"), ("c", "7")],
                    "a",
                    "7 % 2 равно 1, ветка не выполняется.",
                    1,
                ),
                _text(
                    "algo-loop",
                    "Цикл",
                    "Сколько раз выполнится тело for i in range(3)?",
                    ["3"],
                    "range(3) даёт 0, 1, 2 — три значения.",
                    1,
                ),
                _text(
                    "algo-sum",
                    "Сумма списка",
                    "Сумма элементов [2, 5, 1].",
                    ["8"],
                    "2+5+1=8. Линейный проход O(n).",
                    1,
                ),
                _text(
                    "algo-str",
                    "Строки",
                    "Слово 'robot' без первого и последнего символа (срединная часть).",
                    ["obo"],
                    "Индексы 1..3 включительно: obo.",
                    2,
                ),
                _choice(
                    "algo-fn",
                    "Функция",
                    "def add(a, b): return a + b. Что вернёт add(2, add(3, 4))?",
                    [("a", "9"), ("b", "234"), ("c", "5")],
                    "a",
                    "Внутренний вызов 7, затем 2+7=9.",
                    2,
                ),
                _text(
                    "algo-count",
                    "Подсчёт",
                    "Сколько раз встречается 2 в [1, 2, 2, 3, 2]?",
                    ["3"],
                    "Линейный поиск/подсчёт: один проход.",
                    2,
                ),
                _text(
                    "algo-minmax",
                    "Минимум и максимум",
                    "Минимум в [9, -1, 4, 0].",
                    ["-1"],
                    "Сравниваем каждый элемент с текущим минимумом, O(n).",
                    2,
                ),
                _choice(
                    "algo-linear",
                    "Линейный поиск",
                    "Ищем 7 в неотсортированном списке из n элементов. Худший случай сравнений?",
                    [("a", "n"), ("b", "log n"), ("c", "1")],
                    "a",
                    "Элемент может быть последним или отсутствовать — просматриваем все.",
                    2,
                ),
                _choice(
                    "algo-bin",
                    "Бинарный поиск",
                    "Бинарный поиск по массиву. Какое обязательное предварительное условие?",
                    [
                        ("a", "Массив отсортирован в том порядке, в котором сравнивает алгоритм"),
                        ("b", "Массив содержит только чётные числа"),
                        ("c", "Длина — степень двойки"),
                    ],
                    "a",
                    "Без упорядоченности отсечение половины неверно. Сложность O(log n) сравнений.",
                    3,
                ),
                _choice(
                    "algo-sort",
                    "Сортировка",
                    "Пузырьковая сортировка соседних пар. Характерная сложность в худшем случае?",
                    [("a", "O(n²)"), ("b", "O(n)"), ("c", "O(1)")],
                    "a",
                    "Два вложенных прохода. Для обучения, не для больших данных.",
                    3,
                ),
                _choice(
                    "algo-steps",
                    "Разбиение задачи",
                    "Нужно найти второй максимум в списке уникальных чисел. Разумные шаги?",
                    [
                        ("a", "1) проверить, что элементов ≥ 2; 2) найти максимум; 3) найти максимум среди остальных"),
                        ("b", "Сразу вывести первый элемент"),
                        ("c", "Отсортировать задом наперёд без проверки длины"),
                    ],
                    "a",
                    "Сначала предусловия, потом понятные шаги. Сортировка тоже сработает, но избыточна.",
                    3,
                ),
            ],
        },
        {
            "id": "git",
            "title": "Git",
            "intro": "Контроль версий. Команды вроде reset --hard и force push могут уничтожить незакоммиченную работу — в заданиях есть предупреждения.",
            "items": [
                _choice(
                    "git-why",
                    "Зачем Git",
                    "Зачем нужен репозиторий Git?",
                    [
                        ("a", "Хранить историю изменений, ветки и возможность вернуться к прошлому состоянию проекта"),
                        ("b", "Заменить компилятор"),
                        ("c", "Шифровать диск целиком"),
                    ],
                    "a",
                    "Репозиторий — служебный каталог .git плюс рабочая копия файлов.",
                    1,
                ),
                _text(
                    "git-init",
                    "git init",
                    "Команда создания нового репозитория в текущей папке.",
                    ["git init"],
                    "Появляется каталог .git. Не создаёт удалённый сервер.",
                    1,
                ),
                _text(
                    "git-status",
                    "git status",
                    "Команда, которая показывает изменённые и непроиндексированные файлы.",
                    ["git status"],
                    "Смотрите status перед commit, чтобы не забыть файлы.",
                    1,
                ),
                _choice(
                    "git-add",
                    "Индекс",
                    "Что делает git add readme.md?",
                    [
                        ("a", "Кладёт файл в индекс (staging) для следующего commit"),
                        ("b", "Отправляет файл на GitHub"),
                        ("c", "Удаляет файл"),
                    ],
                    "a",
                    "commit фиксирует то, что в индексе, не обязательно все изменения на диске.",
                    1,
                ),
                _choice(
                    "git-commit",
                    "Коммит",
                    "Минимально корректный первый коммит после add?",
                    [
                        ("a", "git commit -m \"сообщение\""),
                        ("b", "git push origin main без commit"),
                        ("c", "git init -m"),
                    ],
                    "a",
                    "Сообщение должно объяснять зачем, не только что.",
                    1,
                ),
                _choice(
                    "git-log",
                    "История",
                    "Посмотреть историю коммитов.",
                    [("a", "git log (часто git log --oneline)"), ("b", "git init --log"), ("c", "git delete")],
                    "a",
                    "git diff показывает незафиксированный или межкоммитный патч, log — список снимков.",
                    2,
                ),
                _choice(
                    "git-ignore",
                    ".gitignore",
                    "Зачем .gitignore?",
                    [
                        ("a", "Исключить из учёта мусор вроде node_modules, __pycache__, секретов .env"),
                        ("b", "Удалить Git с компьютера"),
                        ("c", "Заменить commit"),
                    ],
                    "a",
                    "Уже отслеживаемые файлы ignore сам не уберёт — нужен git rm --cached.",
                    2,
                ),
                _choice(
                    "git-branch",
                    "Ветки",
                    "Создать ветку feature и переключиться на неё (современный Git).",
                    [
                        ("a", "git switch -c feature (или git checkout -b feature)"),
                        ("b", "git commit feature"),
                        ("c", "git push -d feature"),
                    ],
                    "a",
                    "switch/checkout меняют рабочую копию под указатель ветки.",
                    2,
                ),
                _choice(
                    "git-merge",
                    "Слияние",
                    "Влить ветку feature в текущую main.",
                    [
                        ("a", "Находясь на main: git merge feature. Конфликт — правите файлы, затем add и commit."),
                        ("b", "git init feature"),
                        ("c", "git reset --hard feature без проверки. Это опасно: отбрасывает незакоммиченное."),
                    ],
                    "a",
                    "reset --hard и push --force могут стереть чужую и свою работу. Не используйте их «на всякий случай».",
                    3,
                ),
                _choice(
                    "git-diff",
                    "git diff",
                    "Увидеть незакоммиченный патч в рабочей копии.",
                    [("a", "git diff; для индекса git diff --staged"), ("b", "git clone"), ("c", "git remote")],
                    "a",
                    "diff сравнивает деревья, log перечисляет коммиты.",
                    2,
                ),
                _choice(
                    "git-undo",
                    "Безопасная отмена",
                    "Отменить незакоммиченные правки в одном файле, сохранив остальное.",
                    [
                        ("a", "git restore file.py (или git checkout -- file.py). Не путать с reset --hard всего репозитория."),
                        ("b", "git reset --hard и git push --force сразу"),
                        ("c", "Удалить папку .git"),
                    ],
                    "a",
                    "reset --hard и force-push уничтожают незакоммиченное и могут переписать удалённую историю. restore затрагивает указанный файл.",
                    3,
                ),
                _choice(
                    "git-push",
                    "git push и git pull",
                    "После commit на локальной ветке, связанной с origin. Как отправить и как забрать чужие коммиты?",
                    [
                        ("a", "Отправка: git push (или git push -u origin ветка в первый раз). Получение: git pull. Не используйте --force без понимания: можно перезаписать удалённую историю."),
                        ("b", "git init origin"),
                        ("c", "git reset --hard origin каждый час"),
                    ],
                    "a",
                    "push отправляет ваши коммиты. pull = fetch + слияние. force-push опасен для общей ветки.",
                    3,
                ),
                _choice(
                    "git-remote",
                    "Удалённый репозиторий",
                    "Типичный цикл с GitHub/GitLab после clone.",
                    [
                        ("a", "git remote add origin URL (если пусто), работа в ветке, commit, git push -u origin ветка, далее git pull перед новой работой"),
                        ("b", "Только git init на сервере с вашего ноутбука каждый час"),
                        ("c", "git reset --hard origin/main ежедневно без fetch"),
                    ],
                    "a",
                    "push отправляет коммиты, pull забирает и вливает. Сила force не нужна в обычном цикле.",
                    3,
                ),
            ],
        },
    ]
    from app.domain.exercise_extra import apply_extras

    return apply_extras([*restored_sections(), *core])


def public_sections() -> list[dict[str, Any]]:
    out = []
    for section in SECTIONS():
        items = []
        for item in section["items"]:
            pub = {k: v for k, v in item.items() if k not in SECRET_KEYS}
            packed = list(item.get("hints") or [])
            if item.get("hint") and item["hint"] not in packed:
                packed.insert(0, item["hint"])
            pub["hint_count"] = len(packed)
            items.append(pub)
        out.append({**section, "items": items})
    return out


def all_items() -> dict[str, dict[str, Any]]:
    found: dict[str, dict[str, Any]] = {}
    for section in SECTIONS():
        for item in section["items"]:
            found[item["id"]] = item
    return found
