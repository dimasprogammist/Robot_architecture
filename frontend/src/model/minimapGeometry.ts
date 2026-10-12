import { getSmoothStepPath, Position } from '@xyflow/react'
import type { Component } from '../types'
import { findTerminal, terminalAnchor } from './terminals'

export const CANVAS_EDGE_OFFSET = 20
export const CANVAS_EDGE_RADIUS = 8

export type MiniHandle = {
  id?: string | null
  x: number
  y: number
  width: number
  height: number
  position?: Position
}

export type MiniNode = {
  id: string
  position: { x: number; y: number }
  width?: number | null
  height?: number | null
  color?: string
  handles?: MiniHandle[]
  component?: Pick<Component, 'type' | 'name' | 'category' | 'extra_fields'>
}

export function nodeColor(color: string | undefined, fallback = '#2f5d50') {
  return color && /^#|[a-z]/i.test(color) ? color : fallback
}

function sidePoint(node: MiniNode, position: Position) {
  const w = node.width || 120
  const h = node.height || 64
  if (position === Position.Left) return { x: node.position.x, y: node.position.y + h / 2, position }
  if (position === Position.Right) return { x: node.position.x + w, y: node.position.y + h / 2, position }
  if (position === Position.Top) return { x: node.position.x + w / 2, y: node.position.y, position }
  return { x: node.position.x + w / 2, y: node.position.y + h, position }
}

function sideFromHandleId(handleId: string | null | undefined): Position | null {
  const id = handleId || ''
  if (id.includes('left')) return Position.Left
  if (id.includes('right')) return Position.Right
  if (id.includes('top')) return Position.Top
  if (id.includes('bottom')) return Position.Bottom
  return null
}

export function pointOnNode(
  node: MiniNode,
  handleId?: string | null,
  role: 'source' | 'target' = 'source',
): { x: number; y: number; position: Position } {
  const found = handleId ? node.handles?.find((x) => x.id === handleId) : undefined
  if (found) {
    const named = sideFromHandleId(handleId)
    return {
      x: node.position.x + found.x + found.width / 2,
      y: node.position.y + found.y + found.height / 2,
      position: found.position || named || (role === 'target' ? Position.Left : Position.Right),
    }
  }
  if (node.component && handleId) {
    const term = findTerminal(node.component, handleId)
    if (term) {
      const size = { width: node.width || 120, height: node.height || 64 }
      const a = terminalAnchor(term, size)
      return { x: node.position.x + a.x, y: node.position.y + a.y, position: term.position }
    }
  }
  const named = sideFromHandleId(handleId)
  if (named) return sidePoint(node, named)
  return sidePoint(node, role === 'target' ? Position.Left : Position.Right)
}

export function edgePath(
  src: MiniNode,
  tgt: MiniNode,
  sourceHandle?: string | null,
  targetHandle?: string | null,
  scale = 1,
) {
  const a = pointOnNode(src, sourceHandle, 'source')
  const b = pointOnNode(tgt, targetHandle, 'target')
  const [d] = getSmoothStepPath({
    sourceX: a.x,
    sourceY: a.y,
    targetX: b.x,
    targetY: b.y,
    sourcePosition: a.position,
    targetPosition: b.position,
    borderRadius: Math.max(0.4, CANVAS_EDGE_RADIUS * scale),
    offset: Math.max(0.4, CANVAS_EDGE_OFFSET * scale),
  })
  return { d, a, b }
}
