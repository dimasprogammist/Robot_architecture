import { create } from 'zustand'
import type { GlobalSettings, NavId } from '../types'

interface UiState {
  nav: NavId
  theme: 'light' | 'dark'
  settings: GlobalSettings
  searchOpen: boolean
  exportOpen: boolean
  libraryCollapsed: boolean
  inspectorTab: 'overview' | 'docs' | 'algorithm' | 'nested' | 'requirements'
  setNav: (nav: NavId) => void
  setTheme: (theme: 'light' | 'dark') => void
  setSettings: (s: GlobalSettings) => void
  setSearchOpen: (v: boolean) => void
  setExportOpen: (v: boolean) => void
  toggleLibrary: () => void
  setInspectorTab: (t: UiState['inspectorTab']) => void
}

export const useUiStore = create<UiState>((set) => ({
  nav: 'architecture',
  theme: 'light',
  settings: {
    theme: 'light',
    snap_to_grid: true,
    show_grid: true,
    grid_size: 20,
    autosave: true,
    language: 'ru',
    display_name: 'Архитектор',
  },
  searchOpen: false,
  exportOpen: false,
  libraryCollapsed: false,
  inspectorTab: 'overview',
  setNav: (nav) => set({ nav }),
  setTheme: (theme) => set({ theme }),
  setSettings: (s) => set({ settings: s, theme: s.theme }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setExportOpen: (exportOpen) => set({ exportOpen }),
  toggleLibrary: () => set((s) => ({ libraryCollapsed: !s.libraryCollapsed })),
  setInspectorTab: (inspectorTab) => set({ inspectorTab }),
}))
