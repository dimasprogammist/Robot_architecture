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
      <h1>Settings</h1>
      <p className="lede">Workspace preferences. Theme and grid apply immediately.</p>
      <div className="field" style={{ maxWidth: 360 }}>
        <label>Display name</label>
        <input value={settings.display_name} onChange={(e) => setSettings({ ...settings, display_name: e.target.value })} />
      </div>
      <div className="field" style={{ maxWidth: 360 }}>
        <label>Theme</label>
        <select
          value={settings.theme}
          onChange={(e) => {
            const theme = e.target.value as 'light' | 'dark'
            setTheme(theme)
            setSettings({ ...settings, theme })
          }}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <label className="row" style={{ marginBottom: 10 }}>
        <input
          type="checkbox"
          checked={settings.show_grid}
          onChange={(e) => setSettings({ ...settings, show_grid: e.target.checked })}
        />
        Show grid
      </label>
      <label className="row" style={{ marginBottom: 10 }}>
        <input
          type="checkbox"
          checked={settings.snap_to_grid}
          onChange={(e) => setSettings({ ...settings, snap_to_grid: e.target.checked })}
        />
        Snap to grid
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
        Autosave
      </label>
      <div className="field" style={{ maxWidth: 200 }}>
        <label>Grid size</label>
        <input
          type="number"
          value={settings.grid_size}
          onChange={(e) => setSettings({ ...settings, grid_size: Number(e.target.value) || 20 })}
        />
      </div>
      <button className="btn" type="button" onClick={toggleLibrary}>
        Toggle component library
      </button>
    </div>
  )
}
