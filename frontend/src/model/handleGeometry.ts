export type HandleBoundsRect = {
  id?: string | null
  x: number
  y: number
  width: number
  height: number
}

export type HandleBoundsMap = {
  source?: HandleBoundsRect[] | null
  target?: HandleBoundsRect[] | null
}

export type InternalNodeLike = {
  position: { x: number; y: number }
  internals?: {
    positionAbsolute?: { x: number; y: number }
    handleBounds?: HandleBoundsMap | null
  }
}

export function pickHandleRect(
  bounds: HandleBoundsMap | null | undefined,
  handleId: string | null | undefined,
  kind: 'source' | 'target',
): HandleBoundsRect | null {
  if (!bounds) return null
  const primary = kind === 'source' ? bounds.source : bounds.target
  const secondary = kind === 'source' ? bounds.target : bounds.source
  if (handleId) {
    const hit = [...(primary || []), ...(secondary || [])].find((h) => h.id === handleId)
    if (hit) return hit
  }
  return primary?.[0] || secondary?.[0] || null
}

/** Center of a node handle in flow coordinates (node origin + handle box center). */
export function handleCenterOnNode(
  node: InternalNodeLike | undefined,
  handleId: string | null | undefined,
  kind: 'source' | 'target',
): { x: number; y: number } | null {
  if (!node) return null
  const handle = pickHandleRect(node.internals?.handleBounds, handleId, kind)
  if (!handle) return null
  const origin = node.internals?.positionAbsolute ?? node.position
  return {
    x: origin.x + handle.x + handle.width / 2,
    y: origin.y + handle.y + handle.height / 2,
  }
}

export function samePoint(
  a: { x: number; y: number } | null | undefined,
  b: { x: number; y: number } | null | undefined,
) {
  if (a === b) return true
  if (!a || !b) return false
  return a.x === b.x && a.y === b.y
}
