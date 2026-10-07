import { create } from 'zustand'
import { DEFAULT_SETTINGS, type GlobalSettings, type NavId } from '../types'

interface UiState {
  nav: NavId
  theme: 'light' | 'dark'
  settings: GlobalSettings
  searchOpen: boolean
  exportOpen: boolean
  libraryCollapsed: boolean
  docTab: 'requirements' | 'notes' | 'bom' | 'files'
  inspectorTab: 'overview' | 'docs' | 'algorithm' | 'nested' | 'requirements' | 'mechanics' | 'table' | 'files'
  setNav: (nav: NavId) => void
  setTheme: (theme: 'light' | 'dark') => void
  setSettings: (s: GlobalSettings) => void
  setSearchOpen: (v: boolean) => void
  setExportOpen: (v: boolean) => void
  toggleLibrary: () => void
  setLibraryCollapsed: (v: boolean) => void
  setDocTab: (t: UiState['docTab']) => void
  setInspectorTab: (t: UiState['inspectorTab']) => void
}

function applyChrome(s: GlobalSettings) {
  document.documentElement.dataset.theme = s.theme
  document.documentElement.dataset.density = s.ui_density
  document.documentElement.dataset.motion = s.reduce_motion ? 'reduce' : 'full'
}

export const useUiStore = create<UiState>((set) => ({
  nav: 'architecture',
  theme: 'light',
  settings: DEFAULT_SETTINGS,
  searchOpen: false,
  exportOpen: false,
  libraryCollapsed: true,
  docTab: 'requirements',
  inspectorTab: 'overview',
  setNav: (nav) => set({ nav }),
  setTheme: (theme) => set({ theme }),
  setSettings: (s) => {
    const settings = { ...DEFAULT_SETTINGS, ...s }
    applyChrome(settings)
    set({ settings, theme: settings.theme })
  },
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setExportOpen: (exportOpen) => set({ exportOpen }),
  toggleLibrary: () => set((s) => ({ libraryCollapsed: !s.libraryCollapsed })),
  setLibraryCollapsed: (libraryCollapsed) => set({ libraryCollapsed }),
  setDocTab: (docTab) => set({ docTab }),
  setInspectorTab: (inspectorTab) => set({ inspectorTab }),
}))
