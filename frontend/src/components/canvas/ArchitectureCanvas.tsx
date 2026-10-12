import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  addEdge,
  useStoreApi,
  type Connection,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnConnect,
  type OnSelectionChangeFunc,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ArchNode, TableNode, PowerNode, LabeledEdge } from './nodes'
import { findTerminal, terminalCompatibility } from '../../model/terminals'
import { useProjectStore } from '../../store/useProjectStore'
import { useUiStore } from '../../store/useUiStore'
import { emptyTable, protocolColor } from '../../model/defaults'
import { clampStrokeWidth, protocolLabel } from '../../model/protocols'
import { clampCardSize, electricalCardSize } from '../../model/cardSize'
import { SchemeMiniMap } from './SchemeMiniMap'
import { FitViewOnCanvas } from './FitViewOnCanvas'
import { cancelCanvasFit } from '../../model/canvasMotion'
import { restoreConnectionHandles } from '../../model/connections'
import {
  collectPersistableNodeChanges,
  positionNeedsWrite,
  reuseRfById,
  selectionIdsEqual,
  sizeNeedsWrite,
} from '../../model/canvasNodeSync'
import { uid } from '../../lib/ids'
import type { LibraryPreset } from '../../types'

const EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  width: 18,
  height: 18,
  strokeWidth: 1.4,
  markerUnits: 'userSpaceOnUse',
} as const

const nodeTypes = { arch: ArchNode, table: TableNode, power: PowerNode }
const edgeTypes = { labeled: LabeledEdge }
const PAN_ON_DRAG: [number, number] = [1, 2]
const MULTI_SELECTION_KEYS = ['Control', 'Meta']
const RF_STYLE = { width: '100%', height: '100%' }

export function ArchitectureCanvas() {
  return (
    <ReactFlowProvider>
      <ArchitectureCanvasInner />
    </ReactFlowProvider>
  )
}

