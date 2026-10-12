/** Maps a Learning (Учебник) module_id to a Taskbook (Задачник) section id. */
export const COURSE_EXERCISE_SECTION: Record<string, string> = {
  terminal: 'terminal',
  python: 'python',
  cpp: 'cpp',
  algorithms: 'algorithms',
  git: 'git',
  sql: 'sql',
  mathematics: 'math',
  electronics: 'electronics',
  networks: 'networks',
}

export function exerciseSectionForCourse(moduleId: string | undefined | null) {
  if (!moduleId) return null
  return COURSE_EXERCISE_SECTION[moduleId] || null
}
