import type { Component } from '../types'
import {
  CONTROL_OPTIONS,
  INTERFACE_OPTIONS,
  OS_OPTIONS,
  CONNECTION_PROTOCOLS,
  SENSOR_KINDS,
} from './protocols'

export const OTHER_VALUE = 'Другое'

export const POWER_OPTIONS = [
  '5 V DC',
  '12 V DC',
  '24 V DC',
  '48 V DC',
  '110 V AC',
  '220 V AC',
  '380 V AC',
  OTHER_VALUE,
]

export interface ComponentField {
  key: string
  label: string
  placeholder?: string
  options?: string[]
  allowOther?: boolean
  multiline?: boolean
  auto?: boolean
  section?: 'main' | 'tech' | 'io'
  visibleWhen?: { key: string; values: string[] }
}

export interface ComponentDefinition {
  id: string
  names: string[]
  fields: ComponentField[]
  algorithm: { purpose: string; inputs: string[]; outputs: string[]; steps: string[]; errors: string[] }
  inspector?: {
    connection?: boolean
    extra?: boolean
  }
}

const f = (...items: ComponentField[]) => items

const powerField: ComponentField = {
  key: 'power',
  label: 'Питание',
  options: POWER_OPTIONS,
  allowOther: true,
  section: 'io',
}

export const SIGNAL_TYPES = ['аналоговый', 'дискретный', 'ШИМ', 'DI', 'DO']
export const ANALOG_RANGES = ['0–10 В', '0–5 В', '±10 В', '4–20 мА', '0–20 мА']
export const DISCRETE_KINDS = ['DI', 'DO']

const signalFields: ComponentField[] = [
  { key: 'signal_type', label: 'Тип сигнала', options: SIGNAL_TYPES, allowOther: true, section: 'io' },
  {
    key: 'analog_range',
    label: 'Диапазон',
    options: ANALOG_RANGES,
    allowOther: true,
    section: 'io',
    visibleWhen: { key: 'signal_type', values: ['аналоговый'] },
  },
  {
    key: 'discrete_kind',
    label: 'Дискретный канал',
    options: DISCRETE_KINDS,
    section: 'io',
    visibleWhen: { key: 'signal_type', values: ['дискретный', 'DI', 'DO'] },
  },
  {
    key: 'pwm_freq',
    label: 'Частота ШИМ',
    section: 'io',
    visibleWhen: { key: 'signal_type', values: ['ШИМ', 'PWM'] },
  },
  {
    key: 'pwm_duty',
    label: 'Коэффициент заполнения',
    section: 'io',
    visibleWhen: { key: 'signal_type', values: ['ШИМ', 'PWM'] },
  },
]

const protoOpts = [...CONNECTION_PROTOCOLS]
const sensorOpts = [...SENSOR_KINDS]
const iface = INTERFACE_OPTIONS
const osOpts = OS_OPTIONS

const MCU_MODELS = [
  'Arduino Uno',
  'Arduino Nano',
  'Arduino Mega',
  'Arduino Leonardo',
  'ESP32',
  'ESP32-S3',
  'STM32',
  OTHER_VALUE,
]

const SBC_MODELS = [
  'Raspberry Pi 4',
  'Raspberry Pi 5',
  'Raspberry Pi Zero 2 W',
  'Jetson Nano',
  'Jetson Orin Nano',
  'Orange Pi',
  OTHER_VALUE,
]

const PLC_MAKERS = ['Siemens', 'Omron', 'Beckhoff', 'Schneider', 'WAGO', OTHER_VALUE]

const hwModel = (models?: string[]): ComponentField[] =>
  f(
    {
      key: 'model',
      label: 'Модель',
      options: models,
      allowOther: Boolean(models?.length),
      section: 'main',
    },
    { key: 'manufacturer', label: 'Производитель', auto: true, section: 'main' },
  )

export function inferManufacturer(name: string, type = '', model = ''): string {
  const text = `${model} ${name} ${type}`.toLowerCase()
  if (text.includes('arduino')) return 'Arduino'
  if (text.includes('esp32') || text.includes('espressif')) return 'Espressif'
  if (text.includes('stm32')) return 'STMicroelectronics'
  if (text.includes('raspberry')) return 'Raspberry Pi'
  if (text.includes('jetson')) return 'NVIDIA'
  if (text.includes('orange pi')) return 'Orange Pi'
  if (text.includes('siemens')) return 'Siemens'
  if (text.includes('omron')) return 'Omron'
  if (text.includes('beckhoff')) return 'Beckhoff'
  if (text.includes('nvidia')) return 'NVIDIA'
  if (text.includes('intel')) return 'Intel'
  if (text.includes('amd ')) return 'AMD'
  return ''
}

