import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './Home'
import { Workspace } from './Workspace'
import { api } from './lib/api'
import { useUiStore } from './store/useUiStore'
import type { LibraryPreset } from './types'
import './styles.css'

export default function App() {
  const theme = useUiStore((s) => s.theme)
  const setSettings = useUiStore((s) => s.setSettings)
  const setTheme = useUiStore((s) => s.setTheme)
  const [presets, setPresets] = useState<LibraryPreset[]>([])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    api.settings().then((s) => {
      setSettings(s)
      setTheme(s.theme)
    }).catch(() => undefined)
    api.library().then((l) => setPresets(l.presets)).catch(() => undefined)
  }, [setSettings, setTheme])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/p/:id" element={<Workspace presets={presets} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
