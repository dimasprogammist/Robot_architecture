import { useMemo, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeChange,
  type NodeProps,
} from '@xyflow/react'
import { useProjectStore } from '../../store/useProjectStore'
import { uid } from '../../lib/ids'

const KINDS = [
  { id: 'start', label: 'Начало' },
  { id: 'action', label: 'Действие' },
  { id: 'condition', label: 'Условие' },
  { id: 'end', label: 'Конец' },
] as const

function FlowBlock({ data }: NodeProps) {
  const kind = String(data.kind || 'action')
  return (
    <div className={`flow-block flow-${kind}`}>
      <Handle type="target" position={Position.Top} />
      <span>{String(data.label || '')}</span>
      <Handle type="source" position={Position.Bottom} />
      {kind === 'condition' ? <Handle id="no" type="source" position={Position.Right} /> : null}
    </div>
  )
}

const nodeTypes = { flow: FlowBlock }

export function AlgorithmCanvas({ algorithmId }: { algorithmId: string }) {
  return (
    <ReactFlowProvider>
      <AlgorithmCanvasInner algorithmId={algorithmId} />
    </ReactFlowProvider>
  )
}

function AlgorithmCanvasInner({ algorithmId }: { algorithmId: string }) {
  const algorithm = useProjectStore((s) => s.project?.algorithms.find((a) => a.id === algorithmId))
  const updateAlgorithm = useProjectStore((s) => s.updateAlgorithm)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const nodes: Node[] = useMemo(
    () =>
      (algorithm?.canvas_nodes || []).map((n) => ({
        id: n.id,
        type: 'flow',
        position: n.position,
        data: { label: n.label, kind: n.kind },
        selected: n.id === selectedId,
      })),
    [algorithm, selectedId],
  )
  const edges: Edge[] = useMemo(
    () =>
      (algorithm?.canvas_edges || []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.label === 'нет' ? 'no' : undefined,
        label: e.label,
        markerEnd: { type: 'arrowclosed' as const },
      })),
    [algorithm],
  )

  if (!algorithm) return null
  const selected = algorithm.canvas_nodes.find((n) => n.id === selectedId)

  const patchNodes = (next: typeof algorithm.canvas_nodes) => updateAlgorithm(algorithm.id, { canvas_nodes: next })

  return (
    <div className="flow-editor">
      <div className="flow-toolbar">
        {KINDS.map((k) => (
          <button
            key={k.id}
            className="btn"
            type="button"
            onClick={() =>
              patchNodes([
                ...algorithm.canvas_nodes,
                {
                  id: uid(),
                  kind: k.id,
                  label: k.label,
                  position: { x: 80 + algorithm.canvas_nodes.length * 24, y: 80 + algorithm.canvas_nodes.length * 16 },
                },
              ])
            }
          >
            {k.label}
          </button>
        ))}
      </div>
      <div className="canvas-wrap flow-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          onNodeClick={(_, node) => setSelectedId(node.id)}
          onPaneClick={() => setSelectedId(null)}
          onNodesChange={(changes: NodeChange[]) => {
            const moved = changes.filter((c): c is Extract<NodeChange, { type: 'position' }> => c.type === 'position' && Boolean(c.position))
            const removed = changes.filter((c) => c.type === 'remove').map((c) => c.id)
            if (!moved.length && !removed.length) return
            patchNodes(
              algorithm.canvas_nodes
                .filter((n) => !removed.includes(n.id))
                .map((n) => {
                  const ch = moved.find((c) => c.id === n.id)
                  return ch?.position ? { ...n, position: ch.position } : n
                }),
            )
            if (removed.length) {
              updateAlgorithm(algorithm.id, {
                canvas_nodes: algorithm.canvas_nodes.filter((n) => !removed.includes(n.id)),
                canvas_edges: algorithm.canvas_edges.filter((e) => !removed.includes(e.source) && !removed.includes(e.target)),
              })
            }
          }}
          onEdgesChange={(changes) => {
            const removed = changes.filter((c) => c.type === 'remove').map((c) => c.id)
            if (!removed.length) return
            updateAlgorithm(algorithm.id, {
              canvas_edges: algorithm.canvas_edges.filter((e) => !removed.includes(e.id)),
            })
          }}
          onConnect={(c) => {
            if (!c.source || !c.target) return
            updateAlgorithm(algorithm.id, {
              canvas_edges: [
                ...algorithm.canvas_edges,
                { id: uid(), source: c.source, target: c.target, label: c.sourceHandle === 'no' ? 'нет' : '' },
              ],
            })
          }}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="var(--line-strong)" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      {selected ? (
        <div className="flow-props">
          <div className="field">
            <label>Текст блока</label>
            <input
              value={selected.label}
              onChange={(e) =>
                patchNodes(algorithm.canvas_nodes.map((n) => (n.id === selected.id ? { ...n, label: e.target.value } : n)))
              }
            />
          </div>
          <div className="field">
            <label>Тип блока</label>
            <select
              value={selected.kind}
              onChange={(e) =>
                patchNodes(algorithm.canvas_nodes.map((n) => (n.id === selected.id ? { ...n, kind: e.target.value } : n)))
              }
            >
              {KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn danger"
            type="button"
            onClick={() => {
              updateAlgorithm(algorithm.id, {
                canvas_nodes: algorithm.canvas_nodes.filter((n) => n.id !== selected.id),
                canvas_edges: algorithm.canvas_edges.filter((e) => e.source !== selected.id && e.target !== selected.id),
              })
              setSelectedId(null)
            }}
          >
            Удалить блок
          </button>
        </div>
      ) : null}
    </div>
  )
}