const sensorKind: ComponentField = {
  key: 'sensor_kind',
  label: 'Тип датчика',
  options: sensorOpts,
  allowOther: true,
  section: 'main',
}

const algoCtrl = {
  purpose: 'Считывает входы, исполняет управляющую программу и передаёт команды.',
  inputs: ['сигналы и сообщения интерфейсов'],
  outputs: ['команды исполнительным устройствам'],
  steps: ['Инициализировать интерфейсы', 'Считать входы', 'Выполнить логику', 'Выдать команды'],
  errors: ['нет питания', 'ошибка интерфейса'],
}
const algoSense = {
  purpose: 'Измеряет физическую величину и передаёт нормализованное значение.',
  inputs: ['физическое воздействие'],
  outputs: ['измерение и статус'],
  steps: ['Инициализировать датчик', 'Снять измерение', 'Проверить диапазон', 'Передать значение'],
  errors: ['нет ответа', 'значение вне диапазона'],
}
const algoAct = {
  purpose: 'Преобразует управляющий сигнал в механическое движение.',
  inputs: ['команда контроллера'],
  outputs: ['движение и обратная связь'],
  steps: ['Получить команду', 'Проверить ограничение', 'Выполнить движение', 'Передать состояние'],
  errors: ['заклинивание', 'перегрев'],
}
const algoProto = {
  purpose: 'Описывает обмен данными между компонентами архитектуры.',
  inputs: ['кадр или сообщение'],
  outputs: ['доставленное сообщение'],
  steps: ['Принять данные', 'Проверить формат', 'Маршрутизировать', 'Подтвердить доставку'],
  errors: ['таймаут', 'несовместимый формат'],
}
const algoSoft = {
  purpose: 'Выполняет прикладную обработку и отдаёт результат соседним компонентам.',
  inputs: ['запрос, сообщение или поток'],
  outputs: ['ответ, событие или ошибка'],
  steps: ['Принять вход', 'Проверить данные', 'Обработать', 'Отдать результат'],
  errors: ['неверный вход', 'ошибка зависимости'],
}

