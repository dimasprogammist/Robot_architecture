import type {
  GlobalSettings,
  LibraryResponse,
  Project,
  ProjectSummary,
  TemplateInfo,
} from '../types'

const json = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json() as Promise<T>
}

export interface AiExportBody {
  task?: string
  rules?: string[]
  scope?: string
  component_ids?: string[]
  architecture_id?: string | null
  include_descriptions?: boolean
  include_algorithms?: boolean
  include_requirements?: boolean
  include_notes?: boolean
  include_doc_meta?: boolean
  include_full_docs?: boolean
  include_sql?: boolean
}

export interface LearningArticleSummary {
  id: string
  title: string
  description: string
  section?: string
  order?: number
}

export interface LearningCategory {
  id: string
  name: string
  articles: LearningArticleSummary[]
}

export interface LearningArticle {
  id: string
  title: string
  description: string
  category: string
  section?: string
  tags: string[]
  content: string
  related: string[]
  technologies: string[]
  links: string[]
}

export interface AttachedFileMeta {
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

export const api = {
  health: () => fetch('/api/health').then(json),
  projects: () => fetch('/api/projects').then((r) => json<ProjectSummary[]>(r)),
  project: (id: string) => fetch(`/api/projects/${id}`).then((r) => json<Project>(r)),
  createProject: (body: { name: string; description?: string; template_id?: string | null }) =>
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => json<Project>(r)),
  saveProject: (project: Project) =>
    fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    }).then((r) => json<Project>(r)),
  deleteProject: (id: string) => fetch(`/api/projects/${id}`, { method: 'DELETE' }).then(json),
  saveVersion: (id: string, label?: string) =>
    fetch(`/api/projects/${id}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    }).then((r) => json<Project>(r)),
  exportJson: (id: string) => fetch(`/api/projects/${id}/export.json`).then(json<Record<string, unknown>>),
  exportMd: (id: string) => fetch(`/api/projects/${id}/export.md`).then((r) => r.text()),
  exportAi: (id: string, body: AiExportBody = {}) =>
    fetch(`/api/projects/${id}/export/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: body.task || '',
        rules: body.rules || [],
        scope: body.scope || 'all',
        component_ids: body.component_ids || [],
        architecture_id: body.architecture_id ?? null,
        include_descriptions: body.include_descriptions ?? true,
        include_algorithms: body.include_algorithms ?? true,
        include_requirements: body.include_requirements ?? true,
        include_notes: body.include_notes ?? false,
        include_doc_meta: body.include_doc_meta ?? true,
        include_full_docs: body.include_full_docs ?? false,
        include_sql: body.include_sql ?? false,
      }),
    }).then((r) => r.text()),
  exportSql: (id: string, dialect: string) =>
    fetch(`/api/projects/${id}/export.sql?dialect=${encodeURIComponent(dialect)}`).then((r) => {
      if (!r.ok) throw new Error(r.statusText)
      return r.text()
    }),
  importJson: (payload: unknown) =>
    fetch('/api/projects/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => json<Project>(r)),
  templates: () => fetch('/api/templates').then((r) => json<TemplateInfo[]>(r)),
  saveTemplate: (projectId: string, name: string, description = '') =>
    fetch(`/api/projects/${projectId}/save-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    }).then(json),
  library: () => fetch('/api/library').then((r) => json<LibraryResponse>(r)),
  learning: () => fetch('/api/learning').then((r) => json<LearningCategory[]>(r)),
  learningArticle: (id: string) => fetch(`/api/learning/${id}`).then((r) => json<LearningArticle>(r)),
  uploadFile: async (projectId: string, file: File, componentId: string) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('component_id', componentId)
    const res = await fetch(`/api/projects/${projectId}/files`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error(await res.text())
    const meta = (await res.json()) as AttachedFileMeta & { component_id?: string | null }
    return { ...meta, component_id: meta.component_id ?? componentId }
  },
  settings: () => fetch('/api/settings').then((r) => json<GlobalSettings>(r)),
  saveSettings: (s: GlobalSettings) =>
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    }).then((r) => json<GlobalSettings>(r)),
}
