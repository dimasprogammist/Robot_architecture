import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Toggle } from '../components/Toggle'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'
import { ProtocolsView } from './ProtocolsView'
import { ComponentsView } from './ComponentsView'
import type { TemplateInfo } from '../types'

function ProgressRow({
  label,
  done,
  total,
  emptyLabel,
}: {
  label: string
  done: number
  total: number
  emptyLabel: string
}) {
  const empty = total <= 0
  const pct = empty ? 0 : Math.round((done / total) * 100)
  return (
    <div className="progress-row">
      <div className="progress-row-head">
        <span>{label}</span>
        <span>{empty ? emptyLabel : `${pct}%`}</span>
      </div>
      <div className="progress-track" aria-hidden>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function SettingsView() {
  const settings = useUiStore((s) => s.settings)
  const setSettings = useUiStore((s) => s.setSettings)
  const setTheme = useUiStore((s) => s.setTheme)
  const setLibraryCollapsed = useUiStore((s) => s.setLibraryCollapsed)
  const project = useProjectStore((s) => s.project)
  const mutate = useProjectStore((s) => s.mutate)
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [progress, setProgress] = useState({
    course_total: 0,
    course_done: 0,
    exercises_total: 0,
    exercises_done: 0,
  })

  useEffect(() => {
    api.saveSettings(settings).catch(() => undefined)
  }, [settings])

  useEffect(() => {
    api.templates().then(setTemplates).catch(() => undefined)
    api.courseProgress().then(setProgress).catch(() => undefined)
  }, [])

  return (
    <div className="page settings-page">
      <h1>Настройки</h1>
      <p className="lede">Интерфейс, холст и протоколы связей текущего проекта.</p>

      <div className="settings-layout">
        <section className="settings-card">
          <h2>Интерфейс</h2>
          <div className="settings-grid">
            <div className="field">
              <label>Отображаемое имя</label>
              <input
                value={settings.display_name}
                onChange={(e) => setSettings({ ...settings, display_name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Плотность</label>
              <select
                value={settings.ui_density}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ui_density: e.target.value as 'comfortable' | 'compact',
                  })
                }
              >
                <option value="comfortable">Обычная</option>
                <option value="compact">Компактная</option>
              </select>
            </div>
          </div>
          <div className="settings-options">
            <Toggle
              label="Тёмная тема"
              checked={settings.theme === 'dark'}
              onChange={(v) => {
                const theme = v ? 'dark' : 'light'
                setTheme(theme)
                setSettings({ ...settings, theme })
              }}
            />
            <Toggle
              label="Уменьшить анимации"
              checked={settings.reduce_motion}
              onChange={(v) => setSettings({ ...settings, reduce_motion: v })}
            />
            <Toggle
              label="Открывать библиотеку при входе"
              checked={settings.library_open}
              onChange={(v) => {
                setSettings({ ...settings, library_open: v })
                setLibraryCollapsed(!v)
              }}
            />
          </div>
        </section>

        <section className="settings-card">
          <h2>Редактор</h2>
          <div className="settings-options">
            <Toggle label="Показывать сетку" checked={settings.show_grid} onChange={(v) => setSettings({ ...settings, show_grid: v })} />
            <Toggle label="Привязка к сетке" checked={settings.snap_to_grid} onChange={(v) => setSettings({ ...settings, snap_to_grid: v })} />
            <Toggle label="Мини-карта" checked={settings.show_minimap} onChange={(v) => setSettings({ ...settings, show_minimap: v })} />
            <Toggle label="Подписи связей" checked={settings.show_edge_labels} onChange={(v) => setSettings({ ...settings, show_edge_labels: v })} />
            <Toggle label="Свободное соединение узлов" checked={settings.loose_connections} onChange={(v) => setSettings({ ...settings, loose_connections: v })} />
            <Toggle
              label="Автосохранение"
              checked={settings.autosave}
              onChange={(v) => {
                setSettings({ ...settings, autosave: v })
                if (project) mutate((p) => { p.settings.autosave = v })
              }}
            />
            <div className="field">
              <label>Шаг сетки</label>
              <input
                type="number"
                value={settings.grid_size}
                onChange={(e) => setSettings({ ...settings, grid_size: Number(e.target.value) || 20 })}
              />
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h2>Проект</h2>
          <div className="settings-grid">
            <div className="field">
              <label>Шаблон нового проекта</label>
              <select
                value={settings.default_template_id}
                onChange={(e) => setSettings({ ...settings, default_template_id: e.target.value })}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            {project ? (
              <>
                <div className="field">
                  <label>Название</label>
                  <input value={project.name} onChange={(e) => mutate((p) => { p.name = e.target.value })} />
                </div>
                <div className="field">
                  <label>Описание</label>
                  <textarea value={project.description} onChange={(e) => mutate((p) => { p.description = e.target.value })} />
                </div>
              </>
            ) : null}
          </div>
          <div className="settings-options">
            <Toggle label="Подтверждать удаление элементов" checked={settings.confirm_delete} onChange={(v) => setSettings({ ...settings, confirm_delete: v })} />
            <Toggle label="Подтверждать удаление проекта" checked={settings.confirm_delete_project} onChange={(v) => setSettings({ ...settings, confirm_delete_project: v })} />
          </div>
        </section>

        <section className="settings-card">
          <h2>Обучение</h2>
          <ProgressRow label="Учебник" done={progress.course_done} total={progress.course_total} emptyLabel="0%" />
          <ProgressRow label="Задачник" done={progress.exercises_done} total={progress.exercises_total} emptyLabel="Нет заданий" />
          <div className="settings-options" style={{ marginTop: 12 }}>
            <div className="field">
              <label>Размер текста учебника</label>
              <select
                value={String(settings.lesson_font_scale)}
                onChange={(e) => setSettings({ ...settings, lesson_font_scale: Number(e.target.value) })}
              >
                <option value="0.9">Мельче</option>
                <option value="1">Обычный</option>
                <option value="1.12">Крупнее</option>
              </select>
            </div>
            <Toggle label="Показывать прогресс в учебнике" checked={settings.show_course_progress} onChange={(v) => setSettings({ ...settings, show_course_progress: v })} />
          </div>
        </section>

        <div className="settings-wide">
          <ComponentsView />
        </div>

        <div className="settings-wide">
          <ProtocolsView />
        </div>
      </div>
    </div>
  )
}