export const COMPONENT_CATALOG: ComponentDefinition[] = [
  {
    id: 'camera',
    names: ['Камера'],
    inspector: { connection: false, extra: false },
    fields: f(
      sensorKind,
      ...hwModel(),
      { key: 'resolution', label: 'Разрешение', section: 'tech' },
      { key: 'fps', label: 'FPS', section: 'tech' },
      { key: 'interface', label: 'Интерфейс', options: iface, allowOther: true, section: 'io' },
      powerField,
      ...signalFields,
    ),
    algorithm: { ...algoSense, purpose: 'Снимает изображение и отдаёт кадры подсистеме восприятия.' },
  },
  {
    id: 'lidar',
    names: ['LiDAR'],
    inspector: { connection: false, extra: false },
    fields: f(
      sensorKind,
      ...hwModel(),
      { key: 'range', label: 'Дальность', section: 'tech' },
      { key: 'interface', label: 'Интерфейс', options: iface, allowOther: true, section: 'io' },
      powerField,
      ...signalFields,
    ),
    algorithm: { ...algoSense, purpose: 'Строит облако точек и передаёт его в perception / SLAM.' },
  },
  {
    id: 'plc',
    names: ['ПЛК'],
    inspector: { connection: true, extra: false },
    fields: f(
      { key: 'manufacturer', label: 'Производитель', options: PLC_MAKERS, allowOther: true, section: 'main' },
      { key: 'model', label: 'Модель', section: 'main' },
      { key: 'io_count', label: 'Количество I/O', section: 'tech' },
      { key: 'protocols', label: 'Протоколы', options: protoOpts, allowOther: true, section: 'io' },
      powerField,
    ),
    algorithm: { ...algoCtrl, purpose: 'Исполняет цикловую логику управления и обменивается с полевыми устройствами.' },
  },
  {
    id: 'imu',
    names: ['IMU'],
    inspector: { connection: false, extra: false },
    fields: f(
      sensorKind,
      ...hwModel(),
      { key: 'interface', label: 'Интерфейс', options: iface, allowOther: true, section: 'io' },
      { key: 'sample_rate', label: 'Частота', section: 'tech' },
      powerField,
      ...signalFields,
    ),
    algorithm: algoSense,
  },
  {
    id: 'encoder',
    names: ['Энкодер'],
    inspector: { connection: false, extra: false },
    fields: f(
      sensorKind,
      ...hwModel(),
      { key: 'type', label: 'Тип', options: ['инкрементальный', 'абсолютный', OTHER_VALUE], allowOther: true, section: 'tech' },
      { key: 'interface', label: 'Интерфейс', options: iface, allowOther: true, section: 'io' },
      powerField,
      ...signalFields,
    ),
    algorithm: algoSense,
  },
  {
    id: 'range-sensor',
    names: ['Дальномер HC-SR04', 'Датчик расстояния VL53L0X', 'Датчик расстояния'],
    inspector: { connection: false, extra: false },
    fields: f(
      sensorKind,
      ...hwModel(),
      { key: 'range', label: 'Диапазон', section: 'tech' },
      { key: 'interface', label: 'Интерфейс', options: iface, allowOther: true, section: 'io' },
      powerField,
      ...signalFields,
    ),
    algorithm: algoSense,
  },
  {
    id: 'position-sensor',
    names: ['Датчик положения', 'Концевой выключатель', 'Датчик', 'GNSS'],
    inspector: { connection: false, extra: false },
    fields: f(
      sensorKind,
      ...hwModel(),
      { key: 'logic', label: 'Тип выхода', options: ['цифровой', 'аналоговый', 'шина', OTHER_VALUE], allowOther: true, section: 'tech' },
      { key: 'interface', label: 'Интерфейс', options: iface, allowOther: true, section: 'io' },
      powerField,
      ...signalFields,
    ),
    algorithm: algoSense,
  },
  {
    id: 'temp-sensor',
    names: ['Датчик температуры DS18B20'],
    inspector: { connection: false, extra: false },
    fields: f(
      sensorKind,
      ...hwModel(),
      { key: 'range', label: 'Диапазон', section: 'tech' },
      { key: 'interface', label: 'Интерфейс', options: iface, allowOther: true, section: 'io' },
      powerField,
      ...signalFields,
    ),
    algorithm: algoSense,
  },
  {
    id: 'gpu',
    names: ['GPU'],
    inspector: { connection: false, extra: false },
    fields: f(
      ...hwModel(),
      { key: 'memory', label: 'Память', section: 'tech' },
      { key: 'purpose', label: 'Назначение', section: 'tech' },
      powerField,
    ),
    algorithm: { ...algoSoft, purpose: 'Выполняет тяжёлые вычисления восприятия и моделей.' },
  },
  {
    id: 'ipc',
    names: ['IPC', 'Промышленный ПК', 'HMI'],
    inspector: { connection: true, extra: false },
    fields: f(
      ...hwModel(),
      { key: 'cpu', label: 'CPU', section: 'tech' },
      { key: 'ram', label: 'RAM', section: 'tech' },
      { key: 'os', label: 'ОС', options: osOpts, allowOther: true, section: 'tech' },
      powerField,
    ),
    algorithm: algoCtrl,
  },
  {
    id: 'sbc',
    names: ['SBC', 'Raspberry Pi', 'Jetson'],
    inspector: { connection: true, extra: false },
    fields: f(
      ...hwModel(SBC_MODELS),
      { key: 'os', label: 'ОС', options: osOpts, allowOther: true, section: 'tech' },
      { key: 'ram', label: 'RAM', section: 'tech' },
      powerField,
    ),
    algorithm: algoCtrl,
  },
  {
    id: 'mcu',
    names: ['MCU', 'STM32', 'ESP32', 'Arduino'],
    inspector: { connection: false, extra: false },
    fields: f(
      ...hwModel(MCU_MODELS),
      { key: 'interfaces', label: 'Интерфейсы', section: 'io' },
      powerField,
    ),
    algorithm: algoCtrl,
  },
  {
    id: 'motor-ctrl',
    names: ['Контроллер двигателя', 'Контроллер'],
    inspector: { connection: true, extra: false },
    fields: f(
      ...hwModel(),
      { key: 'control', label: 'Управляющий сигнал', options: CONTROL_OPTIONS, allowOther: true, section: 'io' },
      powerField,
    ),
    algorithm: {
      purpose: 'Преобразует команду в безопасное воздействие на привод.',
      inputs: ['целевая скорость или положение', 'обратная связь'],
      outputs: ['PWM, ток или CAN-команда'],
      steps: ['Проверить ограничения', 'Принять команду', 'Сопоставить с ОС', 'Выдать сигнал'],
      errors: ['перегрузка', 'потеря обратной связи'],
    },
  },
  {
    id: 'servo',
    names: ['Сервопривод'],
    inspector: { connection: false, extra: false },
    fields: f(
      ...hwModel(),
      { key: 'rated_current', label: 'Номинальный ток, А', section: 'tech' },
      { key: 'rated_torque', label: 'Номинальный момент, Н·м', section: 'tech' },
      { key: 'rated_voltage', label: 'Номинальное напряжение, В', section: 'tech' },
      { key: 'rpm', label: 'Скорость вращения, об/мин', section: 'tech' },
      { key: 'phases', label: 'Количество фаз', options: ['1', '2', '3'], section: 'tech' },
      { key: 'control', label: 'Управляющий сигнал', options: CONTROL_OPTIONS, allowOther: true, section: 'io' },
      powerField,
    ),
    algorithm: algoAct,
  },
  {
    id: 'motor',
    names: ['Двигатель', 'Привод', 'ДПТ', 'АД', 'СД', 'Шаговый', 'Шаговый двигатель'],
    inspector: { connection: false, extra: false },
    fields: f(
      ...hwModel(),
      { key: 'rated_current', label: 'Номинальный ток, А', section: 'tech' },
      { key: 'rated_torque', label: 'Номинальный момент, Н·м', section: 'tech' },
      { key: 'rated_voltage', label: 'Номинальное напряжение, В', section: 'tech' },
      { key: 'rpm', label: 'Скорость вращения, об/мин', section: 'tech' },
      { key: 'phases', label: 'Количество фаз', options: ['1', '2', '3'], section: 'tech' },
      { key: 'steps_per_rev', label: 'Шагов на оборот', section: 'tech' },
      { key: 'control', label: 'Управляющий сигнал', options: CONTROL_OPTIONS, allowOther: true, section: 'io' },
      powerField,
    ),
    algorithm: algoAct,
  },
  {
    id: 'manipulator',
    names: ['Манипулятор', 'Робот'],
    inspector: { connection: false, extra: false },
    fields: f(
      ...hwModel(),
      { key: 'dof', label: 'Степени свободы', section: 'tech' },
      { key: 'payload', label: 'Грузоподъёмность', section: 'tech' },
      powerField,
    ),
    algorithm: algoAct,
  },
  {
    id: 'network-box',
    names: ['Шлюз', 'Маршрутизатор', 'Коммутатор', 'Сетевое устройство', 'LoRa', 'BLE', 'LTE-модем', 'EtherNet/IP'],
    inspector: { connection: true, extra: false },
    fields: f(
      ...hwModel(),
      { key: 'ports', label: 'Порты', section: 'tech' },
      { key: 'protocols', label: 'Протоколы', options: protoOpts, allowOther: true, section: 'io' },
    ),
    algorithm: {
      purpose: 'Коммутирует или маршрутизирует трафик между сегментами.',
      inputs: ['кадры или пакеты'],
      outputs: ['доставленный трафик'],
      steps: ['Принять пакет', 'Определить маршрут', 'Проверить правила', 'Передать'],
      errors: ['нет маршрута', 'недоступен интерфейс'],
    },
  },
  {
    id: 'protocol',
    names: [
      'Ethernet', 'TCP', 'TCP/IP', 'UDP', 'HTTP', 'HTTPS', 'REST',
      'WebSocket', 'MQTT', 'OPC UA', 'Modbus TCP', 'Modbus RTU',
      'CAN', 'CANopen', 'EtherCAT', 'PROFINET', 'ROS 2', 'DDS',
      'Электрическое подключение',
    ],
    inspector: { connection: false, extra: false },
    fields: f(
      { key: 'transport', label: 'Транспорт', section: 'tech' },
      { key: 'typical_use', label: 'Применение', section: 'tech' },
    ),
    algorithm: algoProto,
  },
  {
    id: 'python',
    names: ['Python'],
    inspector: { connection: false, extra: false },
    fields: f(
      { key: 'version', label: 'Версия', section: 'tech' },
      { key: 'os', label: 'ОС', options: osOpts, allowOther: true, section: 'tech' },
      { key: 'purpose', label: 'Назначение', section: 'tech' },
    ),
    algorithm: algoSoft,
  },
  {
    id: 'lang',
    names: ['C++', 'C#', 'Java', 'Go', 'JavaScript', 'TypeScript', 'Rust'],
    fields: f(
      { key: 'standard', label: 'Стандарт / версия' },
      { key: 'runtime', label: 'Среда выполнения' },
      { key: 'os', label: 'ОС', options: osOpts },
      { key: 'purpose', label: 'Тип применения' },
    ),
    algorithm: algoSoft,
  },
  {
    id: 'ros2-sw',
    names: ['ROS 2 middleware'],
    fields: f(
      { key: 'distro', label: 'Дистрибутив' },
      { key: 'rmw', label: 'RMW / DDS' },
      { key: 'os', label: 'ОС', options: osOpts },
      { key: 'purpose', label: 'Назначение' },
    ),
    algorithm: algoSoft,
  },
  {
    id: 'os-sw',
    names: ['Linux', 'Windows'],
    fields: f(
      { key: 'version', label: 'Версия' },
      { key: 'arch', label: 'Архитектура' },
      { key: 'realtime', label: 'Реальное время' },
      { key: 'purpose', label: 'Назначение' },
    ),
    algorithm: algoSoft,
  },
  {
    id: 'docker',
    names: ['Docker'],
    fields: f(
      { key: 'image', label: 'Образ' },
      { key: 'runtime', label: 'Runtime' },
      { key: 'network', label: 'Сеть контейнеров' },
      { key: 'purpose', label: 'Назначение' },
    ),
    algorithm: algoSoft,
  },
  {
    id: 'fastapi',
    names: ['FastAPI', 'Python-бэкенд', 'Web-сервер'],
    fields: f(
      { key: 'os', label: 'ОС', options: osOpts },
      { key: 'port', label: 'Порт' },
      { key: 'framework', label: 'Framework' },
      { key: 'protocol', label: 'Протокол', options: protoOpts },
      { key: 'purpose', label: 'Назначение' },
    ),
    algorithm: algoSoft,
  },
  {
    id: 'react-fe',
    names: ['React-фронтенд'],
    fields: f(
      { key: 'framework', label: 'Framework' },
      { key: 'host', label: 'Hostname' },
      { key: 'protocol', label: 'Протокол', options: protoOpts },
      { key: 'purpose', label: 'Назначение' },
    ),
    algorithm: algoSoft,
  },
  {
    id: 'db',
    names: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Redis', 'Kafka', 'InfluxDB', 'TimescaleDB', 'ClickHouse', 'Protobuf'],
    fields: f(
      { key: 'dbms', label: 'СУБД / брокер' },
      { key: 'db_version', label: 'Версия' },
      { key: 'host', label: 'Hostname / IP' },
      { key: 'port', label: 'Порт' },
      { key: 'storage', label: 'Тип хранения' },
      { key: 'purpose', label: 'Назначение' },
    ),
    algorithm: {
      purpose: 'Хранит или передаёт данные по запросам клиентов.',
      inputs: ['запрос или сообщение'],
      outputs: ['результат или подтверждение'],
      steps: ['Принять соединение', 'Проверить права', 'Выполнить операцию', 'Вернуть результат'],
      errors: ['нет соединения', 'ошибка схемы или прав'],
    },
  },
  {
    id: 'soft-generic',
    names: ['Бэкенд', 'Фронтенд', 'Сервис', 'Приложение', 'Модуль', 'API', 'Библиотека', 'MQTT-брокер', 'OPC-сервер', 'Nginx', 'Node-RED', 'Grafana', 'ПО', 'Kubernetes', 'Prometheus', 'FreeRTOS', 'Zephyr', 'gRPC', 'NATS', 'OpenCV', 'Gazebo'],
    fields: f(
      { key: 'runtime', label: 'Среда выполнения' },
      { key: 'os', label: 'ОС', options: osOpts },
      { key: 'protocol', label: 'Протокол', options: protoOpts },
      { key: 'purpose', label: 'Назначение' },
    ),
    algorithm: algoSoft,
  },
  {
    id: 'mech',
    names: ['Механический узел', 'Колесо', 'Редуктор', 'Вал', 'Подшипник', 'Корпус', 'Кронштейн', 'Деталь'],
    fields: f(
      { key: 'material', label: 'Материал' },
      { key: 'dimensions', label: 'Габариты' },
      { key: 'weight', label: 'Масса' },
      { key: 'qty', label: 'Количество' },
    ),
    algorithm: algoAct,
  },
  {
    id: 'battery',
    names: ['Аккумулятор'],
    inspector: { connection: false, extra: false },
    fields: f(
      { key: 'chemistry', label: 'Тип', options: ['Li-ion', 'LiFePO4', 'свинцово-кислотный', OTHER_VALUE], allowOther: true, section: 'tech' },
      { key: 'capacity', label: 'Ёмкость', section: 'tech' },
      powerField,
    ),
    algorithm: algoAct,
  },
  {
    id: 'divider',
    names: ['Делитель напряжения'],
    inspector: { connection: false, extra: false },
    fields: f(
      { key: 'r1', label: 'R1', section: 'tech' },
      { key: 'r2', label: 'R2', section: 'tech' },
      { key: 'vout', label: 'Uвых расчётное', section: 'tech' },
      powerField,
    ),
    algorithm: algoAct,
  },
  {
    id: 'psu',
    names: ['Блок питания'],
    inspector: { connection: false, extra: false },
    fields: f(
      { key: 'output', label: 'Выход', section: 'tech' },
      { key: 'power_w', label: 'Мощность', section: 'tech' },
      powerField,
    ),
    algorithm: algoAct,
  },
  {
    id: 'relay',
    names: ['Реле'],
    inspector: { connection: false, extra: false },
    fields: f(
      { key: 'coil_voltage', label: 'Напряжение катушки', section: 'tech' },
      { key: 'contacts', label: 'Контакты', section: 'tech' },
      powerField,
    ),
    algorithm: algoAct,
  },
  {
    id: 'fuse',
    names: ['Предохранитель', 'Автоматический выключатель'],
    inspector: { connection: false, extra: false },
    fields: f(
      { key: 'current', label: 'Номинальный ток', section: 'tech' },
      { key: 'curve', label: 'Характеристика', options: ['B', 'C', 'D', 'gG', OTHER_VALUE], allowOther: true, section: 'tech' },
    ),
    algorithm: algoAct,
  },
  {
    id: 'terminal-block',
    names: ['Клеммник'],
    inspector: { connection: false, extra: false },
    fields: f(
      { key: 'terminal_inputs', label: 'Входы', section: 'io' },
      { key: 'terminal_outputs', label: 'Выходы', section: 'io' },
      { key: 'rating', label: 'Номинал', section: 'tech' },
    ),
    algorithm: algoAct,
  },
  {
    id: 'resistor',
    names: ['Резистор'],
    fields: f({ key: 'resistance', label: 'Сопротивление', section: 'tech' }, { key: 'power_w', label: 'Мощность', section: 'tech' }),
    algorithm: algoAct,
  },
  {
    id: 'capacitor',
    names: ['Конденсатор'],
    fields: f({ key: 'capacitance', label: 'Ёмкость', section: 'tech' }, { key: 'voltage', label: 'Напряжение', section: 'tech' }),
    algorithm: algoAct,
  },
  {
    id: 'inductor',
    names: ['Катушка индуктивности'],
    fields: f({ key: 'inductance', label: 'Индуктивность', section: 'tech' }),
    algorithm: algoAct,
  },
  {
    id: 'diode',
    names: ['Диод', 'Светодиод'],
    fields: f(
      { key: 'diode_type', label: 'Тип', options: ['выпрямительный', 'Шоттки', 'стабилитрон', 'светодиод', OTHER_VALUE], allowOther: true, section: 'tech' },
      { key: 'vf', label: 'Прямое напряжение', section: 'tech' },
    ),
    algorithm: algoAct,
  },
  {
    id: 'transistor',
    names: ['Транзистор'],
    fields: f(
      { key: 'tr_type', label: 'Тип', options: ['NPN', 'PNP', 'N-MOSFET', 'P-MOSFET', OTHER_VALUE], allowOther: true, section: 'tech' },
      { key: 'pinout', label: 'Распиновка', section: 'tech' },
    ),
    algorithm: algoAct,
  },
  {
    id: 'transformer',
    names: ['Трансформатор'],
    fields: f(
      { key: 'windings', label: 'Обмотки', section: 'tech' },
      { key: 'ratio', label: 'Коэффициент', section: 'tech' },
      powerField,
    ),
    algorithm: algoAct,
  },
  {
    id: 'lamp',
    names: ['Лампа'],
    fields: f({ key: 'lamp_power', label: 'Мощность', section: 'tech' }, { key: 'lamp_voltage', label: 'Напряжение', section: 'tech' }),
    algorithm: algoAct,
  },
  {
    id: 'button',
    names: ['Кнопка', 'Переключатель'],
    fields: f({ key: 'contacts', label: 'Контакты', options: ['NO', 'NC', 'перекидной', OTHER_VALUE], allowOther: true, section: 'tech' }),
    algorithm: algoAct,
  },
  {
    id: 'opamp',
    names: ['Операционный усилитель'],
    fields: f({ key: 'supply', label: 'Питание', section: 'tech' }, { key: 'gain', label: 'Усиление', section: 'tech' }),
    algorithm: algoAct,
  },
  {
    id: 'connector',
    names: ['Электрический разъём'],
    fields: f({ key: 'pins', label: 'Контакты', section: 'tech' }, { key: 'gender', label: 'Тип', options: ['вилка', 'розетка', OTHER_VALUE], allowOther: true, section: 'tech' }),
    algorithm: algoAct,
  },
]

