import { create } from 'zustand'
import { api } from '../lib/api'
import { uid } from '../lib/ids'
import type {
  Algorithm,
  Component,
  Connection,
  ConnectionKind,
  LibraryPreset,
  Project,
  Requirement,
} from '../types'
import { emptyMechanical, emptyTable, withComponentDefaults } from '../model/defaults'

const MAX_HISTORY = 80
let saveTimer: ReturnType<typeof setTimeout> | null = null

function clone<T>(v: T): T {
  return structuredClone(v)
}

function nextReqCode(project: Project): string {
  const nums = project.requirements
    .map((r) => Number((r.code.match(/(\d+)/) || [])[1] || 0))
    .filter((n) => !Number.isNaN(n))
  const n = (nums.length ? Math.max(...nums) : 0) + 1
  return `REQ-${String(n).padStart(3, '0')}`
}

export interface ProjectState {
  project: Project | null
  architectureId: string | null
  selectedIds: string[]
  selectedConnectionId: string | null
  past: Project[]
  future: Project[]
  dirty: boolean
  saving: boolean
  lastSavedAt: string | null
  error: string | null
  clipboard: Component[]
  load: (id: string) => Promise<void>
  setProject: (p: Project, history?: boolean) => void
  mutate: (fn: (p: Project) => void, opts?: { history?: boolean }) => void
  undo: () => void
  redo: () => void
  saveNow: () => Promise<void>
  scheduleSave: () => void
  setArchitecture: (id: string) => void
  select: (ids: string[], connectionId?: string | null) => void
  addComponent: (partial: Partial<Component> & { name: string }, position?: { x: number; y: number }) => string
  addFromPreset: (preset: LibraryPreset, position: { x: number; y: number }) => string
  updateComponent: (id: string, patch: Partial<Component>) => void
  deleteSelected: () => void
  connect: (source: string, target: string, kind?: ConnectionKind) => string
  updateConnection: (id: string, patch: Partial<Connection>) => void
  enterComponent: (componentId: string) => void
  goToArchitecture: (id: string) => void
  copy: () => void
  paste: () => void
  ensureAlgorithm: (componentId: string) => Algorithm
  updateAlgorithm: (id: string, patch: Partial<Algorithm>) => void
  addRequirement: (text: string) => Requirement
  updateRequirement: (id: string, patch: Partial<Requirement>) => void
  deleteRequirement: (id: string) => void
  ensureKindArchitecture: (kind: string, name: string) => string
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  architectureId: null,
  selectedIds: [],
  selectedConnectionId: null,
  past: [],
  future: [],
  dirty: false,
  saving: false,
  lastSavedAt: null,
  error: null,
  clipboard: [],

  load: async (id) => {
    const project = await api.project(id)
    set({
      project,
      architectureId: project.root_architecture_id,
      selectedIds: [],
      selectedConnectionId: null,
      past: [],
      future: [],
      dirty: false,
      error: null,
    })
  },

  setProject: (p, history = false) => {
    if (history && get().project) {
      const past = [...get().past, clone(get().project!)].slice(-MAX_HISTORY)
      set({ project: p, past, future: [], dirty: true })
    } else {
      set({ project: p, dirty: true })
    }
    get().scheduleSave()
  },

  mutate: (fn, opts) => {
    const current = get().project
    if (!current) return
    const history = opts?.history !== false
    if (history) {
      set({ past: [...get().past, clone(current)].slice(-MAX_HISTORY), future: [] })
    }
    const next = clone(current)
    fn(next)
    set({ project: next, dirty: true })
    get().scheduleSave()
  },

  undo: () => {
    const { past, project, future } = get()
    if (!project || past.length === 0) return
    const prev = past[past.length - 1]
    set({
      project: prev,
      past: past.slice(0, -1),
      future: [...future, project],
      dirty: true,
      architectureId: prev.architectures.some((a) => a.id === get().architectureId)
        ? get().architectureId
        : prev.root_architecture_id,
    })
    get().scheduleSave()
  },

  redo: () => {
    const { future, project, past } = get()
    if (!project || future.length === 0) return
    const nxt = future[future.length - 1]
    set({
      project: nxt,
      future: future.slice(0, -1),
      past: [...past, project],
      dirty: true,
    })
    get().scheduleSave()
  },

