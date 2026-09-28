import type { Component } from '../types'

export interface ComponentField { key: string; label: string; placeholder?: string }
export interface ComponentDefinition {
  id: string
  names: string[]
  fields: ComponentField[]
  algorithm: { purpose: string; inputs: string[]; outputs: string[]; steps: string[]; errors: string[] }
}

const fields = (...items: ComponentField[]) => items
const common = fields(
  { key: 'model', label: 'Модель' }, { key: 'manufacturer', label: 'Производитель' },
  { key: 'purpose', label: 'Назначение' }, { key: 'interfaces', label: 'Интерфейсы' },
  { key: 'protocols', label: 'Протоколы' },
)

/** Central extension point for canvas semantics, inspector fields and algorithm defaults. */
export const COMPONENT_CATALOG: ComponentDefinition[] = [
  { id: 'board', names: ['STM32', 'ESP32', 'Raspberry Pi', 'Arduino', 'MCU', 'SBC', 'ПЛК'], fields: [...common, { key: 'cpu', label: 'CPU / MCU' }, { key: 'power', label: 'Питание' }, { key: 'memory', label: 'Память' }, { key: 'gpio', label: 'GPIO' }], algorithm: { purpose: 'Считывает входы, исполняет управляющую программу и передаёт команды.', inputs: ['сигналы GPIO и сообщения интерфейсов'], outputs: ['команды исполнительным устройствам'], steps: ['Инициализировать питание и интерфейсы', 'Считать входные данные', 'Выполнить управляющую логику', 'Передать результат'], errors: ['нет питания', 'ошибка интерфейса'] } },
  { id: 'controller', names: ['Контроллер двигателя', 'Контроллер'], fields: [...common, { key: 'cpu', label: 'CPU' }, { key: 'power', label: 'Питание' }, { key: 'memory', label: 'Память' }], algorithm: { purpose: 'Преобразует команду управления в безопасное воздействие на исполнительный механизм.', inputs: ['целевая скорость или положение', 'обратная связь'], outputs: ['PWM, токовая или CAN-команда'], steps: ['Проверить питание и ограничения', 'Принять команду', 'Сопоставить с обратной связью', 'Выдать управляющий сигнал'], errors: ['перегрузка', 'потеря обратной связи'] } },
  { id: 'database-server', names: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Redis'], fields: fields({ key: 'dbms', label: 'СУБД' }, { key: 'db_version', label: 'Версия' }, { key: 'host', label: 'Hostname / IP' }, { key: 'port', label: 'Порт' }, { key: 'database', label: 'Имя базы' }, { key: 'storage', label: 'Тип хранения' }, { key: 'purpose', label: 'Назначение' }, { key: 'connection', label: 'Параметры подключения' }), algorithm: { purpose: 'Хранит и возвращает данные по запросам клиентов.', inputs: ['запрос и параметры подключения'], outputs: ['результат запроса или подтверждение записи'], steps: ['Принять соединение', 'Проверить права', 'Выполнить запрос', 'Вернуть результат'], errors: ['нет соединения', 'ошибка схемы или прав'] } },
  { id: 'web-server', names: ['Web-сервер', 'Python-бэкенд', 'React-фронтенд'], fields: fields({ key: 'os', label: 'ОС' }, { key: 'web_server', label: 'Web server' }, { key: 'port', label: 'Порт' }, { key: 'host', label: 'Hostname / IP' }, { key: 'framework', label: 'Framework' }, { key: 'purpose', label: 'Назначение' }, { key: 'protocol', label: 'Протокол' }), algorithm: { purpose: 'Принимает сетевой запрос, выполняет прикладную обработку и возвращает ответ.', inputs: ['HTTP/HTTPS запрос'], outputs: ['ответ, событие или ошибка'], steps: ['Принять запрос', 'Проверить данные и доступ', 'Выполнить обработку', 'Отправить ответ'], errors: ['неверный запрос', 'ошибка зависимости'] } },
  { id: 'sensor', names: ['Концевой выключатель', 'Дальномер HC-SR04', 'Датчик расстояния VL53L0X', 'Датчик температуры DS18B20', 'Датчик положения', 'Энкодер', 'Камера', 'LiDAR'], fields: fields({ key: 'model', label: 'Модель' }, { key: 'measurement', label: 'Измеряемая величина' }, { key: 'range', label: 'Диапазон' }, { key: 'accuracy', label: 'Точность' }, { key: 'power', label: 'Питание' }, { key: 'interface', label: 'Интерфейс' }, { key: 'sample_rate', label: 'Частота измерений' }), algorithm: { purpose: 'Измеряет физическую величину и передаёт нормализованное значение контроллеру.', inputs: ['физическое воздействие'], outputs: ['измерение и статус'], steps: ['Инициализировать датчик', 'Снять измерение', 'Проверить диапазон', 'Передать значение'], errors: ['нет ответа', 'значение вне диапазона'] } },
  { id: 'network', names: ['Шлюз', 'Маршрутизатор', 'Коммутатор'], fields: fields({ key: 'model', label: 'Модель' }, { key: 'host', label: 'Hostname / IP' }, { key: 'ports', label: 'Порты' }, { key: 'protocols', label: 'Протоколы' }, { key: 'purpose', label: 'Назначение' }), algorithm: { purpose: 'Маршрутизирует или коммутирует трафик между сегментами системы.', inputs: ['сетевые кадры или пакеты'], outputs: ['доставленный трафик'], steps: ['Принять пакет', 'Определить маршрут', 'Проверить правила', 'Передать пакет'], errors: ['нет маршрута', 'недоступен интерфейс'] } },
  { id: 'actuator', names: ['Двигатель', 'Сервопривод', 'Исполнитель'], fields: fields({ key: 'model', label: 'Модель' }, { key: 'power', label: 'Питание' }, { key: 'control', label: 'Управляющий сигнал' }, { key: 'feedback', label: 'Обратная связь' }, { key: 'purpose', label: 'Назначение' }), algorithm: { purpose: 'Преобразует управляющий сигнал в механическое движение.', inputs: ['команда контроллера'], outputs: ['движение и обратная связь'], steps: ['Получить команду', 'Проверить ограничение', 'Выполнить движение', 'Передать состояние'], errors: ['заклинивание', 'перегрев'] } },
]

export function definitionFor(component: Pick<Component, 'type' | 'name' | 'category'>) {
  return COMPONENT_CATALOG.find((entry) => entry.names.includes(component.type) || entry.names.includes(component.name))
}

export function componentFields(component: Component) { return definitionFor(component)?.fields || [] }