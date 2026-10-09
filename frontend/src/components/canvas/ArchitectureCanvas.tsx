import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { ArchNode, TableNode, PowerNode, LabeledEdge } from './nodes'
import { findTerminal, terminalCompatibility } from '../../model/terminals'
import { useProjectStore } from '../../store/useProjectStore'
import { useUiStore } from '../../store/useUiStore'
import { emptyTable, protocolColor } from '../../model/defaults'
import { clampStrokeWidth, protocolLabel } from '../../model/protocols'
import { clampCardSize, resolvedCardSize } from '../../model/cardSize'
import { restoreConnectionHandles } from '../../model/connections'
import { catalogLook, presetColor } from '../../model/library'
import { uid } from '../../lib/ids'
import type { Component, LibraryPreset } from '../../types'

const nodeTypes = { arch: ArchNode, table: TableNode, power: PowerNode }
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
    const t = window.setTimeout(
      () => fitView({ padding: 0.18, duration: useUiStore.getState().settings.reduce_motion ? 0 : 200 }),
      40,
    )
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
  const setInspectorTab = useUiStore((s) => s.setInspectorTab)
  const updateComponent = useProjectStore((s) => s.updateComponent)
  const deleteSelected = useProjectStore((s) => s.deleteSelected)
  const duplicateComponent = useProjectStore((s) => s.duplicateComponent)
  const [menu, setMenu] = useState<{ x: number; y: number; id: string; kind: 'table' | 'arch' } | null>(null)
  const [linkFrom, setLinkFrom] = useState<string | null>(null)
  const connectingRef = useRef(false)

  const canvasKind = project?.architectures.find((a) => a.id === architectureId)?.kind || 'system'

  const nodes = useMemo(() => {
    if (!project || !architectureId) return []
    return project.components
      .filter((c) => c.architecture_id === architectureId)
      .map((c) => ({
        id: c.id,
        type:
          canvasKind === 'power'
            ? ('power' as const)
            : c.entity_kind === 'table'
              ? ('table' as const)
              : ('arch' as const),
        position: c.position,
        selected: selectedIds.includes(c.id),
        data: { component: c },
        ...(canvasKind === 'power'
          ? (() => {
              const size = resolvedCardSize(c)
              return { style: { width: size.width, height: size.height }, width: size.width, height: size.height }
            })()
          : c.width && c.height
            ? { style: { width: c.width, height: c.height }, width: c.width, height: c.height }
            : {}),
      }))
  }, [project, architectureId, selectedIds, canvasKind])

  const edges = useMemo(() => {
    if (!project || !architectureId) return []
    return project.connections
      .filter((c) => c.architecture_id === architectureId)
      .map((c) => ({
        id: c.id,
        source: c.source,
        target: c.target,
        ...restoreConnectionHandles(c),
        type: 'labeled' as const,
        selected: selectedConnectionId === c.id,
        markerEnd: { type: 'arrowclosed' as const },
        markerStart: c.direction === 'bidirectional' ? { type: 'arrowclosed' as const } : undefined,
        style: {
          stroke: protocolColor(
            c.protocol_name,
            c.color || project.protocols.find((p) => p.name === c.protocol_name)?.color,
            settings.theme,
          ),
          strokeWidth: clampStrokeWidth(project.protocols.find((p) => p.name === c.protocol_name)?.stroke_width),
          strokeDasharray: c.kind === 'data_flow' ? '6 4' : undefined,
        },
        data: {
          label: settings.show_edge_labels
            ? protocolLabel(c.protocol_name) ||
              ({ one_to_one: 'один к одному', one_to_many: 'один ко многим', many_to_many: 'многие ко многим' } as Record<string, string>)[c.cardinality] ||
              ''
            : '',
          kind: c.kind,
          bidirectional: c.direction === 'bidirectional',
        },
      }))
  }, [project, architectureId, selectedConnectionId, settings.theme, settings.show_edge_labels])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const pos = changes.filter((c) => c.type === 'position' && 'position' in c && c.position)
      const dims = changes.filter(
        (c) =>
          c.type === 'dimensions' &&
          'dimensions' in c &&
          c.dimensions &&
          'resizing' in c &&
          c.resizing !== undefined,
      )
      if (connectingRef.current) {
        if (!pos.length) return
      }
      if (!pos.length && !dims.length) return
      mutate((p) => {
        for (const c of pos) {
          if (c.type !== 'position' || !c.position) continue
          const node = p.components.find((x) => x.id === c.id)
          if (node) node.position = { x: c.position.x, y: c.position.y }
        }
        if (connectingRef.current) return
        for (const c of dims) {
          if (c.type !== 'dimensions' || !c.dimensions) continue
          const node = p.components.find((x) => x.id === c.id)
          if (!node) continue
          const size = clampCardSize(node, c.dimensions.width, c.dimensions.height)
          node.width = size.width
          node.height = size.height
        }
      }, { history: pos.some((c) => c.type === 'position' && c.dragging === false) || dims.some((c) => c.type === 'dimensions' && c.resizing === false) })
    },
    [mutate],
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
      if (canvasKind === 'power' && project) {
        const src = project.components.find((c) => c.id === params.source)
        const tgt = project.components.find((c) => c.id === params.target)
        const srcTerm = src ? findTerminal(src, params.sourceHandle) : undefined
        const tgtTerm = tgt ? findTerminal(tgt, params.targetHandle) : undefined
        if (srcTerm && tgtTerm) {
          const check = terminalCompatibility(srcTerm, tgtTerm)
          if (!check.allowed) {
            window.alert(check.warning || 'Эти выводы несовместимы.')
            return
          }
          if (check.warning && !window.confirm(`${check.warning}\n\nСоздать соединение всё равно?`)) {
            return
          }
        }
      }
      connect(params.source, params.target, 'connection', {
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      })
      addEdge(params, [])
    },
    [connect, canvasKind, project],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const raw = e.dataTransfer.getData('application/architecture-preset')
      if (!raw) return
      const preset = JSON.parse(raw) as LibraryPreset
      if (preset.category === 'PROTOCOL') return
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
        onConnectStart={() => {
          connectingRef.current = true
        }}
        onConnectEnd={() => {
          connectingRef.current = false
        }}
        connectionRadius={28}
        onPaneClick={() => {
          select([])
          setMenu(null)
        }}
        onNodeClick={(event, node) => {
          const target = event.target as HTMLElement | null
          if (target?.closest('.react-flow__handle')) return
          if (connectingRef.current) return
          if (linkFrom && linkFrom !== node.id) {
            connect(linkFrom, node.id)
            setLinkFrom(null)
            return
          }
          select([node.id])
        }}
        onNodeContextMenu={(event, node) => {
          const comp = project?.components.find((c) => c.id === node.id)
          if (!comp) return
          event.preventDefault()
          setMenu({
            x: event.clientX,
            y: event.clientY,
            id: node.id,
            kind: comp.entity_kind === 'table' ? 'table' : 'arch',
          })
        }}
        onNodeDoubleClick={(_, node) => {
          const comp = project?.components.find((c) => c.id === node.id)
          const mechanicalSystem =
            comp?.type === 'Механическая система' ||
            comp?.type === 'Механический узел' ||
            comp?.name === 'Механическая система'
          if (!mechanicalSystem) {
            select([node.id])
            return
          }
          enterComponent(node.id)
        }}
        onEdgeClick={(_, edge) => select([], edge.id)}
        connectionMode={ConnectionMode.Loose}
        connectOnClick
        nodesConnectable
        selectNodesOnDrag={false}
        snapToGrid={settings.snap_to_grid}
        snapGrid={[settings.grid_size, settings.grid_size]}
        fitView
        style={{ width: '100%', height: '100%' }}
        deleteKeyCode={null}
        multiSelectionKeyCode="Shift"
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        noPanClassName="nopan"
        noDragClassName="nodrag"
      >
        <FitViewOnData count={nodes.length} />
        {settings.show_grid ? (
          <Background
            variant={BackgroundVariant.Dots}
            gap={settings.grid_size}
            size={1}
            color="var(--line-strong)"
            bgColor="var(--canvas)"
          />
        ) : null}
        <Controls showInteractive={false} />
        {settings.show_minimap ? (
          <MiniMap
            pannable
            zoomable
            nodeStrokeWidth={2}
            nodeColor={(node) => {
              const component = (node.data as { component?: Component } | undefined)?.component
              if (component) {
                const looked = catalogLook(component, project?.library_presets || [])
                return looked.color || presetColor({ category: looked.category, color: looked.color })
              }
              if (node.type === 'table') return '#2a7aa8'
              if (node.type === 'power') return '#c47a2e'
              return '#2f8a6a'
            }}
          />
        ) : null}
      </ReactFlow>
      {linkFrom ? <p className="hint" style={{ position: 'absolute', top: 56, left: 56 }}>Выберите вторую таблицу, чтобы создать связь.</p> : null}
      {menu?.kind === 'table' ? (
        <TableMenu
          x={menu.x}
          y={menu.y}
          onProperties={() => {
            select([menu.id])
            setInspectorTab('table')
            setMenu(null)
          }}
          onRename={() => {
            const current = project?.components.find((c) => c.id === menu.id)
            const name = window.prompt('Новое имя таблицы', current?.name || '')
            if (name && name.trim()) updateComponent(menu.id, { name: name.trim() })
            setMenu(null)
          }}
          onAddColumn={() => {
            const current = project?.components.find((c) => c.id === menu.id)
            const table = current?.table || emptyTable()
            updateComponent(menu.id, {
              entity_kind: 'table',
              table: {
                ...table,
                columns: [
                  ...table.columns,
                  { id: uid(), name: 'column', type: 'TEXT', nullable: true, default: '', primary_key: false, unique: false, foreign_key: '', description: '' },
                ],
              },
            })
            select([menu.id])
            setInspectorTab('table')
            setMenu(null)
          }}
          onLink={() => {
            setLinkFrom(menu.id)
            setMenu(null)
          }}
          onDelete={() => {
            if (
              useUiStore.getState().settings.confirm_delete &&
              !window.confirm('Удалить выбранный элемент?')
            ) {
              setMenu(null)
              return
            }
            select([menu.id])
            deleteSelected()
            setMenu(null)
          }}
        />
      ) : null}
      {menu?.kind === 'arch' ? (
        <ArchMenu
          x={menu.x}
          y={menu.y}
          onProperties={() => {
            select([menu.id])
            setInspectorTab('overview')
            setMenu(null)
          }}
          onRename={() => {
            const current = project?.components.find((c) => c.id === menu.id)
            const name = window.prompt('Новое имя элемента', current?.name || '')
            if (name && name.trim()) updateComponent(menu.id, { name: name.trim() })
            setMenu(null)
          }}
          onDuplicate={() => {
            duplicateComponent(menu.id)
            setMenu(null)
          }}
          onNested={() => {
            enterComponent(menu.id)
            setMenu(null)
          }}
          onDelete={() => {
            if (
              useUiStore.getState().settings.confirm_delete &&
              !window.confirm('Удалить выбранный элемент?')
            ) {
              setMenu(null)
              return
            }
            select([menu.id])
            deleteSelected()
            setMenu(null)
          }}
        />
      ) : null}
    </div>
  )
}

