export const CONNECTION_PROTOCOLS = [
  'Ethernet',
  'TCP/IP',
  'UDP',
  'OPC UA',
  'Modbus TCP',
  'Modbus RTU',
  'CAN',
  'CANopen',
  'EtherCAT',
  'PROFINET',
  'MQTT',
  'ROS 2',
  'DDS',
  'WebSocket',
  'HTTP / REST',
] as const

export const SENSOR_KINDS = [
  'Датчик температуры',
  'Датчик давления',
  'Датчик расстояния',
  'Датчик положения',
  'Датчик освещенности',
  'Датчик влажности',
  'Датчик ускорения',
  'Датчик угловой скорости',
  'IMU',
  'Энкодер',
  'LiDAR',
  'Камера',
  'Другое',
] as const

export const INTERFACE_OPTIONS = [
  'Ethernet',
  'USB',
  'UART',
  'I²C',
  'SPI',
  'CAN',
  'GPIO',
  'CSI',
  'GigE',
  'Wi-Fi',
]

export const OS_OPTIONS = ['Linux', 'Windows', 'FreeRTOS', 'bare-metal', 'без ОС']

export const CONTROL_OPTIONS = ['PWM', 'CAN', 'шаг/направление', 'аналог', 'RS-485']

export const RELIABILITY_OPTIONS = [
  'Без гарантии',
  'Минимум одна доставка',
  'Не больше одной доставки',
  'Ровно одна доставка',
  'С подтверждением',
  'С контрольной суммой',
  'Критичный канал',
] as const

export const PROGRAM_LANGUAGES = [
  'C',
  'C++',
  'Python',
  'C#',
  'IEC 61131-3',
  'Structured Text',
  'Rust',
  'Go',
]

export function protocolSelectOptions(projectNames: string[]) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const name of [...CONNECTION_PROTOCOLS, ...projectNames]) {
    if (!name || seen.has(name)) continue
    seen.add(name)
    out.push(name)
  }
  return out
}

export function inferSensorKind(name: string) {
  const text = name.toLowerCase()
  if (text.includes('камер')) return 'Камера'
  if (text.includes('lidar')) return 'LiDAR'
  if (text.includes('imu')) return 'IMU'
  if (text.includes('энкодер')) return 'Энкодер'
  if (text.includes('температур')) return 'Датчик температуры'
  if (text.includes('давлени')) return 'Датчик давления'
  if (text.includes('расстоян') || text.includes('дальномер')) return 'Датчик расстояния'
  if (text.includes('положен') || text.includes('концев')) return 'Датчик положения'
  if (text.includes('влажн')) return 'Датчик влажности'
  if (text.includes('освещ')) return 'Датчик освещенности'
  return ''
}