export function definitionFor(component: Pick<Component, 'type' | 'name' | 'category'>) {
  const byName = COMPONENT_CATALOG.find((entry) => entry.names.includes(component.name))
  if (byName) return byName
  const byType = COMPONENT_CATALOG.find((entry) => entry.names.includes(component.type))
  if (byType) return byType
  if (component.category === 'SOFTWARE') return COMPONENT_CATALOG.find((entry) => entry.id === 'soft-generic')
  if (component.category === 'DATA') return COMPONENT_CATALOG.find((entry) => entry.id === 'db')
  if (component.category === 'NETWORK') return COMPONENT_CATALOG.find((entry) => entry.id === 'network-box')
  if (component.category === 'ELECTRICAL') return COMPONENT_CATALOG.find((entry) => entry.id === 'psu')
  if (component.category === 'MECHANICS') return COMPONENT_CATALOG.find((entry) => entry.id === 'mech')
  if (component.category === 'HARDWARE') return COMPONENT_CATALOG.find((entry) => entry.id === 'mcu')
  return undefined
}

export function componentFields(component: Component) {
  return definitionFor(component)?.fields || []
}

export function inspectorChrome(component: Pick<Component, 'type' | 'name' | 'category'>) {
  const definition = definitionFor(component)
  if (definition?.inspector) {
    return {
      connection: Boolean(definition.inspector.connection),
      extra: Boolean(definition.inspector.extra),
    }
  }
  if (['SOFTWARE', 'NETWORK', 'DATA'].includes(component.category)) {
    return { connection: true, extra: false }
  }
  return { connection: false, extra: false }
}