function ArchitectureCanvasInner() {
  const storeApi = useStoreApi()
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
  const clickSelectRef = useRef(false)
  const resizingRef = useRef(false)
  const linkFromRef = useRef<string | null>(null)
  linkFromRef.current = linkFrom

  const canvasKind = project?.architectures.find((a) => a.id === architectureId)?.kind || 'system'

  const neighborIds = useMemo(() => {
    const ids = new Set<string>()
    if (!project || !architectureId || !selectedIds.length) return ids
    const picked = new Set(selectedIds)
    for (const link of project.connections) {
      if (link.architecture_id !== architectureId) continue
      if (picked.has(link.source)) ids.add(link.target)
      if (picked.has(link.target)) ids.add(link.source)
    }
    selectedIds.forEach((id) => ids.delete(id))
    return ids
  }, [project, architectureId, selectedIds])

  const nodesRaw = useMemo(() => {
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
        className: neighborIds.has(c.id) ? 'is-linked' : undefined,
        data: { component: c },
        ...(canvasKind === 'power'
          ? (() => {
              const size = electricalCardSize(c)
              return { style: { width: size.width, height: size.height, overflow: 'visible' }, width: size.width, height: size.height }
            })()
          : c.width && c.height
            ? { style: { width: c.width, height: c.height }, width: c.width, height: c.height }
            : {}),
      }))
  }, [project, architectureId, selectedIds, canvasKind, neighborIds])

  const nodesPrev = useRef<typeof nodesRaw>([])
  const nodes = reuseRfById(nodesPrev.current, nodesRaw, (a, b) =>
    a.selected === b.selected &&
    a.className === b.className &&
    a.type === b.type &&
    a.position === b.position &&
    ('width' in a ? a.width : undefined) === ('width' in b ? b.width : undefined) &&
    ('height' in a ? a.height : undefined) === ('height' in b ? b.height : undefined) &&
    a.data.component === b.data.component,
  )
  nodesPrev.current = nodes

  const edgesRaw = useMemo(() => {
    if (!project || !architectureId) return []
    return project.connections
      .filter((c) => c.architecture_id === architectureId)
      .map((c) => {
        const neighborEdge =
          selectedIds.includes(c.source) || selectedIds.includes(c.target) || selectedConnectionId === c.id
        const baseWidth = clampStrokeWidth(project.protocols.find((p) => p.name === c.protocol_name)?.stroke_width)
        return {
        id: c.id,
        source: c.source,
        target: c.target,
        ...restoreConnectionHandles(c),
        type: 'labeled' as const,
        selected: selectedConnectionId === c.id,
        markerEnd: EDGE_MARKER,
        markerStart: c.direction === 'bidirectional' ? EDGE_MARKER : undefined,
        style: {
          stroke: protocolColor(
            c.protocol_name,
            c.color || project.protocols.find((p) => p.name === c.protocol_name)?.color,
            settings.theme,
          ),
          strokeWidth: neighborEdge ? baseWidth + 1.25 : baseWidth,
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
      }
      })
  }, [project, architectureId, selectedConnectionId, selectedIds, settings.theme, settings.show_edge_labels])

  const edgesPrev = useRef<typeof edgesRaw>([])
  const edges = reuseRfById(edgesPrev.current, edgesRaw, (a, b) =>
    a.selected === b.selected &&
    a.source === b.source &&
    a.target === b.target &&
    a.sourceHandle === b.sourceHandle &&
    a.targetHandle === b.targetHandle &&
    a.style?.stroke === b.style?.stroke &&
    a.style?.strokeWidth === b.style?.strokeWidth &&
    a.data?.label === b.data?.label &&
    a.data?.kind === b.data?.kind &&
    a.markerStart === b.markerStart,
  )
  edgesPrev.current = edges

  const snapGrid = useMemo(
    () => [settings.grid_size, settings.grid_size] as [number, number],
    [settings.grid_size],
  )

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const collected = collectPersistableNodeChanges(changes, resizingRef.current)
      resizingRef.current = collected.resizing
      const pos = connectingRef.current
        ? collected.positions.filter((c) => c.dragging)
        : collected.positions
      const dims = connectingRef.current ? [] : collected.sizes
      if (!pos.length && !dims.length) return
      const project = useProjectStore.getState().project
      if (!project) return
      const writes: { id: string; position?: { x: number; y: number }; width?: number; height?: number }[] = []
      for (const c of pos) {
        const node = project.components.find((x) => x.id === c.id)
        if (!node || !positionNeedsWrite(node.position, c)) continue
        writes.push({ id: c.id, position: { x: c.x, y: c.y } })
      }
      for (const c of dims) {
        const node = project.components.find((x) => x.id === c.id)
        if (!node) continue
        const size = clampCardSize(node, c.width, c.height)
        if (!sizeNeedsWrite(node, size)) continue
        writes.push({ id: c.id, width: size.width, height: size.height })
      }
      if (!writes.length) return
      mutate((p) => {
        for (const write of writes) {
          const node = p.components.find((x) => x.id === write.id)
          if (!node) continue
          if (write.position) node.position = write.position
          if (write.width !== undefined) node.width = write.width
          if (write.height !== undefined) node.height = write.height
        }
      }, {
        history:
          pos.some((c) => c.dragging === false) ||
          (dims.length > 0 && !collected.resizing),
      })
    },
    [mutate],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const removed = changes.filter((c) => c.type === 'remove')
      if (!removed.length) return
      mutate((p) => {
        const drop = new Set(removed.map((c) => c.id))
        p.connections = p.connections.filter((e) => !drop.has(e.id))
      })
    },
    [mutate],
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
      const { transform, domNode } = storeApi.getState()
      const pane = domNode || (e.currentTarget as HTMLElement).querySelector('.react-flow')
      const rect = pane?.getBoundingClientRect()
      const [tx, ty, zoom] = transform
      const position = rect
        ? { x: (e.clientX - rect.left - tx) / zoom, y: (e.clientY - rect.top - ty) / zoom }
        : { x: e.clientX, y: e.clientY }
      const sourceId = e.dataTransfer.getData('application/architecture-source')
      if (sourceId) {
        useProjectStore.getState().placeArchitectureOnPower(sourceId, position)
        return
      }
      const raw = e.dataTransfer.getData('application/architecture-preset')
      if (!raw) return
      let preset: LibraryPreset
      try {
        preset = JSON.parse(raw) as LibraryPreset
      } catch (error) {
        console.error(error)
        return
      }
      if (!preset || preset.category === 'PROTOCOL') return
      addFromPreset(preset, position)
    },
    [addFromPreset, storeApi],
  )

  const onConnectStart = useCallback(() => {
    connectingRef.current = true
  }, [])

  const onConnectEnd = useCallback(() => {
    connectingRef.current = false
  }, [])

  const onPaneClick = useCallback(() => {
    select([])
    setMenu(null)
  }, [select])

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('.react-flow__handle')) return
      if (connectingRef.current) return
      const from = linkFrom
      if (from && from !== node.id) {
        connect(from, node.id)
        setLinkFrom(null)
        return
      }
      const additive = event.ctrlKey || event.metaKey
      const current = useProjectStore.getState().selectedIds
      clickSelectRef.current = true
      window.requestAnimationFrame(() => {
        clickSelectRef.current = false
      })
      if (additive) {
        select(current.includes(node.id) ? current.filter((id) => id !== node.id) : [...current, node.id])
      } else {
        select([node.id])
      }
    },
    [connect, linkFrom, select],
  )

  const onSelectionChange = useCallback<OnSelectionChangeFunc>(({ nodes: selectedNodes }) => {
    if (connectingRef.current || linkFromRef.current) return
    const ids = selectedNodes.map((n) => n.id)
    if (!ids.length) return
    const stored = useProjectStore.getState()
    if (stored.selectedConnectionId && !clickSelectRef.current) return
    if (clickSelectRef.current) {
      if (stored.selectedIds.length > ids.length && ids.every((id) => stored.selectedIds.includes(id))) return
    }
    if (selectionIdsEqual(stored.selectedIds, ids)) return
    stored.select(ids)
  }, [])

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const comp = useProjectStore.getState().project?.components.find((c) => c.id === node.id)
      if (!comp) return
      event.preventDefault()
      setMenu({
        x: event.clientX,
        y: event.clientY,
        id: node.id,
        kind: comp.entity_kind === 'table' ? 'table' : 'arch',
      })
    },
    [],
  )

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const comp = useProjectStore.getState().project?.components.find((c) => c.id === node.id)
      const mechanicalSystem =
        comp?.type === 'Механическая система' ||
        comp?.type === 'Механический узел' ||
        comp?.name === 'Механическая система'
      if (!mechanicalSystem) {
        select([node.id])
        return
      }
      enterComponent(node.id)
    },
    [enterComponent, select],
  )

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: { id: string }) => {
      select([], edge.id)
    },
    [select],
  )

  const onMoveStart = useCallback((event: MouseEvent | TouchEvent | null) => {
    if (event) cancelCanvasFit()
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <div className="canvas-wrap" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        connectionRadius={28}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onSelectionChange={onSelectionChange}
        onNodeContextMenu={onNodeContextMenu}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        connectionMode={ConnectionMode.Loose}
        connectOnClick
        nodesConnectable
        selectNodesOnDrag={false}
        snapToGrid={settings.snap_to_grid}
        snapGrid={snapGrid}
        style={RF_STYLE}
        deleteKeyCode={null}
        multiSelectionKeyCode={MULTI_SELECTION_KEYS}
        selectionMode={SelectionMode.Partial}
        panOnScroll
        selectionOnDrag
        panOnDrag={PAN_ON_DRAG}
        noPanClassName="nopan"
        noDragClassName="nodrag"
        onMoveStart={onMoveStart}
      >
        <FitViewOnCanvas canvasKey={`${project?.id || ''}:${architectureId || canvasKind}`} />
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
        {settings.show_minimap ? <SchemeMiniMap /> : null}
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
                  ...(table.columns || []),
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
