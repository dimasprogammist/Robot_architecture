import type { Component, MechanicalData, PrintSettings, TableDefinition } from '../types'
import { emptyDocumentation } from '../types'

export const PROTOCOL_COLORS: Record<string, string> = {
  HTTP: '#5d6f7c',
  HTTPS: '#4f6474',
  TCP: '#6a6e62',
  UDP: '#7a6f5a',
  MQTT: '#5d6a4e',
  WebSocket: '#5a6278',
  'Modbus TCP': '#6b5c4a',
  'Modbus RTU': '#7a5e4e',
  CAN: '#6a4e4e',
  UART: '#4e6470',
  Serial: '#4e6470',
  SPI: '#5a5e6e',
  I2C: '#4f6a66',
  'I²C': '#4f6a66',
  USB: '#5c5870',
  Ethernet: '#4a6270',
  'Wi-Fi': '#4e5f78',
  'OPC UA': '#5c5872',
  'OPC DA': '#6a5c72',
}

export function protocolColor(name: string, override?: string, theme: 'light' | 'dark' = 'light') {
  const base = override || PROTOCOL_COLORS[name] || Object.entries(PROTOCOL_COLORS).find(([k]) => k.toLowerCase() === name.toLowerCase())?.[1] || '#6e6b63'
  if (theme === 'dark') return base
  return base
}

export function emptyPrint(): PrintSettings {
  return { nozzle_size: '', layer_height: '', material: '', infill: '', supports: '', print_orientation: '', printer: '', notes: '' }
}

export function emptyMechanical(): MechanicalData {
  return {
    material: '',
    dimensions: '',
    weight: '',
    quantity: 1,
    unit: 'шт',
    manufacturer: '',
    part_number: '',
    notes: '',
    extra_fields: {},
    print: emptyPrint(),
  }
}

export function emptyTable(): TableDefinition {
  return { schema_name: 'public', description: '', columns: [], indexes: [], constraints: [] }
}

export function withComponentDefaults(partial: Partial<Component> & { name: string; architecture_id: string; id: string }): Component {
  const cleaned = Object.fromEntries(Object.entries(partial).filter(([, v]) => v !== undefined)) as Partial<Component>
  return {
    type: 'Свой компонент',
    category: 'OTHER',
    description: '',
    icon: 'box',
    technology: '',
    version: '',
    status: 'planned',
    tags: [],
    owner: '',
    notes: '',
    position: { x: 120, y: 120 },
    nested_architecture_id: null,
    documentation: emptyDocumentation(),
    hardware_id: null,
    protocol_id: null,
    requirement_ids: [],
    modules: [],
    api: '',
    state: '',
    technologies: [],
    entity_kind: 'component',
    mechanical: emptyMechanical(),
    table: null,
    docs: [],
    files: [],
    extra_fields: {},
    ...cleaned,
  } as Component
}