function ArchMenu({
  x,
  y,
  onProperties,
  onRename,
  onDuplicate,
  onNested,
  onDelete,
}: {
  x: number
  y: number
  onProperties: () => void
  onRename: () => void
  onDuplicate: () => void
  onNested: () => void
  onDelete: () => void
}) {
  return (
    <div className="ctx-menu" style={{ left: x, top: y }}>
      <button type="button" onClick={onProperties}>Открыть свойства</button>
      <button type="button" onClick={onRename}>Изменить</button>
      <button type="button" onClick={onDuplicate}>Дублировать</button>
      <button type="button" onClick={onNested}>Открыть внутреннюю архитектуру</button>
      <button type="button" className="danger" onClick={onDelete}>Удалить</button>
    </div>
  )
}

function TableMenu({
  x,
  y,
  onProperties,
  onRename,
  onAddColumn,
  onLink,
  onDelete,
}: {
  x: number
  y: number
  onProperties: () => void
  onRename: () => void
  onAddColumn: () => void
  onLink: () => void
  onDelete: () => void
}) {
  return (
    <div className="ctx-menu" style={{ left: x, top: y }}>
      <button type="button" onClick={onProperties}>Открыть свойства</button>
      <button type="button" onClick={onRename}>Переименовать</button>
      <button type="button" onClick={onAddColumn}>Добавить колонку</button>
      <button type="button" onClick={onLink}>Создать связь</button>
      <button type="button" className="danger" onClick={onDelete}>Удалить таблицу</button>
    </div>
  )
}