  saveNow: async () => {
    const project = get().project
    if (!project) return
    set({ saving: true, error: null })
    try {
      const saved = await api.saveProject(project)
      set({
        project: { ...project, updated_at: saved.updated_at, versions: saved.versions, current_version_label: saved.current_version_label },
        dirty: false,
        saving: false,
        lastSavedAt: saved.updated_at,
      })
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : 'Не удалось сохранить' })
    }
  },

  scheduleSave: () => {
    const project = get().project
    if (!project?.settings.autosave) return
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      get().saveNow()
    }, 700)
  },

  setArchitecture: (id) => set({ architectureId: id, selectedIds: [], selectedConnectionId: null }),

  select: (ids, connectionId = null) => set({ selectedIds: ids, selectedConnectionId: connectionId }),

  addComponent: (partial, position) => {
    const id = uid()
    get().mutate((p) => {
      const architectureId = get().architectureId || p.root_architecture_id
      p.components.push(
        withComponentDefaults({
          id,
          architecture_id: architectureId,
          name: partial.name,
          type: partial.type,
          category: partial.category,
          description: partial.description,
          icon: partial.icon,
          technology: partial.technology,
          version: partial.version,
          status: partial.status,
          tags: partial.tags,
          owner: partial.owner,
          notes: partial.notes,
          position: position || partial.position || { x: 120, y: 120 },
          hardware_id: partial.hardware_id || null,
          protocol_id: partial.protocol_id || null,
          technologies: partial.technology ? [partial.technology] : [],
          entity_kind: partial.entity_kind || (partial.type === 'Таблица' ? 'table' : 'component'),
          table:
            partial.entity_kind === 'table' || partial.type === 'Таблица'
              ? partial.table || {
                  ...emptyTable(),
                  columns: [
                    {
                      id: uid(),
                      name: 'id',
                      type: 'BIGINT',
                      nullable: false,
                      default: '',
                      primary_key: true,
                      unique: false,
                      foreign_key: '',
                      description: '',
                    },
                  ],
                }
              : partial.table || null,
          mechanical: partial.mechanical || emptyMechanical(),
        }),
      )
    })
    set({ selectedIds: [id], selectedConnectionId: null })
    return id
  },

  addFromPreset: (preset, position) =>
    get().addComponent(
      {
        name: preset.name,
        type: preset.type,
        category: preset.category,
        icon: preset.icon,
        technology: preset.technology || '',
        hardware_id: preset.hardware_id || null,
        protocol_id: preset.protocol_id || null,
        entity_kind: preset.entity_kind,
      },
      position,
    ),

  updateComponent: (id, patch) => {
    get().mutate((p) => {
      const c = p.components.find((x) => x.id === id)
      if (!c) return
      Object.assign(c, patch)
      if (patch.documentation) c.documentation = { ...c.documentation, ...patch.documentation }
    }, { history: false })
  },

  deleteSelected: () => {
    const { selectedIds, selectedConnectionId, architectureId } = get()
    get().mutate((p) => {
      if (selectedConnectionId) {
        p.connections = p.connections.filter((c) => c.id !== selectedConnectionId)
      }
      if (selectedIds.length) {
        const drop = new Set(selectedIds)
        p.components = p.components.filter((c) => !drop.has(c.id) || c.architecture_id !== architectureId)
        p.connections = p.connections.filter((c) => !drop.has(c.source) && !drop.has(c.target))
      }
    })
    set({ selectedIds: [], selectedConnectionId: null })
  },

  connect: (source, target, kind = 'connection') => {
    const id = uid()
    get().mutate((p) => {
      const src = p.components.find((c) => c.id === source)
      const tgt = p.components.find((c) => c.id === target)
      const isTable = src?.entity_kind === 'table' || tgt?.entity_kind === 'table'
      let targetColumn = isTable ? 'id' : ''
      if (isTable && src && tgt) {
        targetColumn = `${src.name.toLowerCase().replace(/\s+/g, '_')}_id`
        const table = tgt.table || emptyTable()
        if (!table.columns.some((c) => c.name === targetColumn)) {
          table.columns.push({
            id: uid(),
            name: targetColumn,
            type: 'BIGINT',
            nullable: false,
            default: '',
            primary_key: false,
            unique: false,
            foreign_key: `${src.name}.id`,
            description: `FK → ${src.name}`,
          })
          tgt.table = table
          tgt.entity_kind = 'table'
        }
      }
      p.connections.push({
        id,
        architecture_id: get().architectureId || p.root_architecture_id,
        source,
        target,
        kind,
        protocol_id: null,
        protocol_name: kind === 'data_flow' ? 'Данные' : '',
        direction: 'unidirectional',
        description: '',
        data_format: '',
        data_example: '',
        frequency: '',
        latency: '',
        reliability: '',
        notes: '',
        color: '',
        cardinality: isTable ? 'one_to_many' : '',
        source_column: isTable ? 'id' : '',
        target_column: targetColumn,
      })
    })
    set({ selectedConnectionId: id, selectedIds: [] })
    return id
  },

  updateConnection: (id, patch) => {
    get().mutate((p) => {
      const c = p.connections.find((x) => x.id === id)
      if (c) Object.assign(c, patch)
    }, { history: false })
  },

  enterComponent: (componentId) => {
    const project = get().project
    if (!project) return
    let nestedId = project.components.find((c) => c.id === componentId)?.nested_architecture_id
    if (!nestedId) {
      nestedId = uid()
      get().mutate((p) => {
        const c = p.components.find((x) => x.id === componentId)
        if (!c) return
        p.architectures.push({
          id: nestedId!,
          project_id: p.id,
          name: c.name,
          parent_component_id: c.id,
          description: `Внутренняя архитектура: ${c.name}`,
          kind: c.category === 'MECHANICS' ? 'mechanical' : c.entity_kind === 'table' ? 'database' : 'system',
        })
        c.nested_architecture_id = nestedId!
      })
    }
    set({ architectureId: nestedId, selectedIds: [], selectedConnectionId: null })
  },

  goToArchitecture: (id) => set({ architectureId: id, selectedIds: [], selectedConnectionId: null }),

  copy: () => {
    const { project, selectedIds, architectureId } = get()
    if (!project) return
    const nodes = project.components.filter((c) => selectedIds.includes(c.id) && c.architecture_id === architectureId)
    set({ clipboard: clone(nodes) })
  },

  paste: () => {
    const { clipboard, architectureId } = get()
    if (!clipboard.length) return
    const ids: string[] = []
    get().mutate((p) => {
      for (const n of clipboard) {
        const id = uid()
        ids.push(id)
        p.components.push({
          ...clone(n),
          id,
          architecture_id: architectureId || p.root_architecture_id,
          nested_architecture_id: null,
          position: { x: n.position.x + 40, y: n.position.y + 40 },
        })
      }
    })
    set({ selectedIds: ids, selectedConnectionId: null })
  },

  ensureAlgorithm: (componentId) => {
    const project = get().project!
    let alg = project.algorithms.find((a) => a.component_id === componentId)
    if (alg) return alg
    const component = project.components.find((c) => c.id === componentId)
    const created: Algorithm = {
      id: uid(),
      component_id: componentId,
      name: `${component?.name || 'Компонент'}: алгоритм`,
      description: '',
      steps: [],
      inputs: [],
      outputs: [],
      errors: [],
      conditions: [],
      loops: [],
      states: ['IDLE', 'RUNNING', 'ERROR'],
      transitions: [],
      canvas_nodes: [
        { id: uid(), kind: 'start', label: 'СТАРТ', position: { x: 80, y: 40 } },
        { id: uid(), kind: 'action', label: 'Обработка', position: { x: 80, y: 160 } },
        { id: uid(), kind: 'end', label: 'КОНЕЦ', position: { x: 80, y: 280 } },
      ],
      canvas_edges: [],
    }
    created.canvas_edges = [
      { id: uid(), source: created.canvas_nodes[0].id, target: created.canvas_nodes[1].id, label: '' },
      { id: uid(), source: created.canvas_nodes[1].id, target: created.canvas_nodes[2].id, label: '' },
    ]
    get().mutate((p) => {
      p.algorithms.push(created)
    })
    return created
  },

  updateAlgorithm: (id, patch) => {
    get().mutate((p) => {
      const a = p.algorithms.find((x) => x.id === id)
      if (a) Object.assign(a, patch)
    })
  },

  addRequirement: (text) => {
    const req: Requirement = {
      id: uid(),
      code: nextReqCode(get().project!),
      text,
      component_ids: [...get().selectedIds],
      connection_ids: get().selectedConnectionId ? [get().selectedConnectionId as string] : [],
      notes: '',
      priority: 'should',
    }
    get().mutate((p) => {
      p.requirements.push(req)
    })
    return req
  },

  updateRequirement: (id, patch) => {
    get().mutate((p) => {
      const r = p.requirements.find((x) => x.id === id)
      if (r) Object.assign(r, patch)
    })
  },

  deleteRequirement: (id) => {
    get().mutate((p) => {
      p.requirements = p.requirements.filter((r) => r.id !== id)
      for (const c of p.components) c.requirement_ids = c.requirement_ids.filter((x) => x !== id)
    })
  },

  ensureKindArchitecture: (kind, name) => {
    const project = get().project
    if (!project) return ''
    const existing = project.architectures.find((a) => a.kind === kind && !a.parent_component_id)
    if (existing) {
      set({ architectureId: existing.id, selectedIds: [], selectedConnectionId: null })
      return existing.id
    }
    const id = uid()
    get().mutate((p) => {
      p.architectures.push({
        id,
        project_id: p.id,
        name,
        parent_component_id: null,
        description: name,
        kind,
      })
      if (kind === 'database' && !p.databases.length) {
        p.databases.push({
          id: uid(),
          name: 'app',
          dialect: 'postgresql',
          description: '',
          schema_name: 'public',
        })
      }
    })
    set({ architectureId: id, selectedIds: [], selectedConnectionId: null })
    return id
  },
}))
