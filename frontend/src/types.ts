export type Direction = 'unidirectional' | 'bidirectional'
export type ConnectionKind = 'connection' | 'data_flow'
export type AlgorithmStepKind = 'action' | 'condition' | 'loop' | 'input' | 'output' | 'error'
export type Theme = 'light' | 'dark'
export type NavId =
  | 'projects'
  | 'architecture'
  | 'components'
  | 'protocols'
  | 'algorithms'
  | 'requirements'
  | 'documents'
  | 'export'
  | 'settings'

export interface Position {
  x: number
  y: number
}

export interface Documentation {
  description: string
  purpose: string
  responsibilities: string
  inputs: string
  outputs: string
  dependencies: string
  interfaces: string
  failure_modes: string
  notes: string
}

export interface ComponentTypeDef {
  id: string
  category: string
  name: string
  icon: string
  built_in: boolean
}

export interface Protocol {
  id: string
  name: string
  version: string
  transport: string
  port: string
  direction: Direction
  data_format: string
  encoding: string
  description: string
  message_structure: string
  timing: string
  timeout: string
  retry: string
  crc: string
  notes: string
  built_in: boolean
}

export interface HardwareComponent {
  id: string
  name: string
  manufacturer: string
  model: string
  cpu: string
  ram: string
  interfaces: string
  voltage: string
  protocols: string
  os: string
  datasheet: string
  notes: string
  category: string
  built_in: boolean
}

export interface AlgorithmStep {
  id: string
  kind: AlgorithmStepKind
  text: string
  condition: string
  on_true: string
  on_false: string
}

export interface StateTransition {
  id: string
  source: string
  target: string
  trigger: string
  guard: string
}

export interface AlgorithmNode {
  id: string
  kind: string
  label: string
  position: Position
}

export interface AlgorithmEdge {
  id: string
  source: string
  target: string
  label: string
}

export interface Algorithm {
  id: string
  component_id: string
  name: string
  description: string
  steps: AlgorithmStep[]
  inputs: string[]
  outputs: string[]
  errors: string[]
  conditions: string[]
  loops: string[]
  states: string[]
  transitions: StateTransition[]
  canvas_nodes: AlgorithmNode[]
  canvas_edges: AlgorithmEdge[]
}

export interface Connection {
  id: string
  architecture_id: string
  source: string
  target: string
  kind: ConnectionKind
  protocol_id: string | null
  protocol_name: string
  direction: Direction
  description: string
  data_format: string
  data_example: string
  frequency: string
  latency: string
  reliability: string
  notes: string
}

export interface Component {
  id: string
  architecture_id: string
  name: string
  type: string
  category: string
  description: string
  icon: string
  technology: string
  version: string
  status: string
  tags: string[]
  owner: string
  notes: string
  position: Position
  nested_architecture_id: string | null
  documentation: Documentation
  hardware_id: string | null
  protocol_id: string | null
  requirement_ids: string[]
  modules: string[]
  api: string
  state: string
  technologies: string[]
}

export interface Architecture {
  id: string
  project_id: string
  name: string
  parent_component_id: string | null
  description: string
}

export interface Requirement {
  id: string
  code: string
  text: string
  component_ids: string[]
  connection_ids: string[]
  notes: string
  priority: string
}

export interface Document {
  id: string
  title: string
  body: string
  component_id: string | null
}

export interface ArchitectureVersion {
  id: string
  label: string
  created_at: string
  snapshot: Record<string, unknown>
}

export interface UserSettings {
  theme: Theme
  snap_to_grid: boolean
  show_grid: boolean
  grid_size: number
  autosave: boolean
  language: string
}

export interface Project {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  current_version_label: string
  root_architecture_id: string
  architectures: Architecture[]
  components: Component[]
  connections: Connection[]
  protocols: Protocol[]
  hardware: HardwareComponent[]
  algorithms: Algorithm[]
  requirements: Requirement[]
  documents: Document[]
  custom_types: ComponentTypeDef[]
  versions: ArchitectureVersion[]
  settings: UserSettings
}

export interface ProjectSummary {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  current_version_label: string
  component_count: number
}

export interface LibraryPreset {
  name: string
  type: string
  category: string
  icon: string
  technology?: string
  hardware_id?: string
  protocol_id?: string
}

export interface LibraryResponse {
  types: ComponentTypeDef[]
  presets: LibraryPreset[]
}

export interface TemplateInfo {
  id: string
  name: string
  description: string
  kind: string
}

export interface GlobalSettings {
  theme: Theme
  snap_to_grid: boolean
  show_grid: boolean
  grid_size: number
  autosave: boolean
  language: string
  display_name: string
}

export const emptyDocumentation = (): Documentation => ({
  description: '',
  purpose: '',
  responsibilities: '',
  inputs: '',
  outputs: '',
  dependencies: '',
  interfaces: '',
  failure_modes: '',
  notes: '',
})
