import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
} from '@xyflow/react'
import { useProjectStore } from '../../store/useProjectStore'
import { uid } from '../../lib/ids'
import { FitViewOnCanvas } from './FitViewOnCanvas'
import { LabeledEdge } from './nodes'
import { cancelCanvasFit } from '../../model/canvasMotion'
import {
  collectPersistableNodeChanges,
  positionNeedsWrite,
  reuseRfById,
  selectionIdsEqual,
} from '../../model/canvasNodeSync'

const EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  width: 18,
  height: 18,
  strokeWidth: 1.4,
  markerUnits: 'userSpaceOnUse',
} as const

const KINDS = [
  { id: 'start', label: 'Начало' },
  { id: 'action', label: 'Действие' },
  { id: 'condition', label: 'Условие' },
  { id: 'end', label: 'Конец' },
] as const

function FlowBlock({ data }: NodeProps) {
  const kind = String(data.kind || 'action')
  if (kind === 'condition') {
    return (
      <div className="flow-block flow-condition">
        <Handle type="target" position={Position.Top} className="flow-port nodrag nopan" style={{ top: -2 }} />
        <div className="flow-diamond" aria-hidden />
        <span className="flow-condition-text">{String(data.label || '')}</span>
        <Handle id="yes" type="source" position={Position.Bottom} className="flow-port nodrag nopan" style={{ bottom: -2 }} />
        <span className="flow-cap flow-cap-yes">Да</span>
        <Handle id="no" type="source" position={Position.Right} className="flow-port nodrag nopan" style={{ right: -2 }} />
        <span className="flow-cap flow-cap-no">Нет</span>
      </div>
    )
  }
  return (
    <div className={`flow-block flow-${kind}`}>
      <Handle type="target" position={Position.Top} className="flow-port nodrag nopan" />
      <span>{String(data.label || '')}</span>
      <Handle type="source" position={Position.Bottom} className="flow-port nodrag nopan" />
    </div>
  )
}

