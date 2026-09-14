import { useMemo } from 'react'
import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
  type NodeChange,
} from '@xyflow/react'
import { useProjectStore } from '../../store/useProjectStore'
import { uid } from '../../lib/ids'

export function AlgorithmCanvas({ algorithmId }: { algorithmId: string }) {
  const algorithm = useProjectStore((s) => s.project?.algorithms.find((a) => a.id === algorithmId))
  const updateAlgorithm = useProjectStore((s) => s.updateAlgorithm)
  const nodes: Node[] = useMemo(
    () =>
      (algorithm?.canvas_nodes || []).map((n) => ({
        id: n.id,
        position: n.position,
        data: { label: n.label },
        style: {
          borderRadius: 10,
          border: '1px solid var(--line)',
          background: 'var(--surface)',
          padding: 8,
          fontSize: 12,
        },
      })),
    [algorithm],
  )
  const edges: Edge[] = useMemo(
    () =>
      (algorithm?.canvas_edges || []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        markerEnd: { type: 'arrowclosed' as const },
      })),
    [algorithm],
  )
  if (!algorithm) return null
  return (
    <div className="canvas-wrap">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onNodesChange={(changes: NodeChange[]) => {
          const pos = changes.filter((c): c is Extract<NodeChange, { type: 'position' }> => c.type === 'position' && Boolean(c.position))
          if (!pos.length) return
          updateAlgorithm(algorithm.id, {
            canvas_nodes: algorithm.canvas_nodes.map((n) => {
              const ch = pos.find((c) => c.id === n.id)
              return ch?.position ? { ...n, position: ch.position } : n
            }),
          })
        }}
        onConnect={(c) => {
          if (!c.source || !c.target) return
          updateAlgorithm(algorithm.id, {
            canvas_edges: [...algorithm.canvas_edges, { id: uid(), source: c.source, target: c.target, label: '' }],
          })
        }}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
