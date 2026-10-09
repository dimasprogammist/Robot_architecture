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
  | 'learning'
  | 'tutorial'
  | 'exercises'
  | 'mechanics'
  | 'database'
  | 'power'
  | 'bom'
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
  color: string
  stroke_width?: number
}

export interface PrintSettings {
  nozzle_size: string
  layer_height: string
  material: string
  infill: string
  supports: string
  print_orientation: string
  printer: string
  notes: string
}

export interface MechanicalData {
  material: string
  dimensions: string
  weight: string
  quantity: number
  unit: string
  manufacturer: string
  part_number: string
  notes: string
  extra_fields: Record<string, string>
  print: PrintSettings
}

export interface DocumentationItem {
  id: string
  title: string
  kind: string
  url: string
  body: string
  description: string
  component_id: string | null
  protocol_id: string | null
  starred?: boolean
}

export interface AttachedFile {
  id: string
  filename: string
  kind: string
  mime: string
  size: number
  version: string
  description: string
  uploaded_at: string
  component_id: string | null
}

export interface TableColumn {
  id: string
  name: string
  type: string
  nullable: boolean
  default: string
  primary_key: boolean
  unique: boolean
  foreign_key: string
  description: string
}

export interface TableIndex {
  id: string
  name: string
  columns: string[]
  unique: boolean
}

export interface TableDefinition {
  schema_name: string
  description: string
  columns: TableColumn[]
  indexes: TableIndex[]
  constraints: string[]
}

export interface DatabaseInfo {
  id: string
  name: string
  dialect: string
  description: string
  schema_name: string
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
  program_name: string
  language: string
  purpose: string
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
  color: string
  cardinality: string
  source_column: string
  target_column: string
  source_handle?: string
  target_handle?: string
  extra_fields?: Record<string, string>
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
  entity_kind: string
  mechanical: MechanicalData
  table: TableDefinition | null
  docs: DocumentationItem[]
  files: AttachedFile[]
  extra_fields: Record<string, string>
  color: string
  library_preset_id?: string | null
  width?: number
  height?: number
}

export interface Architecture {
  id: string
  project_id: string
  name: string
  parent_component_id: string | null
  description: string
  kind: string
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
  protocol_id: string | null
  kind: string
  url: string
  description: string
  starred?: boolean
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
  share_code?: string
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
  library_presets: LibraryPreset[]
  versions: ArchitectureVersion[]
  settings: UserSettings
  databases: DatabaseInfo[]
  mechanics?: MechanicsModel
}

export type MechKind =
  | 'base'
  | 'link'
  | 'wheel'
  | 'caster'
  | 'motor'
  | 'gearbox'
  | 'gripper'
  | 'chassis'

export type MechJointKind = 'fixed' | 'revolute' | 'prismatic'

export interface MechAnchor {
  id: string
  name: string
  x: number
  y: number
}

export interface MechElement {
  id: string
  kind: MechKind
  name: string
  x: number
  y: number
  theta: number
  mass: number | null
  catalog_component_id: string | null
  params: Record<string, number | string | boolean | null>
  anchors: MechAnchor[]
}

export interface MechJoint {
  id: string
  kind: MechJointKind
  parent_id: string
  child_id: string
  parent_anchor: string
  child_anchor: string
  q: number
  q_min: number | null
  q_max: number | null
  driven: boolean
  motor_id: string | null
}

export interface MechanicsModel {
  id: string
  name: string
  elements: MechElement[]
  joints: MechJoint[]
  ee_id: string | null
  elbow: 'up' | 'down'
  trail: { x: number; y: number }[]
  trail_on: boolean
  load_mass: number | null
  load_lever: number | null
  show_axes: boolean
  show_dims: boolean
}

export interface ProjectSummary {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  current_version_label: string
  share_code?: string
  role?: string
  component_count: number
}

export interface LibraryPreset {
  id?: string
  name: string
  type: string
  category: string
  icon: string
  technology?: string
  hardware_id?: string
  protocol_id?: string
  entity_kind?: string
  color?: string
  built_in?: boolean
  stripe_width?: number
}

export interface LibraryResponse {
  types: ComponentTypeDef[]
  presets: LibraryPreset[]
  protocol_colors?: Record<string, string>
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
  ui_density: 'comfortable' | 'compact'
  reduce_motion: boolean
  show_minimap: boolean
  show_edge_labels: boolean
  confirm_delete: boolean
  confirm_delete_project: boolean
  loose_connections: boolean
  default_template_id: string
  library_open: boolean
  lesson_font_scale: number
  auto_mark_lesson: boolean
  show_course_progress: boolean
}

export const DEFAULT_SETTINGS: GlobalSettings = {
  theme: 'light',
  snap_to_grid: true,
  show_grid: true,
  grid_size: 20,
  autosave: true,
  language: 'ru',
  display_name: 'Архитектор',
  ui_density: 'comfortable',
  reduce_motion: false,
  show_minimap: true,
  show_edge_labels: true,
  confirm_delete: true,
  confirm_delete_project: true,
  loose_connections: true,
  default_template_id: 'robot',
  library_open: false,
  lesson_font_scale: 1,
  auto_mark_lesson: true,
  show_course_progress: true,
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