export function groupedComponentFields(component: Component) {
  const fields = componentFields(component)
  const order: { id: NonNullable<ComponentField['section']>; title: string }[] = [
    { id: 'main', title: 'Основное' },
    { id: 'tech', title: 'Характеристики' },
    { id: 'io', title: 'Подключение' },
  ]
  const extra = component.extra_fields || {}
  return order
    .map((group) => ({
      ...group,
      fields: fields.filter((field) => {
        if ((field.section || 'tech') !== group.id) return false
        if (!field.visibleWhen) return true
        return field.visibleWhen.values.includes(extra[field.visibleWhen.key] || '')
      }),
    }))
    .filter((group) => group.fields.length)
}

const PROGRAMMABLE_IDS = new Set([
  'plc',
  'ipc',
  'sbc',
  'mcu',
  'motor-ctrl',
  'gpu',
  'python',
  'lang',
  'ros2-sw',
  'fastapi',
  'react-fe',
  'soft-generic',
])

export function componentSupportsAlgorithm(component: Pick<Component, 'type' | 'name' | 'category'>) {
  if (component.category === 'PROTOCOL' || component.category === 'ELECTRICAL') return false
  if (component.category === 'SOFTWARE' || component.category === 'DATA') return true
  const definition = definitionFor(component)
  if (definition) return PROGRAMMABLE_IDS.has(definition.id) || definition.id === 'docker' || definition.id === 'os-sw'
  return ['MCU', 'SBC', 'ПЛК', 'IPC', 'CPU', 'GPU', 'Контроллер двигателя', 'Контроллер', 'HMI'].includes(component.type)
}
