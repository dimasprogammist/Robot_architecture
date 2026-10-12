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
 * Persist positions only when coordinates actually change.
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
  return a.length === b.length && a.every((id, i) => id === b[i])
}
