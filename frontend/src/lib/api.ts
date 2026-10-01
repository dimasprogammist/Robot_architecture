import type {
  GlobalSettings,
  LibraryResponse,
  Project,
  ProjectSummary,
  TemplateInfo,
} from '../types'

const TOKEN_KEY = 'arch_token'

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function apiFetch(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(url, { ...init, headers })
}

const json = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json() as Promise<T>
}

export interface CourseLessonSummary {
  id: string
  order: number
  title: string
}

export interface CourseModule {
  id: string
  order: number
  title: string
  lessons: CourseLessonSummary[]
}

export interface CourseOverview {
  total_lessons: number
  modules: CourseModule[]
}

export interface CourseLesson {
  id: string
  title: string
  module_id: string
  module_title: string
  order: number
  content: string
  asset_base: string
  prev_lesson_id: string | null
  next_lesson_id: string | null
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

export interface CurriculumLessonSummary {
  id: string
  order: number
  title: string
  summary: string
  technologies: string[]
  task_count: number
  locked: boolean
  completed: boolean
}

export interface CurriculumModuleSummary {
  id: string
  order: number
  title: string
  goal: string
  icon: string
  lessons: CurriculumLessonSummary[]
}

export interface CurriculumOverview {
  total_lessons: number
  completed_lessons: number
  modules: CurriculumModuleSummary[]
}

export interface CurriculumQuizOption {
  id: string
  text: string
}

export interface CurriculumTaskPublic {
  id: string
  type: 'quiz' | 'code'
  prompt: string
  hint: string
  options: CurriculumQuizOption[]
  starter_code: string
  passed: boolean
}

export interface CurriculumLessonDetail {
  id: string
  order: number
  title: string
  summary: string
  why: string
  technologies: string[]
  theory: string
  glossary: Record<string, string>
  common_mistakes: string[]
  tasks: CurriculumTaskPublic[]
  theory_done: boolean
  locked: boolean
  module_id: string
  module_title: string
  prev_lesson_id: string | null
  next_lesson_id: string | null
}

export interface CurriculumTaskCheckResult {
  passed: boolean
  explanation: string
  error: string | null
  test_results: { call: string; expected: string; actual: string; passed: boolean; label: string }[]
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

export interface AuthUser {
  id: string
  email: string
  display_name: string
  role: string
}

export const api = {
  health: () => apiFetch('/api/health').then(json),
  register: (body: { email: string; password: string; display_name?: string }) =>
    apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => json<{ token: string; user: AuthUser }>(r)),
  login: (body: { email: string; password: string }) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => json<{ token: string; user: AuthUser }>(r)),
  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }).then(json),
  me: () => apiFetch('/api/auth/me').then((r) => json<AuthUser>(r)),
  course: () => apiFetch('/api/course').then((r) => json<CourseOverview>(r)),
  courseLesson: (id: string) => apiFetch(`/api/course/${id}`).then((r) => json<CourseLesson>(r)),
  projects: () => apiFetch('/api/projects').then((r) => json<ProjectSummary[]>(r)),
  project: (id: string) => apiFetch(`/api/projects/${id}`).then((r) => json<Project>(r)),
  createProject: (body: { name: string; description?: string; template_id?: string | null }) =>
    apiFetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => json<Project>(r)),
  saveProject: (project: Project) =>
    apiFetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    }).then((r) => json<Project>(r)),
  deleteProject: (id: string) => apiFetch(`/api/projects/${id}`, { method: 'DELETE' }).then(json),
  saveVersion: (id: string, label?: string) =>
    apiFetch(`/api/projects/${id}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    }).then((r) => json<Project>(r)),
  exportJson: (id: string) => apiFetch(`/api/projects/${id}/export.json`).then(json<Record<string, unknown>>),
  exportMd: (id: string) => apiFetch(`/api/projects/${id}/export.md`).then((r) => r.text()),
  exportAi: (id: string, body: AiExportBody = {}) =>
    apiFetch(`/api/projects/${id}/export/ai`, {
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
    apiFetch(`/api/projects/${id}/export.sql?dialect=${encodeURIComponent(dialect)}`).then((r) => {
      if (!r.ok) throw new Error(r.statusText)
      return r.text()
    }),
  importJson: (payload: unknown) =>
    apiFetch('/api/projects/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => json<Project>(r)),
  templates: () => apiFetch('/api/templates').then((r) => json<TemplateInfo[]>(r)),
  saveTemplate: (projectId: string, name: string, description = '') =>
    apiFetch(`/api/projects/${projectId}/save-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    }).then(json),
  library: () => apiFetch('/api/library').then((r) => json<LibraryResponse>(r)),
  learning: () => apiFetch('/api/learning').then((r) => json<LearningCategory[]>(r)),
  learningArticle: (id: string) => apiFetch(`/api/learning/${id}`).then((r) => json<LearningArticle>(r)),
  curriculum: () => apiFetch('/api/curriculum').then((r) => json<CurriculumOverview>(r)),
  curriculumLesson: (lessonId: string) =>
    apiFetch(`/api/curriculum/${lessonId}`).then((r) => json<CurriculumLessonDetail>(r)),
  curriculumTheoryDone: (lessonId: string) =>
    apiFetch(`/api/curriculum/${lessonId}/theory-done`, { method: 'POST' }).then((r) =>
      json<CurriculumLessonDetail>(r)
    ),
  curriculumCheckQuiz: (lessonId: string, taskId: string, optionId: string) =>
    apiFetch(`/api/curriculum/${lessonId}/tasks/${taskId}/check-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option_id: optionId }),
    }).then((r) => json<CurriculumTaskCheckResult>(r)),
  curriculumCheckCode: (lessonId: string, taskId: string, code: string) =>
    apiFetch(`/api/curriculum/${lessonId}/tasks/${taskId}/check-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).then((r) => json<CurriculumTaskCheckResult>(r)),
  uploadFile: async (projectId: string, file: File, componentId: string) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('component_id', componentId)
    const res = await apiFetch(`/api/projects/${projectId}/files`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error(await res.text())
    const meta = (await res.json()) as AttachedFileMeta & { component_id?: string | null }
    return { ...meta, component_id: meta.component_id ?? componentId }
  },
  settings: () => apiFetch('/api/settings').then((r) => json<GlobalSettings>(r)),
  saveSettings: (s: GlobalSettings) =>
    apiFetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    }).then((r) => json<GlobalSettings>(r)),
}
