import { useMemo } from 'react'
import { getSmoothStepPath, useStore, type Node, type ReactFlowState } from '@xyflow/react'
import {
  CANVAS_EDGE_OFFSET,
  CANVAS_EDGE_RADIUS,
  nodeColor,
  pointOnNode,
  type MiniHandle,
  type MiniNode,
} from '../../model/minimapGeometry'

const MAP_W = 168
const MAP_H = 118
const PAD = 8

type Internalish = Node & {
  measured?: { width?: number; height?: number }
  internals?: {
    handleBounds?: {
      source?: MiniHandle[]
      target?: MiniHandle[]
    }
  }
}

function handlesOf(n: Internalish): MiniHandle[] {
  const hb = n.internals?.handleBounds
  return [...(hb?.source || []), ...(hb?.target || [])]
}

function asMini(n: Internalish): MiniNode {
  const data = n.data as { component?: MiniNode['component'] & { color?: string }; color?: string } | undefined
  return {
    id: n.id,
    position: n.position,
    width: n.measured?.width ?? n.width,
    height: n.measured?.height ?? n.height,
    color: data?.component?.color || data?.color,
    handles: handlesOf(n),
    component: data?.component,
  }
}

export function SchemeMiniMap() {
  const nodes = useStore((s: ReactFlowState) => s.nodes)
  const edges = useStore((s: ReactFlowState) => s.edges)
  const transform = useStore((s: ReactFlowState) => s.transform)
  const width = useStore((s: ReactFlowState) => s.width)
  const height = useStore((s: ReactFlowState) => s.height)

  const mini = useMemo(() => nodes.map((n) => asMini(n as Internalish)), [nodes])

  const scene = useMemo(() => {
    const placed = mini.filter((n) => n.width != null)
    if (!placed.length) {
      return { x: 0, y: 0, w: 1, h: 1, scale: 1 }
    }
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const n of placed) {
      const w = n.width || 120
      const h = n.height || 64
      minX = Math.min(minX, n.position.x)
      minY = Math.min(minY, n.position.y)
      maxX = Math.max(maxX, n.position.x + w)
      maxY = Math.max(maxY, n.position.y + h)
    }
    const w = Math.max(1, maxX - minX)
    const h = Math.max(1, maxY - minY)
    const scale = Math.min((MAP_W - PAD * 2) / w, (MAP_H - PAD * 2) / h)
    return { x: minX, y: minY, w, h, scale }
  }, [mini])

  const toMap = (x: number, y: number) => ({
    x: PAD + (x - scene.x) * scene.scale,
    y: PAD + (y - scene.y) * scene.scale,
  })

  const paths = edges.map((e) => {
    const src = mini.find((n) => n.id === e.source)
    const tgt = mini.find((n) => n.id === e.target)
    if (!src || !tgt) return null
    const from = pointOnNode(src, e.sourceHandle, 'source')
    const to = pointOnNode(tgt, e.targetHandle, 'target')
    const a = toMap(from.x, from.y)
    const b = toMap(to.x, to.y)
    const [d] = getSmoothStepPath({
      sourceX: a.x,
      sourceY: a.y,
      targetX: b.x,
      targetY: b.y,
      sourcePosition: from.position,
      targetPosition: to.position,
      borderRadius: Math.max(0.4, CANVAS_EDGE_RADIUS * scene.scale),
      offset: Math.max(0.4, CANVAS_EDGE_OFFSET * scene.scale),
    })
    const stroke = typeof e.style?.stroke === 'string' ? e.style.stroke : 'var(--line-strong)'
    return { id: e.id, d, stroke }
  })

  const [tx, ty, zoom] = transform
  const view = {
    x: PAD + (-tx / zoom - scene.x) * scene.scale,
    y: PAD + (-ty / zoom - scene.y) * scene.scale,
    w: (width / zoom) * scene.scale,
    h: (height / zoom) * scene.scale,
  }

  return (
    <div className="scheme-minimap" aria-hidden>
      <svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
        {paths.map((p) =>
          p ? <path key={p.id} d={p.d} fill="none" stroke={p.stroke} strokeWidth={1.2} opacity={0.85} /> : null,
        )}
        {mini.map((n) => {
          const w = (n.width || 120) * scene.scale
          const h = (n.height || 64) * scene.scale
          const p = toMap(n.position.x, n.position.y)
          return (
            <rect
              key={n.id}
              x={p.x}
              y={p.y}
              width={Math.max(3, w)}
              height={Math.max(2, h)}
              rx={1}
              fill={nodeColor(n.color)}
              opacity={0.72}
            />
          )
        })}
        <rect x={view.x} y={view.y} width={Math.max(8, view.w)} height={Math.max(6, view.h)} fill="none" stroke="var(--ink)" strokeWidth={1} opacity={0.45} />
      </svg>
    </div>
  )
}