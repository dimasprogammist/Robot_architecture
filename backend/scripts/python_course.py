from handbook_lib import render


def python_articles() -> list[str]:
    C = "python"
    T = ["Python"]
    items = []

    def add(slug, title, section, order, desc, about, robot, code, mistakes, canvas, related, example=None, extra="", tags=None):
        items.append(render(
            cat=C, slug=slug, title=title, section=section, order=order,
            description=desc, tags=tags or [C, section.lower()], technologies=T,
            related=related, about=about, robot=robot, lang="python",
            code=code, example=example, mistakes=mistakes, canvas=canvas, extra=extra,
        ))
        return slug

    add("intro", "Введение и роль Python", "Основы", 1,
        "Где Python стоит в стеке робота и чего от него ждать.",
        "Python — интерпретируемый язык с богатой экосистемой. Он плохо подходит как единственный realtime-контур на MCU, но отлично закрывает оркестрацию, бэкенд, тесты, обработку логов, ROS2-узлы и инструменты калибровки.",
        "Типичное место: сервис на SBC (Raspberry Pi) или ПК, который говорит с прошивкой по UART/CAN/MQTT и отдаёт API операторскому интерфейсу.",
        "print('Architecture Canvas + Python')\npython --version",
        ["пытаться крутить 1 кГц PID на CPython без RTOS/C++", "смешивать скрипт настройки и боевой контур в одном процессе без очередей"],
        "Добавьте блок «Python-бэкенд». В документации укажите: владеет API, не владеет ШИМ моторов. Связь с MCU — отдельный протокол.",
        ["python-install", "python-venv", "python-fastapi"])

    add("install", "Установка и запуск", "Основы", 2,
        "CPython, версии, запуск скрипта и модуля.",
        "Используйте CPython 3.11+. Для робота фиксируйте minor-версию в Docker/CI, иначе «у меня работает» ломает прошивочные утилиты.",
        "На Raspberry Pi OS ставьте системный python3 и отдельно venv для сервиса. Не ставьте пакеты в system site-packages без нужды.",
        "python3 -m venv .venv\nsource .venv/bin/activate\npython -m robot_app",
        ["python vs python3 на Linux", "запуск файлов из чужого cwd, из-за чего не находятся конфиги"],
        "В компоненте бэкенда поле «версия» = 3.11. Документируйте команду запуска в README блока.",
        ["python-intro", "python-venv", "python-modules"])

    add("repl", "REPL, скрипты, -m", "Основы", 3,
        "Интерактивная оболочка против пакета службы.",
        "REPL удобен, чтобы пощупать датчик. Служба робота — это пакет с `__main__`, а не набор файлов, которые запускают с абсолютными путями вручную.",
        "Инженер на стенде: `python -i tools/probe_imu.py`. На изделии: `python -m robot.service`.",
        "if __name__ == '__main__':\n    raise SystemExit(main())",
        ["бизнес-логика на верхнем уровне модуля (импорт начинает крутить мотор)", "отсутствие `if __name__`"],
        "Алгоритм компонента «стендовые утилиты» отделите от алгоритма «runtime». Это разные вложенные блоки.",
        ["python-install", "python-modules", "python-logging"])

    add("variables", "Переменные и имена", "Основы", 4,
        "Имена, присваивание, ссылки на объекты.",
        "В Python имя ссылается на объект. `a = b` не копирует список телеметрии — оба имени смотрят на один буфер.",
        "Буфер IMU, переданный в поток публикации MQTT и в PID, должен либо копироваться, либо защищаться блокировкой.",
        "samples = [0.1, 0.2]\nview = samples\nview.append(0.3)  # samples тоже вырос",
        ["ожидать copy-on-assign как в C++", "однобуквенные имена в публичном API сервиса"],
        "В заметках компонента фиксируйте, какие структуры разделяются между потоками.",
        ["python-types-numbers", "python-lists", "python-copy"])

    add("types-numbers", "Числа: int, float, decimal", "Типы", 5,
        "Целые произвольной длины, float64, деньги и физика.",
        "`int` в Python не переполняется. `float` — IEEE-754 double. Для ШИМ и АЦП часто нужны явные диапазоны, а не «просто float».",
        "Перевод энкодера: ticks * (2π / CPR) * gear. Считайте единицы в имени: `wheel_rad`, не `val`.",
        "ticks = 4096\nrad = ticks * (2 * 3.1415926535) / 4096",
        ["сравнивать float через ==", "смешивать мм и м в одном PID"],
        "В ER/конфиге храните единицы. В блоке MCU опишите CPR энкодера — бэкенд не должен угадывать.",
        ["python-math", "python-typing", "python-pid"])

    add("strings", "Строки и Unicode", "Типы", 6,
        "str, f-string, кодировки UART.",
        "Строки неизменяемы. Для бинарного протокола используйте `bytes`, не `str`. UART 115200 часто несёт кадры, а не текст.",
        "MQTT topic — строка UTF-8. Payload датчика — JSON или protobuf-байты. Не клеить кадры CAN в f-string без hex.",
        "topic = f'robot/{robot_id}/imu'\npayload = b'\\x01\\x02'",
        ["decode без обработки ошибок на шумной линии", "логировать бинарь как текст"],
        "В протоколе связи укажите encoding и пример payload. Это поле Connection, не «заметка где-то».",
        ["python-bytes", "python-json", "python-mqtt"])

    add("bools-none", "bool, None, правда и ложь", "Типы", 7,
        "Истина, ложь, отсутствие значения.",
        "`None` — нет значения. Пустой список `[]` тоже ложен в `if`, но это другой смысл: «нет целей» vs «ещё не пришло».",
        "Состояние лидара: `scan is None` (нет кадра) vs `len(scan)==0` (кадр пустой — возможно ошибка драйвера).",
        "if pose is None:\n    return\nif not waypoints:\n    hold_position()",
        ["`if not data` когда 0.0 — валидная скорость", "sentinel -1 вместо Optional"],
        "В алгоритме компонента явно разведите ветки «нет данных» и «нулевая скорость».",
        ["python-exceptions", "python-typing", "python-state-machine"])

    add("bytes", "bytes, bytearray, memoryview", "Типы", 8,
        "Бинарные буферы для протоколов.",
        "`bytes` неизменяем, `bytearray` — нет. `memoryview` позволяет резать кадр без копий.",
        "Разбор Modbus RTU или кастомного UART: заголовок, длина, CRC. Копии на каждый байт убивают SBC при 1 кГц.",
        "frame = bytearray(rx)\ncrc = crc16(memoryview(frame)[:-2])",
        ["конкатенация bytes в цикле", "забытый CRC"],
        "Документируйте message_structure протокола. Алгоритм «парсер кадра» повесьте на шлюз.",
        ["python-strings", "python-struct", "python-serial"])

    add("lists", "Списки", "Коллекции", 9,
        "Упорядоченные буферы измерений.",
        "Список — динамический массив ссылок. Срезы копируют. Для очереди команд лучше `deque`.",
        "Окно последних 50 токов мотора для защиты по I²t. Не используйте list.pop(0) в горячем цикле.",
        "window = []\ndef push(i):\n    window.append(i)\n    if len(window) > 50:\n        window.pop(0)",
        ["pop(0) на больших списках", "хранить numpy-матрицы как вложенные list без нужды"],
        "Буфер телеметрии опишите во входах/выходах компонента, не только в коде.",
        ["python-deque", "python-comprehensions", "python-numpy"])

    add("tuples", "Кортежи и распаковка", "Коллекции", 10,
        "Неизменяемые записи координат.",
        "Кортеж — фиксированная запись. Удобен для `(x, y, yaw)`, но для публичного API лучше dataclass.",
        "Возврат из одометрии: `return x, y, yaw`. На границе сервисов именованные поля надёжнее.",
        "x, y, yaw = odometry()\npoint = (x, y)",
        ["кортеж из 8 безымянных чисел", "мутировать «кортеж» ожидая list"],
        "В таблице БД координаты — отдельные колонки, не строка '(1,2)'.",
        ["python-dataclasses", "python-unpacking", "python-namedtuple"])

    add("dicts", "Словари", "Коллекции", 11,
        "Ключ-значение: конфиг, регистры, JSON.",
        "Словарь — хеш-таблица. Ключ должен быть хешируемым. Конфиг робота часто начинают как dict, затем вырастает в схему.",
        "Карта `joint_name -> present_position`. Промах ключа — KeyError, на манипуляторе это стоп.",
        "joints = {'left_wheel': 0.0, 'right_wheel': 0.0}\njoints['left_wheel'] += 0.01",
        ["глубже 3 уровней вложенности без схемы", "json с числовыми ключами-строками"],
        "Конфиг вынесите в документ компонента. Для продакшена — таблица/YAML со схемой, не «магический dict».",
        ["python-json", "python-typeddict", "python-config"])

    add("sets", "Множества", "Коллекции", 12,
        "Уникальность id, быстрый membership.",
        "`set` проверяет «уже видели этот uid тега» за O(1) среднее.",
        "Фильтр повторных UUID детектированных маркеров ARUCO за кадр.",
        "seen: set[int] = set()\nif marker_id not in seen:\n    seen.add(marker_id)",
        ["set из list, если нужен порядок", "изменяемые элементы как ключи"],
        "В требованиях: «повторные детекции не порождают повторную команду».",
        ["python-dicts", "python-lists", "python-algorithms"])

    add("unpacking", "Распаковка, * и _", "Коллекции", 13,
        "Удобный разбор последовательностей.",
        "`head, *rest = frame` читаемее срезов, если формат стабилен.",
        "Кадр: sync, len, *payload, crc. Не распаковывайте, пока не проверили длину.",
        "sync, length, *payload, crc = frame\nif length != len(payload):\n    raise ValueError('len')",
        ["распаковка без проверки длины", "игнор ошибок через голый `_` в протоколе"],
        "Алгоритм парсера: шаги «проверить длину» → «распаковать» → «CRC».",
        ["python-bytes", "python-exceptions", "python-struct"])

    add("if", "Условия", "Поток управления", 14,
        "if/elif/else, тернарный оператор, match.",
        "Ветвление по режиму робота должно быть явным. Скрытые флаги `if x:` плодят баги в fail-safe.",
        "Режимы: IDLE, TELEOP, AUTO, FAULT. FAULT всегда перекрывает остальные.",
        "if mode == 'FAULT':\n    coast()\nelif mode == 'AUTO':\n    follow_path()\nelse:\n    teleop()",
        ["цепочка elif на 20 протоколов вместо таблицы стратегий", "забытый else в fail-safe"],
        "Состояния перенесите в алгоритм компонента и в state machine, не держите только в if.",
        ["python-match", "python-state-machine", "python-enums"])

    add("for", "Цикл for и итераторы", "Поток управления", 15,
        "Обход коллекций, range, else у for.",
        "`for` ходит по итератору. `for/else` срабатывает, если не было break — редко читают правильно.",
        "Опрос N сервоприводов. На timeout — break и переход в FAULT, не «молча пропустить».",
        "for servo in servos:\n    servo.poll(timeout=0.02)\nelse:\n    pass  # все ответили",
        ["изменение списка во время for", "busy-loop без sleep в Linux-сервисе"],
        "Цикл опроса опишите в алгоритме «control loop» блока контроллера.",
        ["python-while", "python-itertools", "python-generators"])

    add("while", "Цикл while", "Поток управления", 16,
        "Циклы с условием, watchdog.",
        "`while True` в сервисе допустим, если есть выход по shutdown-event и backoff на ошибках железа.",
        "Главный цикл SBC: читать очередь команд, слать setpoint на MCU, публиковать телеметрию.",
        "while not shutdown.is_set():\n    cmd = q.get(timeout=0.05)\n    apply(cmd)",
        ["while без таймаута на сокете", "глотание исключений внутри вечного цикла"],
        "На холсте цикл — алгоритм компонента, не «ещё один скрытый поток без блока».",
        ["python-for", "python-threading", "python-asyncio"])

    add("functions", "Функции", "Функции", 17,
        "def, return, документация, чистые функции.",
        "Функция — именованный шаг. Чистая функция (нет железа внутри) тестируется. I/O вынесите на края.",
        "`def wheel_omega(ticks, dt, cpr)` — чистая. `def set_pwm(channel, duty)` — эффект на драйвер.",
        "def clamp(x: float, lo: float, hi: float) -> float:\n    return max(lo, min(hi, x))",
        ["mutable default `def f(buf=[])`", "функции на 200 строк «и драйвер, и PID, и HTTP»"],
        "Шаги алгоритма в инспекторе должны совпадать с функциями модуля, а не жить только в чате.",
        ["python-args", "python-typing", "python-testing"])

    add("args", "Аргументы: default, *, **", "Функции", 18,
        "Позиционные, именованные, keyword-only.",
        "Keyword-only после `*` защищает от путаницы единиц: `move(*, speed_mps, duration_s)`.",
        "API движения робота легко вызвать с перепутанными скоростью и временем, если оба float.",
        "def move(*, speed_mps: float, duration_s: float) -> None:\n    ...",
        ["*args в публичном API без схемы", "перегрузка смыслом позиционных аргументов"],
        "В поле API компонента перечислите именованные параметры команд.",
        ["python-functions", "python-dataclasses", "python-fastapi"])

    add("scope", "Области видимости и closures", "Функции", 19,
        "LEGB, global, nonlocal.",
        "Замыкание захватывает переменную, не значение момента. В цикле колбэков это классический баг.",
        "Подписки MQTT `for topic in topics: client.on(topic, lambda: handle(topic))` — все увидят последний topic.",
        "def bind(topic):\n    def _h(msg):\n        handle(topic, msg)\n    return _h",
        ["global для состояния робота", "лямбда в цикле без default-аргумента"],
        "Состояние держите в объекте сервиса или очереди, не в global.",
        ["python-functions", "python-classes", "python-mqtt"])

    add("decorators", "Декораторы", "Функции", 20,
        "Обёртки, retries, timing, permission.",
        "Декоратор добавляет политику: повтор UART, таймаут, логирование. Не прячьте в нём бизнес-ветвление режима.",
        "`@retry(timeout=0.2, tries=3)` на `read_register` Modbus. На стоп-кнопку retry быть не должно.",
        "def timed(fn):\n    def wrap(*a, **k):\n        t0 = time.monotonic()\n        try:\n            return fn(*a, **k)\n        finally:\n            log.debug('dt=%s', time.monotonic()-t0)\n    return wrap",
        ["декоратор, глотающий KeyboardInterrupt", "стек из 6 декораторов на один handler"],
        "Политики retry опишите в протоколе (timeout, retry), декоратор только реализует контракт.",
        ["python-functions", "python-logging", "python-exceptions"])

    add("modules", "Модули и пакеты", "Модульность", 21,
        "import, пакеты, границы компонентов.",
        "Пакет = граница модуля архитектуры. `robot.drivers.can` не должен импортировать `robot.ui`.",
        "Соответствие холсту: блок «CAN-драйвер» ≈ пакет drivers, блок «Навигация» ≈ пакет nav.",
        "from robot.drivers.can import CanBus\nbus = CanBus(iface='can0')",
        ["циклические импорты как симптом комка", "from x import * в сервисе"],
        "Имена пакетов держите рядом с именами блоков. Вложенный холст = подпакет.",
        ["python-venv", "python-packaging", "python-architecture"])

    add("venv", "venv и зависимости", "Модульность", 22,
        "Изоляция, pin версий, extras.",
        "Один сервис — один venv или один контейнер. Зафиксируйте `requirements.txt` или `uv.lock`.",
        "На роботе образ без компилятора: колёса ставьте заранее. numpy/opencv лучше в Docker.",
        "pip install -r requirements.txt\n# fastapi==0.115.12",
        ["pip install в prod без pin", "два сервиса, один site-packages, конфликт protobuf"],
        "В документации бэкенда: runtime (venv/docker) и файл зависимостей. Это не мелочь.",
        ["python-install", "python-docker", "python-packaging"])

    add("exceptions", "Исключения", "Надёжность", 23,
        "raise, except, finally, цепочки ошибок.",
        "Исключение — сигнал сбоя. На контуре безопасности не глотайте `except Exception: pass`.",
        "Обрыв USB-камеры: исключение → FAULT → безопасный останов, событие в лог и MQTT `robot/fault`.",
        "try:\n    cam.read()\nexcept CameraTimeout as e:\n    raise Fault('camera') from e",
        ["голый except", "использование исключений для нормального потока «цели нет»"],
        "Отказы компонента — поле failure_modes. Алгоритм: что делаем при каждом классе ошибки.",
        ["python-logging", "python-context", "python-testing"])

    add("context", "Контекстные менеджеры", "Надёжность", 24,
        "with, ресурс, GPIO, сокеты, файлы.",
        "`with` гарантирует закрытие. Для GPIO/serial это единственный приличный путь не оставить линию в UNKNOWN.",
        "Открытие serial: при краше калибровки порт должен закрыться, иначе прошивка не переоткроется.",
        "with Serial('/dev/ttyACM0', 115200) as port:\n    port.write(b'PING\\n')",
        ["открыть порт в __init__ и забыть close", "вложенные with без таймаута"],
        "Ресурсы перечислите во входах компонента: tty, can0, camera /dev.",
        ["python-serial", "python-files", "python-classes"])

    add("files", "Файлы и pathlib", "Ввод-вывод", 25,
        "Текст, бинарь, атомарная запись конфигов.",
        "Конфиг и карты лучше писать атомарно (write temp + replace), иначе отключение питания оставит обрезанный YAML.",
        "Карта occupancy, калибровка камеры, last_pose — файлы на SBC. STL механики в Canvas — не этот слой, но версия калибровки — да.",
        "from pathlib import Path\nPath('data/last_pose.json').write_text(payload, encoding='utf-8')",
        ["относительные пути от неизвестного cwd", "запись JSON вручную конкатенацией"],
        "Attached files в Canvas — инженерные артефакты. Runtime-файлы опишите в документации сервиса.",
        ["python-json", "python-config", "python-logging"])

    add("json", "JSON", "Ввод-вывод", 26,
        "Сериализация телеметрии и API.",
        "JSON удобен между бэкендом и UI. Для MCU на 115200 он тяжёл — там бинарный кадр.",
        "Пример: `{ \"wheel_L\": 1.2, \"stamp\": 1710000000.1 }`. Числа — SI. Время — monotonic или epoch, но документируйте.",
        "json.dumps({'temp_c': 36.6}, separators=(',', ':'))",
        ["NaN в JSON (не стандарт)", "datetime без timezone"],
        "data_example связи HTTP/MQTT заполните реальным JSON. Это золото для AI-экспорта.",
        ["python-dicts", "python-fastapi", "python-mqtt"])

    add("struct", "struct и бинарная раскладка", "Ввод-вывод", 27,
        "pack/unpack кадров MCU.",
        "`struct.pack('<hH', left, right)` задаёт endianness. MCU little-endian — почти всегда `<`.",
        "Канал UART: `AA 55` + int16 left + int16 right + crc. Python и C++ должны разделить один документ протокола.",
        "import struct\nstruct.pack('<2h', int(left), int(right))",
        ["забыть endianness", "pack float туда, где прошивка ждёт Q8.8"],
        "Протокол Custom: message_structure = таблица полей. Связь MCU↔Python ссылается на него.",
        ["python-bytes", "python-serial", "cpp-endian"])

    add("logging", "logging", "Наблюдаемость", 28,
        "Уровни, логгер на модуль, без print.",
        "`print` пропадает в systemd. `logging` даёт уровень, время, компонент.",
        "На роботе: INFO — смена режима, WARNING — повтор кадра, ERROR — FAULT. DEBUG — сырые регистры, только на стенде.",
        "log = logging.getLogger(__name__)\nlog.info('mode=%s', mode)",
        ["логировать каждые 5 мс IMU в INFO", "конкатенация f-string до проверки уровня в горячем цикле — терпимо, но не гигантские дампы"],
        "Наблюдаемость — часть архитектуры. Документ «логи» у сервиса: куда journald/файл/MQTT.",
        ["python-exceptions", "linux-journalctl", "python-asyncio"])

    add("argparse", "CLI и argparse", "Инструменты", 29,
        "Утилиты калибровки и сервис.",
        "Один пакет — несколько команд: `robot serve`, `robot calibrate-imu`, `robot flash`.",
        "Стенд: оператор не должен править код, чтобы сменить порт `/dev/ttyACM0`.",
        "p = argparse.ArgumentParser()\np.add_argument('--port', default='/dev/ttyACM0')",
        ["обязательный CLI-флаг без default на изделии", "парсинг argv в середине библиотеки"],
        "Утилиты — отдельные блоки OTHER или вложенный холст «Tooling».",
        ["python-repl", "python-config", "python-serial"])

    add("config", "Конфигурация YAML/TOML", "Инструменты", 30,
        "Схема конфига, overlay для робота №3.",
        "Код не содержит магических PID-коэффициентов. Конфиг версионируется. Overlay: `base.yaml` + `robot-03.yaml`.",
        "Колёсная база, CPR, topic prefix, can bitrate — конфиг. Алгоритм PID — код + числа в конфиге.",
        "cfg = yaml.safe_load(Path('robot.yaml').read_text())\nwheel_base_m = cfg['mech']['wheel_base_m']",
        ["yaml.load без safe", "секреты Wi-Fi в git"],
        "Параметры механики дублируйте в Mechanical Data блока шасси, чтобы BOM и код не разъехались.",
        ["python-files", "python-dataclasses", "mech-params"])

    add("classes", "Классы", "ООП", 31,
        "Состояние сервиса, драйверы устройств.",
        "Класс драйвера инкапсулирует порт и протокол. Класс домена (`Pose`) — данные. Не делайте God-object `Robot` на 2к строк.",
        "`ImuDriver`, `MotorGateway`, `Supervisor` — три блока на холсте и три класса на границах.",
        "class MotorGateway:\n    def __init__(self, proto):\n        self.proto = proto\n    def set_omega(self, left, right):\n        self.proto.send(left, right)",
        ["логика навигации внутри драйвера UART", "публичные поля порта извне"],
        "Имя класса ≈ имя компонента. Вложенная архитектура ≈ пакет классов.",
        ["python-composition", "python-protocols-abc", "python-dataclasses"])

    add("dunder", "Дандер-методы", "ООП", 32,
        "__init__, __enter__, __repr__, сравнение.",
        "`__repr__` должен помогать в логах: `Imu(ok=True, hz=200)`, а не `<Imu object at 0x>`.",
        "При отладке телеметрии по journalctl человеческий repr экономит часы.",
        "def __repr__(self) -> str:\n    return f'Pose(x={self.x:.3f}, y={self.y:.3f})'",
        ["тяжёлая работа в __del__", "__eq__ без __hash__ для ключей"],
        "Формат логов согласуйте в документации сервиса.",
        ["python-classes", "python-context", "python-logging"])

    add("dataclasses", "Dataclasses", "ООП", 33,
        "Сообщения, команды, телеметрия.",
        "Dataclass — контракт сообщения. Его поля = JSON API = колонки, если пишете в БД.",
        "`Command(vx, wz, timeout_s)` от UI к супервизору. Валидация диапазонов — отдельно.",
        "@dataclass\nclass Twist:\n    vx: float\n    wz: float",
        ["мутабельный dataclass как ключ dict", "100 полей в одном Twist"],
        "Таблица `commands` в ER должна повторять поля dataclass, иначе экспорт SQL разъедется с кодом.",
        ["python-typing", "python-json", "python-pydantic"])

    add("composition", "Композиция вместо гигантского наследования", "ООП", 34,
        "Сборка робота из драйверов.",
        "Робот *имеет* шину, не «является» Serial. Наследование драйверов — редкость, композиция — норма.",
        "`Supervisor(motors, imu, estop)` тестируется моками. Иерархия `class Robot(Serial, HTTP, IMU)` — нет.",
        "class Supervisor:\n    def __init__(self, motors, imu, estop):\n        self.motors, self.imu, self.estop = motors, imu, estop",
        ["наследование ради шаринга пары методов", "скрытые синглтоны вместо аргументов"],
        "Связи на холсте = композиции в коде. Если связи нет, не тащите зависимость «на всякий случай».",
        ["python-classes", "python-protocols-abc", "python-testing"])

    add("protocols-abc", "Protocol и ABC", "ООП", 35,
        "Интерфейсы без ложной иерархии.",
        "`typing.Protocol` задаёт «умеет send(frame)». MCU-заглушка и реальный CAN — две реализации.",
        "На CI гоняйте навигацию против FakeBus. На изделии — SocketCAN. Архитектура не меняется.",
        "class Bus(Protocol):\n    def send(self, fid: int, data: bytes) -> None: ...",
        ["ABC с обязательным наследованием там, где достаточно Protocol", "интерфейс из 30 методов"],
        "Интерфейс компонента = поле interfaces + API. В коде — Protocol с тем же именем.",
        ["python-typing", "python-testing", "python-composition"])

    add("typing", "Аннотации типов", "Типы+", 36,
        "pyright/mypy, Optional, list[str].",
        "Типы ловят путаницу м и мм на границе функций. Это дешёвая страховка для робототехники.",
        "`def to_pwm(omega_rad_s: float) -> int` нельзя случайно скормить ticks.",
        "def to_pwm(omega_rad_s: float) -> int:\n    return int(clamp(omega_rad_s / MAX_OMEGA, -1, 1) * 1000)",
        ["Any как способ «закрыть глаза»", "типы только в публичном API, внутри каша — лучше чем ничего, но границы важнее"],
        "В документации API приведите сигнатуры. AI-экспорт тогда не выдумает единицы.",
        ["python-functions", "python-dataclasses", "python-testing"])

    add("enums", "Enum и режимы", "Типы+", 37,
        "Режимы, коды ошибок, не магические строки.",
        "`class Mode(StrEnum): IDLE=... FAULT=...` сериализуется в JSON и совпадает с state machine.",
        "Операторский UI и бэкенд должны разделять один словарь режимов. Расхождение — опасный баг.",
        "class Mode(StrEnum):\n    IDLE = 'IDLE'\n    AUTO = 'AUTO'\n    FAULT = 'FAULT'",
        ["сравнение строк 'fault'/'FAULT'", "enum в MCU другой, чем в Python, без таблицы соответствий"],
        "Состояния алгоритма = Enum. Требование: «неизвестное состояние → FAULT».",
        ["python-state-machine", "python-if", "python-json"])

    add("comprehensions", "Comprehensions", "Итерации", 38,
        "Списки/словари в одно выражение, без фанатизма.",
        "Удобно фильтровать валидные лидарные точки. Не прячьте PID внутрь comprehension.",
        "`valid = [p for p in cloud if p.range_m < 20]` — ок. Побочные эффекты в genexp — нет.",
        "hz = {s.name: s.rate for s in sensors if s.ok}",
        ["вложенные comp на 4 уровня", "исключения внутри comp без контекста"],
        "Фильтрация данных — шаг алгоритма «preprocess».",
        ["python-lists", "python-generators", "python-numpy"])

    add("generators", "Генераторы и yield", "Итерации", 39,
        "Поток кадров без гигантского списка.",
        "Генератор отдаёт кадры камеры/лидара по мере появления. Не копить минуту облаков в RAM.",
        "SBC 4 ГБ: необрезанный 10 Гц / 64k точек уедет в swap и убьёт control loop.",
        "def frames(cam):\n    while True:\n        ok, img = cam.read()\n        if not ok:\n            break\n        yield img",
        ["генератор с скрытым состоянием железа без close", "list(generator) «чтобы было удобно» на бесконечном потоке"],
        "Поток данных на холсте — Connection kind data_flow: Camera → Perception.",
        ["python-for", "python-asyncio", "python-opencv"])

    add("itertools", "itertools", "Итерации", 40,
        "window, chain, cycle для буферов.",
        "`pairwise` для производной энкодера, `islice` для ограничения пакета MQTT.",
        "Окно из двух тиков → скорость. Не пишите свои ring-buffer, пока не нужны realtime-гарантии.",
        "from itertools import pairwise\nomega = [(b-a)/dt for a, b in pairwise(ticks)]",
        ["cycle бесконечный без break в проде", "tee и неожиданное потребление памяти"],
        "Формулы одометрии — в алгоритме компонента Drive.",
        ["python-generators", "python-math", "python-pid"])

    add("copy", "Копии: copy и deepcopy", "Память", 41,
        "Когда разделять буфер нельзя.",
        "Поток UI забирает снимок телеметрии. Control loop продолжает писать. Без копии — гонка.",
        "Снимок `telemetry.copy()` в очередь. Deepcopy облака точек дорогой — копируйте нужные поля.",
        "import copy\nsnap = copy.copy(state)",
        ["deepcopy всего мира 100 Гц", "считать slice списка копией вложенных dict"],
        "Граница потоков = очередь сообщений на холсте (data_flow), не общая переменная «на честном слове».",
        ["python-threading", "python-lists", "python-dataclasses"])

    add("math", "math, statistics, случайность", "Численность", 42,
        "Тригонометрия, фильтры, не numpy.",
        "Для 2D-одометрии часто хватает math. atan2(dy, dx) для yaw. random — только симуляция/тесты, не для seed безопасности ключей.",
        "`yaw = math.atan2(dy, dx)` после интеграции. Нормализуйте угол в [-π, π].",
        "import math\nyaw = (yaw + math.pi) % (2*math.pi) - math.pi",
        ["градусы/радианы без суффикса", "random в control loop «для шума» на изделии"],
        "Единицы углов укажите в документации компонента Localization.",
        ["python-types-numbers", "python-pid", "python-numpy"])

    add("datetime", "Время: datetime и monotonic", "Численность", 43,
        "Стенки часов vs длительности.",
        "Интервалы цикла — `time.monotonic()`. Штампы для логов/БД — UTC aware datetime. Никогда не меряйте dt через wall clock (NTP прыгнет).",
        "PID и таймаут Watchdog считают monotonic. Операторский график — UTC.",
        "t0 = time.monotonic()\ndt = time.monotonic() - t0",
        ["datetime.now() naive", "сравнение aware и naive"],
        "В таблице events колонка timestamptz. В алгоритме PID — monotonic dt.",
        ["python-pid", "python-logging", "sql-types"])

    add("numpy", "NumPy для сенсоров", "Наука и железо", 44,
        "Векторы, маски, не Python-циклы по облаку.",
        "Облако точек и IMU-батчи — numpy. Control на 100 Гц с 10 числами — обычный float, без numpy-оверкида.",
        "`ranges[ranges < 0.05] = np.nan` перед SLAM. Не пишите for i in range(len(points)) на 30к точках в CPython.",
        "import numpy as np\nr = np.asarray(scan, dtype=np.float32)\nr[r < 0.05] = np.nan",
        ["смешать dtype float64/float32 без нужды на Pi", "немые оси без комментария frame"],
        "Perception — отдельный блок. Связь Lidar → Perception: UDP/USB + формат облака.",
        ["python-opencv", "python-generators", "robotics-slam"])

    add("opencv", "OpenCV кратко", "Наука и железо", 45,
        "Камера, калибровка, не весь CV.",
        "OpenCV читает кадр, undistort, детектор маркера. Тяжёлую сеть вынесите отдельно (часто другой процесс/NPU).",
        "Камера CSI на Pi: отдельный процесс, очередь последних кадров, чтобы не блокировать MQTT.",
        "ok, frame = cap.read()\ngray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)",
        ["обработка в GUI-потоке", "игнор калибровки camera_matrix"],
        "Блок Camera + вложенный алгоритм «undistort → detect → pose». Файл калибровки — attached note/file.",
        ["python-numpy", "python-threading", "robotics-sensors"])

    add("serial", "pyserial / UART", "Наука и железо", 46,
        "Порт, таймауты, кадрация.",
        "UART — байтовый поток без границ сообщений. Вы обязаны собирать кадры сами (idle-gap, length, delimiter).",
        "Связь Pi ↔ STM32. 115200 8N1. Watchdog: нет кадра 100 мс → FAULT.",
        "ser = serial.Serial('/dev/ttyACM0', 115200, timeout=0.05)\nn = ser.read(64)",
        ["timeout=None в проде", "предполагать, что read() вернул целый пакет"],
        "Протокол UART на связи, алгоритм «сбор кадра» на шлюзе, MCU — парсер зеркальный (C++).",
        ["python-struct", "python-bytes", "cpp-uart"])

    add("mqtt", "MQTT (paho)", "Сеть", 47,
        "Топики, QoS, retained, last will.",
        "MQTT — шина телеметрии. Не канал аварийного стопа, если нет отдельного гарантированного пути (проводной E-stop).",
        "`robot/+/imu` телеметрия QoS0. `robot/cmd` QoS1. Last will `robot/status=offline`.",
        "client.publish('robot/imu', payload, qos=0, retain=False)",
        ["retained команда движения — робот тронется после рестарта", "пароль брокера в образе без секрета"],
        "Блок MQTT + протокол MQTT на рёбрах. В data_example — JSON IMU. В notes — QoS и LWT.",
        ["python-json", "python-asyncio", "protocols-mqtt"])

    add("fastapi", "HTTP API на FastAPI", "Сеть", 48,
        "Команды оператора, OpenAPI, не control 1 кГц.",
        "FastAPI — внешний контур: миссия, карта, статус. Setpoint колёс — не REST 200 Гц.",
        "`POST /cmd/twist` пишет в очередь супервизора. Супервизор крутится своим циклом.",
        "@app.post('/cmd/twist')\ndef twist(body: Twist):\n    q.put(body)\n    return {'ok': True}",
        ["считать HTTP realtime", "долгая калибровка внутри request без job id"],
        "Блок API + связи HTTP к UI. Очередь — внутренний data_flow к Supervisor.",
        ["python-pydantic", "python-asyncio", "python-json"])

    add("pydantic", "Pydantic-схемы", "Сеть", 49,
        "Валидация команд на границе.",
        "Pydantic отсекает `vx=1e9`. Граница доверия — здесь, не в PID.",
        "Модель `Twist` с `ge=-2, le=2`. Невалидное — 422, робот не двигается.",
        "class Twist(BaseModel):\n    vx: float = Field(ge=-2, le=2)\n    wz: float = Field(ge=-3, le=3)",
        ["модель «всё Optional» без инвариантов", "два разных Twist в UI и бэкенде"],
        "Поля модели = документация API компонента = возможно колонки audit-таблицы.",
        ["python-dataclasses", "python-fastapi", "python-testing"])

    add("threading", "Потоки", "Параллельность", 50,
        "I/O-bound, GIL, очереди.",
        "Поток serial-reader + главный цикл через `queue.Queue`. Не делите dict без lock.",
        "Чтение UART блокирует — вынесите. PID на SBC можно в главном потоке, если dt стабилен.",
        "q: Queue[bytes] = Queue(maxsize=32)\nThread(target=reader, args=(q,), daemon=True).start()",
        ["busy-spin без timeout", "daemon-поток с записью в GPIO при shutdown"],
        "Каждый поток с железом = ответственность компонента. На холсте не прячьте «ещё поток» без блока.",
        ["python-copy", "python-asyncio", "python-queues"])

    add("queues", "Очереди сообщений в процессе", "Параллельность", 51,
        "queue.Queue, backpressure.",
        "maxsize и drop-old vs block. Для телеметрии UI обычно drop-old. Для команд — не терять E-stop.",
        "Очередь команд: при переполнении — FAULT, не молчаливый drop последней команды «едь».",
        "q.put(cmd, timeout=0.05)",
        ["безлимитная очередь → утечка при зависшем потребителе", "одна очередь для стопа и телеметрии"],
        "data_flow на холсте пометьте частотой и политикой drop. Это семантика, не оформление.",
        ["python-threading", "python-asyncio", "python-mqtt"])

    add("asyncio", "asyncio", "Параллельность", 52,
        "Много сокетов, один поток, осторожно с блокирующим кодом.",
        "MQTT+HTTP+websocket хорошо живут в asyncio. `time.sleep` и `serial.read` без to_thread заморозят всё.",
        "Шлюз: coroutine читает CAN через поток, публикует MQTT, принимает REST.",
        "async def run():\n    await asyncio.gather(http.serve(), mqtt.loop(), bridge())",
        ["вызвать blocking OpenCV в coroutine", "забытый timeout на wait"],
        "Если шлюз async — укажите в технологии компонента. Алгоритм: gather задач = параллельные шаги.",
        ["python-fastapi", "python-mqtt", "python-threading"])

    add("subprocess", "subprocess и прошивки", "Система", 53,
        "Вызов avrdude, esptool, systemctl.",
        "Сервис может триггерить прошивку, но не должен делать это синхронно из HTTP без job.",
        "`esptool.py write_flash ...` с таймаутом. Логи — в файл артефакта версии.",
        "subprocess.run(['systemctl', 'restart', 'robot'], check=True, timeout=15)",
        ["shell=True с конкатенацией пути", "нет timeout"],
        "Блок Tooling / Firmware flash. Связь с MCU — не runtime UART, а процедура обслуживания.",
        ["python-argparse", "linux-systemd", "python-exceptions"])

    add("testing", "pytest", "Качество", 54,
        "Юнит-тесты чистых функций и фейковых шин.",
        "PID, одометрия, парсер кадра тестируются без робота. Драйвер — против FakeSerial.",
        "CI на каждый PR архитектуры кода. Железо — nightly на стенде.",
        "def test_clamp():\n    assert clamp(5, 0, 1) == 1",
        ["тесты, которые ходят на реальный /dev без маркера integration", "случайный sleep «чтобы прошло»"],
        "Требования → тесты. Свяжите REQ-id в имени теста. В Canvas requirement_ids на компоненте.",
        ["python-functions", "python-protocols-abc", "python-pid"])

    add("pid", "ПИД на Python", "Управление", 55,
        "Дискретный PID, anti-windup, не магия.",
        "На SBC PID ок для медленных контуров (позиция камеры, температура). Для тока мотора — MCU/C++.",
        "Формула: `u = Kp e + Ki ∫e + Kd de`. Интегратор ограничивайте. dt — monotonic.",
        "e = sp - x\ninteg = clamp(integ + e * dt, -ilim, ilim)\nu = kp*e + ki*integ + kd*(e-e_prev)/dt",
        ["интегратор без насыщения", "dt=0 при повторном вызове"],
        "Алгоритм блока контроллера: шаги PID. Коэффициенты — конфиг и mechanical/notes привода.",
        ["python-datetime", "python-math", "robotics-pid"])

    add("state-machine", "Конечный автомат", "Управление", 56,
        "Режимы робота явно, переходы таблицей.",
        "Автомат: состояния + события + side-effects. Неразбериха if-ов — источник самопроизвольного старта.",
        "TELEOP + event ESTOP → FAULT. AUTO не доступен без localization_ok.",
        "TRANS = {('IDLE','START'): 'AUTO', ('ANY','ESTOP'): 'FAULT'}",
        ["неявные переходы в обработчиках MQTT", "состояние только в UI, бэкенд не знает"],
        "В инспекторе заполните states и transitions — это та же семантика, что код автомата.",
        ["python-enums", "python-if", "python-testing"])

    add("packaging", "Сборка пакета и точка входа", "Поставка", 57,
        "pyproject, console_scripts, версия.",
        "Сервис ставится как пакет: `robot-svc`. Версия пакета = версия компонента на холсте.",
        "Образ Docker `pip install .` и entrypoint `robot-svc`. Совпадение с полем version блока.",
        "# pyproject.toml\n[project.scripts]\nrobot-svc = 'robot.service:main'",
        ["версия только в UI Canvas, в коде 0.0.0", "editable install как способ деплоя на изделие"],
        "Поле version компонента синхронизируйте с git tag. Экспорт для AI тогда честный.",
        ["python-venv", "python-modules", "docker-python"])

    add("architecture", "Как резать Python-систему", "Поставка", 58,
        "Границы пакетов = блоки холста.",
        "Правило: зависимость в коде есть только если есть связь на архитектуре. Новый импорт — повод добавить Connection.",
        "drivers / domain / api / tools. Domain не импортирует FastAPI. API не считает PID.",
        "# robot/api зависит от robot.supervisor\n# robot.supervisor зависит от robot.drivers\n# drivers не зависят от api",
        ["общий util на 80 хелперов, который связывает всё со всем", "копипаста парсера протокола в трёх сервисах"],
        "Вложенный холст Python-бэкенда: API, Supervisor, Drivers. Это и есть карта пакетов.",
        ["python-modules", "python-composition", "sw-layers"])

    return items
