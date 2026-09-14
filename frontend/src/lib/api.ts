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
  exportAi: (id: string, task: string) =>
    fetch(`/api/projects/${id}/export/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    }).then((r) => r.text()),
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
  settings: () => fetch('/api/settings').then((r) => json<GlobalSettings>(r)),
  saveSettings: (s: GlobalSettings) =>
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    }).then((r) => json<GlobalSettings>(r)),
}
