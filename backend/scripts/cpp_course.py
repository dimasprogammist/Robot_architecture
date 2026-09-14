from handbook_lib import render


def cpp_articles() -> list[str]:
    C = "cpp"
    T = ["C++"]
    items = []

    def add(slug, title, section, order, desc, about, robot, code, mistakes, canvas, related, example=None, extra=""):
        items.append(render(
            cat=C, slug=slug, title=title, section=section, order=order,
            description=desc, tags=[C, section.lower()], technologies=T,
            related=related, about=about, robot=robot, lang="cpp",
            code=code, example=example, mistakes=mistakes, canvas=canvas, extra=extra,
        ))

    add("intro", "Роль C++ в роботе", "Основы", 1,
        "Прошивка, realtime, драйверы: где C++ обязателен.",
        "C++ даёт контроль над памятью, детерминизм и доступ к регистрам. Это язык MCU, драйверов двигателей и часто нод ROS2, где важна латентность.",
        "Контур тока/скорости, разбор CAN, ШИМ — C++. Облако, UI, отчёты — чаще Python. Граница — протокол и очередь сообщений.",
        "// MCU control loop 1 kHz\nvoid tick();",
        ["писать UI на C++ «потому что быстрее» без измерения", "крутить кучу new в ISR"],
        "Блок MCU/CPU: технология C++. Алгоритм tick() — во вкладке Algorithm. Связи — UART/CAN/SPI.",
        ["cpp-build-model", "cpp-embedded", "cpp-isr"])

    add("build-model", "Компиляция, объектники, линковка", "Основы", 2,
        "Как из .cpp получается прошивка.",
        "Препроцессор → компиляция TU → линковка. Ошибка «undefined reference» — это линкер, не «C++ сломался».",
        "Прошивка STM32: startup + .cpp драйверы + app. Карта памяти — linker script, его тоже версионируйте.",
        "arm-none-eabi-g++ -c motor.cpp -o motor.o\narm-none-eabi-g++ motor.o -T stm32.ld -o app.elf",
        ["править только код и игнорировать .map/.ld", "разные флаги оптимизации на соседних библиотеках без причины"],
        "Документ MCU: toolchain, MCU part number, linker constraints (RAM/flash).",
        ["cpp-headers", "cpp-cmake", "cpp-ub"])

    add("hello", "main, типы фиксированной ширины", "Основы", 3,
        "cstdint вместо голого int на железе.",
        "На MCU размер int зависит от ABI. Регистры и протоколы описывайте `uint8_t`, `uint16_t`, `int32_t`.",
        "Кадр CAN 8 байт, ШИМ 16 бит таймера — типы в коде = типы в message_structure.",
        "#include <cstdint>\nstd::uint16_t pwm;",
        ["int для сырого регистра 32 бит без комментария signed", "bool как 8 бит в packed-структуре без static_assert"],
        "Таблица протокола и packed struct должны совпадать по именам полей.",
        ["cpp-struct", "cpp-endian", "cpp-headers"])

    add("headers", "Заголовки и ODR", "Основы", 4,
        "#pragma once, что можно в .h.",
        "Заголовок — контракт. Реализации — в .cpp. Шаблоны и constexpr — исключение, но не свалка.",
        "can_frame.hpp видят gateway и app. Железо-регистры bxcan.hpp не тащите в Python-биндинги.",
        "#pragma once\n#include <cstdint>\nvoid can_send(std::uint32_t id, const std::uint8_t* d, int n);",
        ["using namespace std в заголовке", "статические переменные в header без inline"],
        "Публичный заголовок драйвера = поле API компонента MCU.",
        ["cpp-build-model", "cpp-namespaces", "cpp-templates"])

    add("namespaces", "Пространства имён", "Основы", 5,
        "Границы как пакеты Python.",
        "`drv::can`, `app::supervisor`. Не `using namespace` в заголовках.",
        "Совпадение с вложенным холстом прошивки: Drivers / App / RTOS glue.",
        "namespace drv::can {\nvoid send(std::uint32_t id);\n}",
        ["анонимный namespace в header", "гигантский namespace robot на всё"],
        "Имена namespace = имена вложенных блоков MCU.",
        ["cpp-headers", "cpp-modules-logic", "cpp-classes"])

    add("const", "const, constexpr, consteval", "Основы", 6,
        "Неизменяемость и вычисления на этапе компиляции.",
        "Магические коэффициенты PID — `constexpr`. Буфер DMA — не const, но указатель на него в API может быть const-корректным.",
        "Таблица синуса для FOC — constexpr/flash. Не считайте sinf в каждом тике, если нет FPU-политики.",
        "constexpr float kWheelRadiusM = 0.03f;",
        ["#define PI вместо constexpr", "const метод, который кастует const_cast и пишет в железо"],
        "Константы геометрии дублируйте в Mechanical Data колеса: радиус, масса.",
        ["cpp-macros", "cpp-pid", "cpp-embedded"])

    add("pointers", "Указатели и ссылки", "Память", 7,
        "nullable vs обязательная ссылка.",
        "Ссылка — объект есть. Указатель — может быть nullptr (нет шины). Владение отдельно (unique_ptr).",
        "`Imu&` в tick, если IMU обязателен. `Bus*` если опциональный отладочный адаптер.",
        "void apply(Motor& m, const Twist& cmd);",
        ["ссылка на временный объект", "указатель без владельца из ISR в app без синхронизации"],
        "Опциональные устройства — отдельные блоки со связью, не «магический nullptr» без требований.",
        ["cpp-ownership", "cpp-span", "cpp-isr"])

    add("arrays", "Массивы и C-буферы", "Память", 8,
        "Фиксированный кадр, DMA, без вектора в ISR.",
        "На MCU кадр фиксирован: `uint8_t rx[64]`. `std::vector` в прерывании — путь в HardFault.",
        "USART DMA circular buffer — массив в BSS, индексы head/tail атомарно/volatile по правилам RTOS.",
        "std::uint8_t rx[64];\nvolatile std::uint16_t head;",
        ["возврат указателя на стековый массив", "vector.reserve в ISR «чтобы быстрее»"],
        "Размер кадра — в протоколе. Буфер — в алгоритме шлюза.",
        ["cpp-span", "cpp-dma", "cpp-freertos"])

    add("string", "std::string и когда её нет", "Память", 9,
        "Строки на Linux vs MCU.",
        "На Raspberry/IPC `std::string` нормален. На Cortex-M0 без кучи — нет. Логи на MCU — кольцевой буфер байт.",
        "Парсер AT-команд модема на Linux-шлюзе — string. На MCU — state machine по байту.",
        "std::string topic = \"robot/imu\";",
        ["исключения bad_alloc в control loop", "конкатенация string в тике 1 кГц"],
        "Технология блока MCU: «без кучи» если так решили — это ограничение архитектуры.",
        ["cpp-embedded", "cpp-exceptions", "cpp-logging"])

    add("vector", "std::vector", "STL", 10,
        "Динамический массив на Linux/SBC.",
        "Вектор облака точек на IPC ок. Следите за аллокациями в realtime-потоке: reserve заранее.",
        "ROS2 callback кладёт точки в заранее reserved vector, control берёт снимок.",
        "std::vector<float> ranges;\nranges.reserve(2048);",
        ["растёт каждый кадр без reserve", "передача vector по значению в горячем пути"],
        "Поток Lidar → Perception: формат массива ranges + stamp.",
        ["cpp-span", "cpp-alloc", "cpp-move"])

    add("map", "map и unordered_map", "STL", 11,
        "Словари id→объект, стоимость.",
        "`unordered_map` для id узлов. В ISR не ходите в map. На MCU часто таблица фиксированного размера.",
        "id сервопривода Dynamixel → состояние. На Linux-шлюзе map; на MCU — массив 0..N.",
        "std::unordered_map<int, Joint> joints;",
        ["map в realtime без пула", "string-ключи в горячем контуре"],
        "Каталог суставов — таблица/документ компонента, код только зеркало.",
        ["cpp-vector", "cpp-embedded", "cpp-realtime"])

    add("algorithms-stl", "Алгоритмы STL", "STL", 12,
        "find_if, clamp, transform вместо ручных циклов.",
        "STL снижает ошибки off-by-one. На MCU с кастомной STL проверяйте, что тянете.",
        "Ограничение PWM: `std::clamp(duty, 0, 1000)`. Поиск живого привода — find_if.",
        "#include <algorithm>\nduty = std::clamp(duty, 0, 1000);",
        ["кастомные циклы, которые пропускают последний элемент кадра", "std::function в тике (аллокации)"],
        "Ограничения актуатора — в mechanical notes и в коде clamp одни числа.",
        ["cpp-const", "cpp-pid", "cpp-span"])

    add("optional", "optional и коды ошибок", "STL", 13,
        "Нет значения vs ошибка железа.",
        "`optional<Pose>` — нет фикса. Ошибка I²C — отдельный тип/код, не «пустой optional», если нужно чинить кабель.",
        "IMU: optional пуст — нет нового сэмпла (норма). CRC fail — счётчик ошибок, затем FAULT.",
        "std::optional<ImuSample> imu.poll();",
        ["optional для всего, включая критичный estop", "игнор пустого в цикле без watchdog"],
        "failure_modes компонента: CRC, timeout, no-sample — разные ветки алгоритма.",
        ["cpp-exceptions", "cpp-expected", "cpp-watchdog"])

    add("expected", "std::expected / коды возврата", "STL", 14,
        "Ошибки без исключений в embedded.",
        "На MCU исключения часто выключены. `expected<T, Err>` или `bool + out` — явный контракт.",
        "`read_reg` возвращает Err::Nack. Выше — retry как в протоколе, не как «ну попробуем ещё».",
        "enum class Err { Ok, Nack, Crc, Timeout };\nErr read_reg(uint8_t a, uint16_t& v);",
        ["bool без причины отказа", "исключения при -fno-exceptions «на потом»"],
        "Поле retry/timeout протокола = политика этого API.",
        ["cpp-optional", "cpp-exceptions", "cpp-i2c"])

    add("functions", "Функции, перегрузка, inline", "Функции", 15,
        "Границы, ABI, не раздувать header.",
        "Маленькие inline в header — ок. Тяжёлая математика FOC — в cpp, чтобы не раздувать каждый TU.",
        "`set_duty(channel, counts)` — низкий слой. `set_omega(rad_s)` — домен. Не смешивать в одной перегрузке без имён.",
        "void set_duty(int ch, std::uint16_t counts);\nvoid set_omega(int ch, float rad_s);",
        ["перегрузка float/double без правила единиц", "inline гигантских функций"],
        "API блока MCU списком функций. Алгоритм пользуется доменным слоем.",
        ["cpp-headers", "cpp-classes", "cpp-hal"])

    add("lambda", "Лямбды", "Функции", 16,
        "Колбэки RTOS, захват this.",
        "Лямбда на таймер: не захватывайте большие объекты по значению в ISR. `this` должен жить дольше таймера.",
        "FreeRTOS task + лямбда, которая зовёт `this->tick()`. Объект Supervisor — static/global lifetime.",
        "auto isr = [this] { this->on_edge(); };",
        ["висящий this после delete", "захват vector по значению в 1 кГц"],
        "Колбэки — часть алгоритма компонента, не «скрытая магия таймера».",
        ["cpp-isr", "cpp-freertos", "cpp-ownership"])

    add("classes", "Классы и агрегация", "ООП", 17,
        "Драйвер = класс с явным init.",
        "Конструктор не должен молча трогать GPIO до `init()`: иначе статический порядок инициализации убивает тактовую.",
        "`PwmTimer tim8; tim8.init(cfg);` после тактирования RCC. На холсте: MCU internals — RCC, TIM, DRV.",
        "class PwmTimer {\npublic:\n  void init(const Cfg&);\n  void set(uint16_t);\n};",
        ["работа в конструкторе до тактирования", "синглтон на каждый регистр"],
        "Вложенный холст MCU: RCC, TIM, GPIO, App. Классы те же.",
        ["cpp-ctor", "cpp-raii", "cpp-hal"])

    add("ctor", "Конструкторы, деструкторы, rule of 5", "ООП", 18,
        "Владение ресурсом таймера/сокета.",
        "Если определили один из пяти — определите все или delete. Драйвер с raw-указателем DMA без delete копий.",
        "Класс `DmaBuf` копировать нельзя: unique ownership буфера.",
        "DmaBuf(const DmaBuf&) = delete;\nDmaBuf& operator=(const DmaBuf&) = delete;",
        ["копирование объекта, держащего DMA", "пустой деструктор и утечка descriptor"],
        "Ресурс компонента = объект с lifetime = lifetime блока (пока питание есть).",
        ["cpp-raii", "cpp-ownership", "cpp-move"])

    add("raii", "RAII", "Память+", 19,
        "Ресурс привязан к объекту.",
        "Файл, сокет, lock, mmap — закрываются деструктором. На MCU RAII — это «пин в безопасное состояние».",
        "`LockGuard` вокруг SPI-транзакции. При ошибке CRC lock всё равно отпустится.",
        "std::lock_guard<std::mutex> g(spi_mu_);\nspi_.xfer(buf, n);",
        ["ручной lock/unlock с early return", "RAII, который в деструкторе делает I2C"],
        "Интерфейсы компонента: кто владеет шиной. На холсте одна шина — один владелец, остальные клиенты.",
        ["cpp-ownership", "cpp-mutex", "cpp-spi"])

    add("ownership", "unique_ptr и shared_ptr", "Память+", 20,
        "Владение на Linux; на MCU чаще static.",
        "`unique_ptr` для драйвера камеры на IPC. `shared_ptr` — редкость (иногда ROS2). Циклические shared — утечка.",
        "Узел perception владеет камерой uniquely. Другие читают сообщения, не shared Camera.",
        "auto cam = std::make_unique<V4L2>();",
        ["shared_ptr как привычка «чтобы не думать»", "unique_ptr в ISR"],
        "Связь на холсте не равна shared_ptr. Это поток данных, не совместное владение железом.",
        ["cpp-move", "cpp-raii", "cpp-ros2"])

    add("move", "Move-семантика", "Память+", 21,
        "Передача буфера без копии.",
        "`std::move` кадра в очередь. После move исходный vector пуст — не читайте его.",
        "Камера заполняет buffer, move в lock-free очередь к детектору.",
        "q.push(std::move(frame));",
        ["move и повторное использование без reset", "return std::move(local) мешая NRVO"],
        "data_flow «кадр» — семантика move на границе компонентов.",
        ["cpp-vector", "cpp-ownership", "cpp-queues"])

    add("span", "span и views", "Память+", 22,
        "Невладеющий взгляд на буфер.",
        "`std::span<const uint8_t>` в парсер кадра: не копировать, не владеть. Владелец — DMA/очередь.",
        "CRC считается по span payload. Парсер не new.",
        "void parse(std::span<const std::uint8_t> f);",
        ["сохранить span дольше жизни буфера", "span на временный vector"],
        "Парсер — алгоритм шлюза. Буфер — драйвер DMA/UART.",
        ["cpp-arrays", "cpp-struct", "cpp-uart"])

    add("struct", "struct, packed, layout", "Данные", 23,
        "Совпадение с протоколом.",
        "`#pragma pack` / `__attribute__((packed))` и `static_assert(sizeof==N)`. Без этого Python struct и C++ разъедутся.",
        "Кадр UART 8 байт: magic, seq, i16, i16, crc. Один документ на оба конца.",
        "struct __attribute__((packed)) Frame { uint8_t m; int16_t l,r; uint16_t crc; };\nstatic_assert(sizeof(Frame)==7);",
        ["паддинг компилятора, о котором забыли", "float в packed без согласования endian"],
        "message_structure протокола = эта структура. Пришлите пример hex в data_example.",
        ["cpp-endian", "cpp-hello", "python-struct"])

    add("endian", "Порядок байт", "Данные", 24,
        "Little-endian MCU vs сеть.",
        "ARM обычно LE. Протоколы «как в регистре» vs big-endian Modbus. Функции `htons`/свои load_le.",
        "Modbus: big-endian регистры. Внутренний UART к своему MCU: LE. Шлюз конвертирует явно.",
        "inline uint16_t rd_be(const uint8_t* p){ return (uint16_t(p[0])<<8)|p[1]; }",
        ["смешать BE/LE в одном кадре без таблицы", "кастить struct на сеть"],
        "В протоколе поле encoding/endian. Связи Modbus и UART — разные цвета и разные правила.",
        ["cpp-struct", "cpp-modbus", "python-struct"])

    add("enums-class", "enum class", "Данные", 25,
        "Режимы прошивки, не «магические 3».",
        "Те же имена, что Python StrEnum и Canvas states: IDLE, RUN, FAULT.",
        "Байт режима в телеметрии. Несовпадение таблиц Python/C++ — ложный FAULT или хуже — ложный RUN.",
        "enum class Mode : uint8_t { Idle=0, Run=1, Fault=2 };",
        ["неявное приведение к int в протоколе без таблицы", "разные порядки enumerator"],
        "States в алгоритме MCU = enum class. Экспорт AI должен увидеть те же имена.",
        ["cpp-state-machine", "python-enums", "cpp-struct"])

    add("templates", "Шаблоны без боли", "Шаблоны", 26,
        "Драйвер на тип шины, не копипаста.",
        "Шаблон `Crc<Poly>` ок. Шаблон на весь робот — нет. Следите за временем компиляции прошивки.",
        "Один код PID на float (симуляция) и Q15 (MCU) — осторожно, лучше явные типы.",
        "template<class Bus>\nvoid ping(Bus& b){ b.send(0x00); }",
        ["шаблон в каждый заголовок без необходимости", "ошибки на 200 строк instantiation в тике"],
        "Общий алгоритм — текст в Canvas; специализации — технологии вложенных блоков.",
        ["cpp-headers", "cpp-pid", "cpp-hal"])

    add("macros", "Препроцессор", "Инструменты", 27,
        "Include guards, условная компиляция платформ.",
        "`#ifdef BOARD_REV2` для разводки. Не `#define` функции. Конфиг плат — отдельный header, не россыпь.",
        "REV2 поменял пин STEP. Архитектура та же, hardware revision — поле компонента + ifdef.",
        "#if BOARD_REV>=2\n#define STEP_PIN 14\n#else\n#define STEP_PIN 7\n#endif",
        ["скрытый ifdef, который меняет семантику протокола", "макрос min/max ломающий std::min"],
        "Ревизия платы — в Hardware Data. Не держите только в макросе без холста.",
        ["cpp-const", "cpp-hal", "electronics-gpio"])

    add("cmake", "CMake", "Инструменты", 28,
        "Прошивки и Linux-ноды.",
        "CMake — карта таргетов = карта модулей. `firmware`, `gateway`, `tests`. Опции: BOARD, ENABLE_FOC.",
        "CI собирает firmware.elf и linux-gateway. Разные блоки — разные таргеты, не один mega-binary без нужды.",
        "add_executable(firmware src/main.cpp src/motor.cpp)\ntarget_compile_features(firmware PRIVATE cxx_std_20)",
        ["глобальные include на всё подряд", "отключённые предупреждения -w"],
        "Сборочные таргеты упомяните в документации компонента MCU/C++ сервиса.",
        ["cpp-build-model", "cpp-sanitizers", "cpp-testing"])

    add("exceptions", "Исключения: где да, где нет", "Надёжность", 29,
        "-fno-exceptions на MCU, ок на IPC.",
        "На Linux-шлюзе исключения возможны на границах. В control loop — коды ошибок. Смешение без политики — дыры.",
        "Разбор JSON конфига может кинуть. tick() — нет.",
        "#if __has_feature(cxx_exceptions)\nthrow std::runtime_error(\"cfg\");\n#endif",
        ["throw из ISR", "catch(...) и продолжить ехать"],
        "failure_modes: что неловим. Требование: «исключение конфигурации не стартует RUN».",
        ["cpp-expected", "cpp-isr", "cpp-testing"])

    add("logging", "Логи прошивки и spdlog", "Наблюдаемость", 30,
        "ITM/RTT/UART vs spdlog на Linux.",
        "На MCU — кольцевой лог уровней. На IPC — spdlog/journald. Не printf в 10 кГц.",
        "FAULT пишет причину и tick count. Это потом попадёт в MQTT fault-topic через шлюз.",
        "log_fault(\"crc\", seq);",
        ["блокирующий UART-лог из ISR", "строки без лимита в tiny RAM"],
        "Канал логов — связь MCU → шлюз (может быть тот же UART multiplex или RTT только на стенде).",
        ["cpp-uart", "cpp-watchdog", "linux-journalctl"])

    add("threads", "std::thread на Linux", "Параллельность", 31,
        "Не путать с задачами FreeRTOS.",
        "На IPC поток чтения сокета + поток контроля. Affinity/realtime-policy — осознанно (SCHED_FIFO осторожно).",
        "Gateway: thread CAN, thread MQTT. Общая очередь команд.",
        "std::thread th([&]{ can_loop(); });\nth.join();",
        ["detach и доступ к стеку caller", "два потока пишут в один сокет без mutex"],
        "Потоки Linux-сервиса = вложенные блоки или явно описанные алгоритмы параллельных циклов.",
        ["cpp-mutex", "cpp-queues", "cpp-freertos"])

    add("mutex", "Мьютексы и lock-free", "Параллельность", 32,
        "Когда lock, когда ringbuffer.",
        "Данные 1 кГц в UI 10 Гц — lock-free spsc очередь. Конфиг во время RUN — mutex, редкий путь.",
        "ISR кладёт байт в ring, task забирает. На Cortex — правила memory barrier/volatile не вместо атомиков.",
        "std::mutex m;\nstd::lock_guard n(m);",
        ["лок в ISR", "инверсия приоритетов без RTOS-aware lock"],
        "Граница ISR/task — в алгоритме MCU отдельными шагами.",
        ["cpp-atomics", "cpp-isr", "cpp-raii"])

    add("atomics", "std::atomic", "Параллельность", 33,
        "Флаги стопа, seqlock для телеметрии.",
        "`atomic<bool> estop`. Не atomic большой struct без схемы. Для телеметрии часто двойной буфер.",
        "Кнопка ESTOP пин → EXTI → atomic flag → tick видит и снимает PWM в том же кГц.",
        "std::atomic<bool> estop{false};",
        ["atomic без указания order «потом разберёмся» в lock-free", "считать volatile заменой atomic"],
        "Требование безопасности: ESTOP независим от MQTT. На холсте отдельная связь GPIO, не через брокер.",
        ["cpp-isr", "cpp-watchdog", "cpp-safety"])

    add("chrono", "chrono и таймеры", "Время", 34,
        "steady_clock vs system_clock, аппаратные таймеры.",
        "На Linux dt — steady_clock. На MCU — таймер аппаратный, не «надежда на цикл».",
        "PID на MCU завязан на TIM interrupt 1 кГц. Не на while+delay.",
        "using clk = std::chrono::steady_clock;\nauto dt = clk::now() - t0;",
        ["sleep_for как регулятор ШИМ", "system_clock для dt"],
        "Частота контура — в алгоритме и в notes MCU. Это системное требование, не деталь реализации.",
        ["cpp-pid", "cpp-timers", "python-datetime"])

    add("filesystem", "filesystem на Linux", "Ввод-вывод", 35,
        "Калибровки и карты на диске.",
        "На IPC сохраняйте атомарно. На MCU файлов нет — калибровка в Flash/EEPROM.",
        "Калибровка IMU yaml рядом с сервисом. Версия файла = version вложенного блока Calibration.",
        "std::filesystem::path p{\"/var/lib/robot/imu.yaml\"};",
        ["запись по относительному пути из systemd без WorkingDirectory", "нет fsync на критичном last_pose"],
        "Attached files в Canvas — инженерные. Runtime path — в документации Linux-сервиса.",
        ["cpp-logging", "linux-systemd", "python-files"])

    add("iostreams", "Потоки I/O", "Ввод-вывод", 36,
        "Отладка vs горячий путь.",
        "`std::cout` не для 1 кГц. Для стенда — ок. В прошивке — ITM/RTT.",
        "Утилита калибровки на ПК читает csv. Прошивка не парсит csv.",
        "std::ofstream out(\"enc.csv\");\nout << t << ',' << ticks << '\\n';",
        ["flush каждый сэмпл на SD, убивая dt", "смешать locale и числа протокола"],
        "Стендовые утилиты — отдельные блоки OTHER.",
        ["cpp-logging", "cpp-argparse", "cpp-testing"])

    add("argparse", "CLI Linux-узла", "Инструменты+", 37,
        "Порт, iface, конфиг.",
        "Как в Python: изделие не пересобирают ради can0 vs can1. Флаги/конфиг.",
        "`gateway --can can0 --mqtt mqtt://...`",
        "if (arg == \"--can\") iface = argv[++i];",
        ["обязательный дебаг-флаг, который забыли в systemd unit", "парсинг без проверки argc"],
        "Команда запуска — в README компонента gateway.",
        ["cpp-cmake", "linux-systemd", "python-argparse"])

    add("ub", "Неопределённое поведение", "Качество", 38,
        "Переполнения, висящие указатели, strict aliasing.",
        "UB на MCU выглядит как «иногда сбрасывается». Sanitizer на host-тестах парсера обязателен.",
        "Парсер кадра тестируйте на PC с ASan/UBSan теми же функциями, что в прошивке (без HAL).",
        "int16_t s = int16_t(uint16_t(hi)<<8 | lo); // явно",
        ["сдвиг отрицательных", "выход за массив rx"],
        "Требование на парсер: «неизвестный кадр отбрасывается, не падает». Тесты — к требованию.",
        ["cpp-sanitizers", "cpp-testing", "cpp-span"])

    add("sanitizers", "ASan, UBSan, TSan", "Качество", 39,
        "Host-сборки парсеров и очередей.",
        "Не прошьёте ASan в M0. Соберите `parser_tests` на x86_64 с санитайзерами.",
        "Кольцевой буфер и CRC — идеальные цели UBSan.",
        "cmake -DSANITIZE=ON ...\n# -fsanitize=address,undefined",
        ["отключить санитайзер потому что «тест красный» без понимания", "TSan на коде с отключёнными атомиками"],
        "CI — часть архитектуры поставки (будущий блок CI). Пока — документ MCU/tests.",
        ["cpp-ub", "cpp-testing", "cpp-cmake"])

    add("testing", "GoogleTest / Catch2", "Качество", 40,
        "Парсер, PID, автомат без платы.",
        "80% прошивки можно тестировать: math, fsm, protocol. HAL мокайте.",
        "`TEST(Crc, MatchesPython)` — золотой стандарт общего протокола.",
        "EXPECT_EQ(crc16(buf), 0x1D0F);",
        ["тесты, завязанные на реальный ST-Link в unit", "золотые файлы без комментария протокола"],
        "Связь требования REQ и теста. На холсте MCU.requirement_ids.",
        ["cpp-ub", "python-testing", "cpp-state-machine"])

    add("gdb", "Отладка: gdb, OpenOCD, RTT", "Качество", 41,
        "Стенд прошивки.",
        "HardFault: смотрите stacked PC. Не гадайте. Логи RTT не заменяют fault analyzer.",
        "Точка на `can_send` при потере крутящего момента. Сравнивайте с логикой Python-шлюза.",
        "monitor reset halt\nbreak Fault_Handler",
        ["оптимизация -O2 и «переменные исчезли» без volatile/debug build", "отладка ESTOP с включёнными моторами без колодок"],
        "Стенд отладки — вложенный холст lab: SWD, питание, нагрузка.",
        ["cpp-isr", "electronics-psu", "cpp-watchdog"])

    add("embedded", "Embedded без кучи", "MCU", 42,
        "static, пулы, запрет new.",
        "`new` в прошивке либо запрещён, либо только на старте. После `osKernelStart` — никаких аллокаций.",
        "Объекты драйверов — static. Очереди FreeRTOS — статический аллокатор.",
        "static PwmTimer tim;\n// no new after boot",
        ["строка STL в тике", "рекурсия парсера"],
        "Ограничение «no heap» — notes MCU и требование. Это влияет на выбор STL.",
        ["cpp-freertos", "cpp-string", "cpp-alloc"])

    add("alloc", "Аллокации и пулы", "MCU", 43,
        "Если куча всё же есть.",
        "Пул кадров фиксированного размера лучше общего heap. Фрагментация на неделе работы — классика.",
        "Пулл 8 кадров лидара на M7 с RTOS. Не malloc на каждый USB-пакет.",
        "static Frame pool[8];",
        ["free не того указателя после DMA", "разный размер пула «на глаз» без измерения"],
        "Пул — внутренность вложенного холста драйвера.",
        ["cpp-embedded", "cpp-dma", "cpp-vector"])

    add("hal", "HAL и порты", "MCU", 44,
        "Слой абстракции, не религия.",
        "HAL от вендора удобен. Не размазывайте регистры по app. Порт: `gpio_set`, `tim_set_ccr`.",
        "App считает омы, HAL пишет CCR. Смена MCU — замена hal/, не supervisor.",
        "void pwm_set(int ch, uint16_t ccr);",
        ["app включает биты RCC вперемешку с PID", "HAL-callback ад без очереди в app"],
        "Вложенный холст MCU: HAL vs App. Связь внутренняя, но семантическая.",
        ["cpp-classes", "cpp-macros", "cpp-isr"])

    add("isr", "Прерывания", "MCU", 45,
        "Коротко, флаги, никаких протоколов целиком.",
        "ISR: снять флаг, положить байт/событие, выйти. Разбор Modbus — в task.",
        "USART RXNE → ring. EXTI ESTOP → atomic + снять PWM сразу, если политика «hardware first».",
        "extern \"C\" void USART1_IRQHandler() {\n  ring_push(USART1->RDR);\n}",
        ["malloc в ISR", "лог/printf в ISR", "долгое float в EXTI"],
        "Алгоритм MCU: ветка ISR vs task. Требование латентности ESTOP — отдельное.",
        ["cpp-atomics", "cpp-dma", "cpp-safety"])

    add("dma", "DMA", "MCU", 46,
        "Память, кэш, согласованность.",
        "DMA пишет буфер, CPU читает. На Cortex-M7 смотрите D-cache. Align буферов.",
        "ADC + DMA для тока. PID читает последнее валидное значение по флагу half/full.",
        "HAL_ADC_Start_DMA(&hadc1, buf, N);",
        ["читать буфер DMA кэшированным без invalidate", "перекрыть буфер стеком"],
        "Внутренний блок ADC/DMA во вложенном холсте MCU.",
        ["cpp-isr", "cpp-arrays", "electronics-adc"])

    add("timers", "Аппаратные таймеры и PWM", "MCU", 47,
        "ШИМ, encoder input, tick 1 кГц.",
        "Таймер — источник истины времени контура. ARR/PSC посчитайте и запишите в notes.",
        "PWM 20 кГц для драйвера, отдельный TIM на 1 кГц PID. Не один таймер «на всё», если конфликтуют.",
        "tim->CCR1 = duty;",
        ["слишком низкий PWM — свист и нагрев", "менять PSC на лету без глушения"],
        "Motor driver блок + MCU PWM связь. Частота PWM — в документации обоих.",
        ["cpp-pid", "electronics-motor", "cpp-chrono"])

    add("uart", "UART в C++", "Шины", 48,
        "Регистры, DMA, кадры.",
        "Как в Python: поток байт. State machine: Hunt magic → len → payload → crc.",
        "Связь со шлюзом Python. Одинаковый документ кадра. Тест CRC общий.",
        "enum { Hunt, Len, Body, Crc };",
        ["блокирующий wait в тике на RX", "разный magic на концах"],
        "Протокол UART на ребре MCU—Gateway. Алгоритм FSM — у обоих, но реализация своя.",
        ["python-serial", "cpp-struct", "cpp-dma"])

    add("spi", "SPI", "Шины", 49,
        "Режим, CS, транзакции.",
        "IMU SPI: mode, max Hz из datasheet. CS — RAII транзакция. Не отпускать CS посередине регистра.",
        "Блок IMU на холсте, связь SPI с MCU. Datasheet — Documentation link.",
        "cs_low();\nspi_txrx(reg | 0x80);\ncs_high();",
        ["неверный SPI mode 0/3", "слишком длинные провода без проверки timing"],
        "Протокол SPI на связи. В notes — mode и частота. Datasheet в docs компонента IMU.",
        ["cpp-raii", "electronics-datasheet", "cpp-i2c"])

    add("i2c", "I²C", "Шины", 50,
        "NACK, clock stretch, несколько устройств.",
        "Адрес 7 bit. Pull-up — электроника, не «магия кода». Timeout обязателен: slave может зажать SCL.",
        "Датчики на одной шине — отдельные блоки, одна связь I²C к MCU (или явно bus component).",
        "if (!i2c_write(addr, reg, val)) return Err::Nack;",
        ["игнор NACK", "два мастера без политики"],
        "Если много slave — покажите шину как NETWORK/компонент шины, не прямую кашу рёбер.",
        ["electronics-pullup", "cpp-expected", "cpp-spi"])

    add("can", "CAN", "Шины", 51,
        "id, DLC, фильтры, bus-off.",
        "CAN — не «сокет на всякий». Нужны bitrate, termination, фильтры id, обработка bus-off.",
        "Привод и MCU на CAN. Python-шлюз через SocketCAN — другой блок, тот же протокол прикладного уровня.",
        "can_send(0x101, data, 8);",
        ["забытый терминатор", "разный bitrate концов", "игнор error warning"],
        "Протокол CAN цвет линии. Прикладной кадр — message_structure. Физика — в electronics/notes.",
        ["cpp-endian", "protocols-can", "python-struct"])

    add("modbus", "Modbus на MCU/шлюзе", "Шины", 52,
        "RTU vs TCP, регистры.",
        "ПЛК часто Modbus. MCU может быть slave. Карта регистров — документ, как ER для железа.",
        "Python-сервис читает holding registers. Карта: 40001 = omega_sp. Совпадает с таблицей в Canvas docs.",
        "uint16_t regs[32];",
        ["off-by-one 40001 vs 0", "CRC RTU другой, чем «кажется»"],
        "Протокол Modbus RTU/TCP на ребре PLC—Service. Карта регистров — Documentation.",
        ["protocols-modbus", "cpp-endian", "python-struct"])

    add("freertos", "FreeRTOS задачи", "RTOS", 53,
        "Приоритеты, стеки, очереди.",
        "Задача PID высокий приоритет, телеметрия ниже. Стеки мерить, не 128 «наугад». Watchdog task.",
        "Вложенный холст MCU: tasks как блоки. Связи — очереди RTOS (семантика data_flow).",
        "xTaskCreate(pid_task, \"pid\", 512, 0, 4, 0);",
        ["голодание низкой задачи логов — ок; голодание ESTOP — нет", "printf из низкого приоритета с огромным стеком"],
        "Каждая задача — вложенный блок или шаг алгоритма с приоритетом в notes.",
        ["cpp-isr", "cpp-watchdog", "cpp-queues"])

    add("queues", "Очереди RTOS/Lock-free", "RTOS", 54,
        "События, не shared mutable.",
        "ISR → queue → task. Переполнение очереди команд — FAULT, не drop E-stop.",
        "Как Python Queue, но со статическим хранилищем.",
        "xQueueSendFromISR(q, &b, &woken);",
        ["очередь «на 1 элемент» для потока кадров камеры", "слать из ISR в очередь, которая ждёт malloc"],
        "Политика очереди — в связи data_flow (frequency, reliability).",
        ["cpp-freertos", "cpp-isr", "python-queues"])

    add("watchdog", "Watchdog", "RTOS", 55,
        "Внешний и оконный WDT.",
        "WDT сбрасывает MCU, если tick умер. Кормить из idle — ошибка: зависший PID при живом idle.",
        "Кормите WDT только из контрольного task, который видит «PID жив». ESTOP не ждёт WDT.",
        "if (pid_alive) IWDG_refresh();",
        ["refresh в ISR «на всякий»", "слишком длинный timeout для механизма"],
        "Требование безопасности: независимый WDT. На холсте — часть MCU, явно в requirements.",
        ["cpp-safety", "cpp-freertos", "cpp-isr"])

    add("pid", "PID на C++", "Управление", 56,
        "Фиксированная точка vs float, saturations.",
        "На M4F float ок. На M0 — Q-формат. Anti-windup обязателен у интегратора рядом с PWM sat.",
        "Контур скорости колеса 1 кГц. Коэффициенты из конфига Flash, те же имена, что в Python-симе.",
        "u = kp*e + ki*integ + kd*de;\nu = clamp(u, -UMAX, UMAX);",
        ["разный dt «примерно 1 мс»", "коэффициенты только в голове инженера"],
        "Алгоритм PID в инспекторе MCU. Коэффициенты — конфиг + notes. Сравните с python-pid симом.",
        ["python-pid", "cpp-timers", "robotics-pid"])

    add("state-machine", "Автомат прошивки", "Управление", 57,
        "Те же состояния, что у супервизора.",
        "Прошивка не должна ехать, если супервизор в FAULT — но ESTOP локальный. Таблица переходов компактная.",
        "События: cmd, timeout, estop, bus-off. Не MQTT внутри MCU.",
        "Mode step(Mode m, Ev e);",
        ["состояние только флагами bool без таблицы", "рассинхрон имён с Python"],
        "Заполните states/transitions MCU 1:1 с кодом. Иначе AI-экспорт соврёт прошивке.",
        ["cpp-enums-class", "python-state-machine", "cpp-safety"])

    add("safety", "Функциональная безопасность (практика)", "Управление", 58,
        "Не IEC 61508 целиком, но дисциплина.",
        "Два канала стопа: проводной ESTOP снимает PWM в ISR; логический FAULT гасит уставки. Не один MQTT-топик.",
        "На холсте ESTOP — отдельный блок/связь GPIO. Требование «движение невозможно при разомкнутом контуре».",
        "if (estop.load()) { pwm_coast(); return; }",
        ["программный стоп без аппаратного", "тест ESTOP только в симе"],
        "Requirements с priority must на ESTOP. Связь с MCU и драйвером мотора.",
        ["cpp-atomics", "cpp-watchdog", "robotics-safety"])

    add("ros2", "C++ и ROS2 (обзор)", "Экосистема", 59,
        "Нода как компонент, топики как связи.",
        "ROS2-нода ≠ вся архитектура. Это вариант IPC-компонента. MCU всё равно за протоколом.",
        "Блок Localization (rclcpp) ↔ MCU через micro-ROS или свой UART. Не прячьте MCU «внутри ROS».",
        "// rclcpp::Node(\"loc\")\n// pub /odom",
        ["весь control в Python-ноде 10 Гц и ожидание чуда", "один mega-node на всё"],
        "Топики ROS — это Connections с протоколом DDS/ROS. Имена топиков в protocol notes.",
        ["cpp-threads", "python-mqtt", "sw-layers"])

    add("eigen", "Eigen / линейная алгебра", "Экосистема", 60,
        "Кинематика на IPC, не обязательно на M0.",
        "FK манипулятора — Eigen на IPC. На маленьком MCU — явные формулы 2D.",
        "Блок Kinematics. Связь JointState → Pose. Тесты на известные позы.",
        "// Eigen::Matrix4d T = ...",
        ["аллокации Eigen в realtime без noalloc", "смешать frame без TF-дисциплины"],
        "Mechanical chain на холсте должна совпасть с порядком преобразований в коде.",
        ["robotics-kinematics", "cpp-alloc", "python-numpy"])

    return items
