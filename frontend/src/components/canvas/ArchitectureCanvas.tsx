import { useCallback, useEffect, useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type OnConnect,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ArchNode } from './ArchNode'
import { LabeledEdge } from './LabeledEdge'
import { useProjectStore } from '../../store/useProjectStore'
import { useUiStore } from '../../store/useUiStore'
import type { LibraryPreset } from '../../types'

const nodeTypes = { arch: ArchNode }
const edgeTypes = { labeled: LabeledEdge }

export function ArchitectureCanvas() {
  return (
    <ReactFlowProvider>
      <ArchitectureCanvasInner />
    </ReactFlowProvider>
  )
}

function FitViewOnData({ count }: { count: number }) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    const t = window.setTimeout(() => fitView({ padding: 0.18, duration: 200 }), 40)
    return () => window.clearTimeout(t)
  }, [fitView, count])
  return null
}

function ArchitectureCanvasInner() {
  const { screenToFlowPosition } = useReactFlow()
  const project = useProjectStore((s) => s.project)
  const architectureId = useProjectStore((s) => s.architectureId)
  const selectedIds = useProjectStore((s) => s.selectedIds)
  const selectedConnectionId = useProjectStore((s) => s.selectedConnectionId)
  const mutate = useProjectStore((s) => s.mutate)
  const connect = useProjectStore((s) => s.connect)
  const select = useProjectStore((s) => s.select)
  const enterComponent = useProjectStore((s) => s.enterComponent)
  const addFromPreset = useProjectStore((s) => s.addFromPreset)
  const settings = useUiStore((s) => s.settings)

  const nodes = useMemo(() => {
    if (!project || !architectureId) return []
    return project.components
      .filter((c) => c.architecture_id === architectureId)
      .map((c) => ({
        id: c.id,
        type: 'arch' as const,
        position: c.position,
        selected: selectedIds.includes(c.id),
        data: { component: c },
      }))
  }, [project, architectureId, selectedIds])

  const edges = useMemo(() => {
    if (!project || !architectureId) return []
    return project.connections
      .filter((c) => c.architecture_id === architectureId)
      .map((c) => ({
        id: c.id,
        source: c.source,
        target: c.target,
        type: 'labeled' as const,
        selected: selectedConnectionId === c.id,
        markerEnd: { type: 'arrowclosed' as const },
        markerStart: c.direction === 'bidirectional' ? { type: 'arrowclosed' as const } : undefined,
        style: {
          stroke: c.kind === 'data_flow' ? '#355f7a' : 'var(--muted)',
          strokeDasharray: c.kind === 'data_flow' ? '6 4' : undefined,
        },
        data: {
          label: c.protocol_name || (c.kind === 'data_flow' ? c.data_format || 'data' : ''),
          kind: c.kind,
          bidirectional: c.direction === 'bidirectional',
        },
      }))
  }, [project, architectureId, selectedConnectionId])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const pos = changes.filter((c) => c.type === 'position' && 'position' in c && c.position)
      const selectChanges = changes.filter((c) => c.type === 'select')
      if (selectChanges.length) {
        const selected = new Set(selectedIds)
        for (const c of selectChanges) {
          if (c.type === 'select') {
            if (c.selected) selected.add(c.id)
            else selected.delete(c.id)
          }
        }
        select([...selected])
      }
      if (!pos.length) return
      mutate((p) => {
        for (const c of pos) {
          if (c.type !== 'position' || !c.position) continue
          const node = p.components.find((x) => x.id === c.id)
          if (node) node.position = { x: c.position.x, y: c.position.y }
        }
      }, { history: pos.some((c) => c.type === 'position' && c.dragging === false) })
    },
    [mutate, select, selectedIds],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const sel = changes.find((c) => c.type === 'select' && c.selected)
      if (sel && sel.type === 'select') select([], sel.id)
      const removed = changes.filter((c) => c.type === 'remove')
      if (removed.length) {
        mutate((p) => {
          const drop = new Set(removed.map((c) => c.id))
          p.connections = p.connections.filter((e) => !drop.has(e.id))
        })
      }
    },
    [mutate, select],
  )

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return
      connect(params.source, params.target)
      addEdge(params, [])
    },
    [connect],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const raw = e.dataTransfer.getData('application/architecture-preset')
      if (!raw) return
      const preset = JSON.parse(raw) as LibraryPreset
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      addFromPreset(preset, position)
    },
    [addFromPreset, screenToFlowPosition],
  )

  return (
    <div className="canvas-wrap" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={() => select([])}
        onNodeDoubleClick={(_, node) => enterComponent(node.id)}
        onEdgeClick={(_, edge) => select([], edge.id)}
        connectionMode={ConnectionMode.Loose}
        snapToGrid={settings.snap_to_grid}
        snapGrid={[settings.grid_size, settings.grid_size]}
        fitView
        style={{ width: '100%', height: '100%' }}
        deleteKeyCode={null}
        multiSelectionKeyCode="Shift"
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
      >
        <FitViewOnData count={nodes.length} />
        {settings.show_grid ? (
          <Background
            variant={BackgroundVariant.Dots}
            gap={settings.grid_size}
            size={1}
            color="var(--line-strong)"
          />
        ) : null}
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  )
}