const nodeTypes = { flow: FlowBlock }
const edgeTypes = { labeled: LabeledEdge }
const MULTI_SELECTION_KEYS = ['Control', 'Meta']
const DELETE_KEYS = ['Backspace', 'Delete']

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
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const clickSelectRef = useRef(false)

  const neighborIds = useMemo(() => {
    const ids = new Set<string>()
    const picked = new Set(selectedIds)
    for (const edge of algorithm?.canvas_edges || []) {
      if (picked.has(edge.source)) ids.add(edge.target)
      if (picked.has(edge.target)) ids.add(edge.source)
    }
    selectedIds.forEach((id) => ids.delete(id))
    return ids
  }, [algorithm, selectedIds])

  const nodesRaw: Node[] = useMemo(
    () =>
      (algorithm?.canvas_nodes || []).map((n) => ({
        id: n.id,
        type: 'flow',
        position: n.position,
        data: { label: n.label, kind: n.kind },
        selected: selectedIds.includes(n.id),
        className: neighborIds.has(n.id) ? 'is-linked' : undefined,
      })),
    [algorithm, selectedIds, neighborIds],
  )
  const nodesPrev = useRef<Node[]>([])
  const nodes = reuseRfById(nodesPrev.current, nodesRaw, (a, b) =>
    a.selected === b.selected &&
    a.className === b.className &&
    a.position === b.position &&
    a.data?.label === b.data?.label &&
    a.data?.kind === b.data?.kind,
  )
  nodesPrev.current = nodes

  const edgesRaw: Edge[] = useMemo(
    () =>
      (algorithm?.canvas_edges || []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'labeled' as const,
        sourceHandle: e.label === 'нет' ? 'no' : e.label === 'да' ? 'yes' : undefined,
        data: { label: e.label },
        selected: selectedIds.length === 0 ? false : selectedIds.includes(e.source) && selectedIds.includes(e.target),
        markerEnd: EDGE_MARKER,
        style:
          selectedIds.includes(e.source) || selectedIds.includes(e.target)
            ? { strokeWidth: 2.4 }
            : undefined,
      })),
    [algorithm, selectedIds],
  )
  const edgesPrev = useRef<Edge[]>([])
  const edges = reuseRfById(edgesPrev.current, edgesRaw, (a, b) =>
    a.selected === b.selected &&
    a.source === b.source &&
    a.target === b.target &&
    a.sourceHandle === b.sourceHandle &&
    a.data?.label === b.data?.label &&
    a.style?.strokeWidth === b.style?.strokeWidth,
  )
  edgesPrev.current = edges

  const algorithmIdRef = useRef(algorithmId)
  algorithmIdRef.current = algorithmId

  const onMoveStart = useCallback((event: MouseEvent | TouchEvent | null) => {
    if (event) cancelCanvasFit()
  }, [])

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const additive = event.ctrlKey || event.metaKey
    clickSelectRef.current = true
    window.requestAnimationFrame(() => {
      clickSelectRef.current = false
    })
    setSelectedIds((current) => {
      if (additive) {
        return current.includes(node.id) ? current.filter((id) => id !== node.id) : [...current, node.id]
      }
      return selectionIdsEqual(current, [node.id]) ? current : [node.id]
    })
  }, [])

  const onSelectionChange = useCallback(({ nodes: picked }: { nodes: { id: string }[] }) => {
    const ids = picked.map((n) => n.id)
    if (!ids.length) return
    setSelectedIds((current) => {
      if (clickSelectRef.current) {
        if (current.length > ids.length && ids.every((id) => current.includes(id))) return current
      }
      return selectionIdsEqual(current, ids) ? current : ids
    })
  }, [])

  const onPaneClick = useCallback(() => setSelectedIds([]), [])

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const state = useProjectStore.getState()
    const alg = state.project?.algorithms.find((a) => a.id === algorithmIdRef.current)
    if (!alg) return
    const collected = collectPersistableNodeChanges(changes, false)
    const removed = changes.filter((c) => c.type === 'remove').map((c) => c.id)
    const moved = collected.positions.filter((c) => {
      const node = alg.canvas_nodes.find((n) => n.id === c.id)
      return node && positionNeedsWrite(node.position, c)
    })
    if (!moved.length && !removed.length) return
    if (removed.length) {
      state.updateAlgorithm(alg.id, {
        canvas_nodes: alg.canvas_nodes.filter((n) => !removed.includes(n.id)),
        canvas_edges: alg.canvas_edges.filter((e) => !removed.includes(e.source) && !removed.includes(e.target)),
      })
      return
    }
    state.updateAlgorithm(alg.id, {
      canvas_nodes: alg.canvas_nodes.map((n) => {
        const ch = moved.find((c) => c.id === n.id)
        return ch ? { ...n, position: { x: ch.x, y: ch.y } } : n
      }),
    })
  }, [])

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    const removed = changes.filter((c) => c.type === 'remove').map((c) => ('id' in c ? c.id : ''))
    if (!removed.length) return
    const state = useProjectStore.getState()
    const alg = state.project?.algorithms.find((a) => a.id === algorithmIdRef.current)
    if (!alg) return
    state.updateAlgorithm(alg.id, {
      canvas_edges: alg.canvas_edges.filter((e) => !removed.includes(e.id)),
    })
  }, [])

  const onConnect = useCallback((c: { source: string | null; target: string | null; sourceHandle?: string | null }) => {
    if (!c.source || !c.target) return
    const state = useProjectStore.getState()
    const alg = state.project?.algorithms.find((a) => a.id === algorithmIdRef.current)
    if (!alg) return
    const label = c.sourceHandle === 'no' ? 'нет' : c.sourceHandle === 'yes' ? 'да' : ''
    state.updateAlgorithm(alg.id, {
      canvas_edges: [...alg.canvas_edges, { id: uid(), source: c.source, target: c.target, label }],
    })
  }, [])

  if (!algorithm) return null
  const selected = selectedIds.length === 1 ? algorithm.canvas_nodes.find((n) => n.id === selectedIds[0]) : undefined

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
          edgeTypes={edgeTypes}
          onMoveStart={onMoveStart}
          onNodeClick={onNodeClick}
          onSelectionChange={onSelectionChange}
          onPaneClick={onPaneClick}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          deleteKeyCode={DELETE_KEYS}
          multiSelectionKeyCode={MULTI_SELECTION_KEYS}
        >
          <FitViewOnCanvas canvasKey={`algo:${algorithmId}`} />
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
              setSelectedIds([])
            }}
          >
            Удалить блок
          </button>
        </div>
      ) : selectedIds.length > 1 ? (
        <div className="flow-props">
          <p className="hint">Выбрано блоков: {selectedIds.length}. Групповое редактирование текста недоступно.</p>
        </div>
      ) : null}
    </div>
  )
}
