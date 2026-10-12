import type { NodeChange } from '@xyflow/react'

export type PersistablePosition = { id: string; x: number; y: number; dragging?: boolean }
export type PersistableSize = { id: string; width: number; height: number }

function sameNumber(a: number, b: number) {
  return Math.abs(a - b) < 0.01
}

/**
 * React Flow's StoreUpdater calls setNodes whenever the controlled `nodes`
 * reference changes, then emits position/dimension sync. Writing those sync
 * events back into Zustand clones the project, rebuilds `nodes`, and loops
 * until "Maximum update depth exceeded".
 *
 * Persist positions only for a real user drag (`dragging` true/false).
 * StoreUpdater's setNodes echo sends position with `dragging` undefined —
 * writing those back clones Zustand, rebuilds `nodes`, and loops.
 * Persist dimensions only while the user is resizing (NodeResizer), never
 * for implicit layout measurement (`resizing` is undefined).
 */
export function collectPersistableNodeChanges(changes: NodeChange[], wasResizing: boolean) {
  const positions: PersistablePosition[] = []
  const sizes: PersistableSize[] = []
  let resizing = wasResizing

  for (const change of changes) {
    if (change.type === 'dimensions' && change.resizing === true) resizing = true
  }

  for (const change of changes) {
    if (change.type === 'position' && change.position) {
      if (change.dragging !== true && change.dragging !== false) continue
      positions.push({
        id: change.id,
        x: change.position.x,
        y: change.position.y,
        dragging: change.dragging,
      })
      continue
    }
    if (change.type !== 'dimensions' || !change.dimensions) continue
    const userResize =
      change.resizing === true || (change.resizing === false && wasResizing)
    if (!userResize) continue
    sizes.push({
      id: change.id,
      width: change.dimensions.width,
      height: change.dimensions.height,
    })
  }

  if (changes.some((change) => change.type === 'dimensions' && change.resizing === false)) {
    resizing = false
  }

  return { positions, sizes, resizing }
}

export function positionNeedsWrite(
  current: { x: number; y: number } | undefined,
  next: { x: number; y: number },
) {
  if (!current) return true
  return !sameNumber(current.x, next.x) || !sameNumber(current.y, next.y)
}

export function sizeNeedsWrite(
  current: { width?: number; height?: number },
  next: { width: number; height: number },
) {
  return current.width !== next.width || current.height !== next.height
}

export function selectionIdsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  if (a.length <= 1) return a[0] === b[0]
  const other = new Set(b)
  return a.every((id) => other.has(id))
}

export function reuseRfById<T extends { id: string }>(
  prev: T[] | undefined,
  next: T[],
  same: (a: T, b: T) => boolean,
): T[] {
  if (!prev) return next
  if (prev === next) return prev
  if (prev.length !== next.length) return next
  let changed = false
  const out = next.map((item, i) => {
    const old = prev[i]?.id === item.id ? prev[i] : prev.find((p) => p.id === item.id)
    if (old && same(old, item)) return old
    changed = true
    return item
  })
  if (!changed && prev.every((p, i) => p.id === out[i].id)) return prev
  return out
}
