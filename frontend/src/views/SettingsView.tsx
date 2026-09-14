import { useEffect } from 'react'
import { api } from '../lib/api'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'

export function SettingsView() {
  const settings = useUiStore((s) => s.settings)
  const setSettings = useUiStore((s) => s.setSettings)
  const setTheme = useUiStore((s) => s.setTheme)
  const project = useProjectStore((s) => s.project)
  const mutate = useProjectStore((s) => s.mutate)
  const toggleLibrary = useUiStore((s) => s.toggleLibrary)

  useEffect(() => {
    api.saveSettings(settings).catch(() => undefined)
  }, [settings])

  return (
    <div className="page">
      <h1>Настройки</h1>
      <p className="lede">Параметры рабочей области. Тема и сетка применяются сразу.</p>
      <div className="field" style={{ maxWidth: 360 }}>
        <label>Отображаемое имя</label>
        <input value={settings.display_name} onChange={(e) => setSettings({ ...settings, display_name: e.target.value })} />
      </div>
      <div className="field" style={{ maxWidth: 360 }}>
        <label>Тема</label>
        <select
          value={settings.theme}
          onChange={(e) => {
            const theme = e.target.value as 'light' | 'dark'
            setTheme(theme)
            setSettings({ ...settings, theme })
          }}
        >
          <option value="light">Светлая</option>
          <option value="dark">Тёмная</option>
        </select>
      </div>
      <label className="row" style={{ marginBottom: 10 }}>
        <input
          type="checkbox"
          checked={settings.show_grid}
          onChange={(e) => setSettings({ ...settings, show_grid: e.target.checked })}
        />
        Показывать сетку
      </label>
      <label className="row" style={{ marginBottom: 10 }}>
        <input
          type="checkbox"
          checked={settings.snap_to_grid}
          onChange={(e) => setSettings({ ...settings, snap_to_grid: e.target.checked })}
        />
        Привязка к сетке
      </label>
      <label className="row" style={{ marginBottom: 10 }}>
        <input
          type="checkbox"
          checked={settings.autosave}
          onChange={(e) => {
            setSettings({ ...settings, autosave: e.target.checked })
            if (project) mutate((p) => { p.settings.autosave = e.target.checked })
          }}
        />
        Автосохранение
      </label>
      <div className="field" style={{ maxWidth: 200 }}>
        <label>Шаг сетки</label>
        <input
          type="number"
          value={settings.grid_size}
          onChange={(e) => setSettings({ ...settings, grid_size: Number(e.target.value) || 20 })}
        />
      </div>
      <button className="btn" type="button" onClick={toggleLibrary}>
        Скрыть или показать библиотеку
      </button>
    </div>
  )
}
