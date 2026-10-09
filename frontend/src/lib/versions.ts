import type { ArchitectureVersion } from '../types'

export function sortedVersions(versions: ArchitectureVersion[] | undefined | null): ArchitectureVersion[] {
  return [...(versions || [])].sort((a, b) => {
    const tb = Date.parse(b.created_at) || 0
    const ta = Date.parse(a.created_at) || 0
    if (tb !== ta) return tb - ta
    return b.label.localeCompare(a.label, 'ru', { numeric: true })
  })
}
