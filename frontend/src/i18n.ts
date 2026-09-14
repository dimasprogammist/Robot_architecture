export const STATUS_LABELS: Record<string, string> = {
  planned: 'Запланирован',
  'in-progress': 'В работе',
  ready: 'Готов',
  deprecated: 'Устарел',
}

export const CATEGORY_LABELS: Record<string, string> = {
  SOFTWARE: 'ПО',
  HARDWARE: 'Железо',
  DATA: 'Данные',
  PROTOCOL: 'Протокол',
  OTHER: 'Прочее',
}

export const TAB_LABELS: Record<string, string> = {
  overview: 'Обзор',
  docs: 'Документация',
  algorithm: 'Алгоритм',
  nested: 'Вложенность',
  requirements: 'Требования',
}

export const STEP_KIND_LABELS: Record<string, string> = {
  action: 'действие',
  condition: 'условие',
  loop: 'цикл',
  input: 'вход',
  output: 'выход',
  error: 'ошибка',
}

export const SEARCH_KIND_LABELS: Record<string, string> = {
  component: 'компонент',
  protocol: 'протокол',
  algorithm: 'алгоритм',
  connection: 'связь',
  requirement: 'требование',
  document: 'документ',
}
