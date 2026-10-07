// Small React Flow rendering primitives (node types + edge type) used
// together by ArchitectureCanvas — kept in one file since each is only a
// few lines and they only ever make sense alongside one another.

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Handle,
  Position,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import { FileText, KeyRound, Layers2 } from 'lucide-react'
import { TypeIcon } from '../TypeIcon'
import { useProjectStore } from '../../store/useProjectStore'
import { CATEGORY_LABELS } from '../../i18n'
import { catalogLook } from '../../model/library'
import type { Component } from '../../types'

const ARCH_SIDES = [Position.Top, Position.Right, Position.Bottom, Position.Left] as const

const SIDE_ID: Record<Position, string> = {
  [Position.Top]: 'top',
  [Position.Right]: 'right',
  [Position.Bottom]: 'bottom',
  [Position.Left]: 'left',
}

function NodePorts({ sides }: { sides: readonly Position[] }) {
  return (
    <>
      {sides.map((position) => {
        const id = SIDE_ID[position]
        return (
          <span key={id}>
            <Handle type="target" id={`${id}-tgt`} position={position} />
            <Handle type="source" id={`${id}-src`} position={position} />
          </span>
        )
      })}
    </>
  )
}

function nodeExtra(c: Component) {
  const extra = c.extra_fields || {}
  const kind = extra.sensor_kind?.trim()
  const model = extra.model?.trim()
  const line = kind || model || c.technology
  if (!line || line === c.type) return ''
  return line
}

function FileBadge({ count }: { count: number }) {
  if (count < 1) return null
  return (
    <span
      className="node-file-badge"
      title={count === 1 ? 'Прикреплён 1 файл' : `Прикреплённых файлов: ${count}`}
    >
      <FileText size={11} />
    </span>
  )
}

// ---- ArchNode: a software/hardware component box -------------------------------

export type ArchNodeData = { component: Component }
export type ArchRFNode = Node<ArchNodeData, 'arch'>

export function ArchNode({ data, selected }: NodeProps<ArchRFNode>) {
  const presets = useProjectStore((s) => s.project?.library_presets || [])
  const c = catalogLook(data.component, presets)
  const extra = nodeExtra(c)
  const files = c.files?.length ?? 0
  const nestedId = c.nested_architecture_id
  const hasNestedContent = useProjectStore((s) =>
    Boolean(nestedId && s.project?.components.some((item) => item.architecture_id === nestedId)),
  )
  return (
    <div
      className={`arch-node handle-hidden tone-${c.category} ${selected ? 'selected' : ''}`}
      style={{ borderLeftColor: c.color }}
    >
      <NodePorts sides={ARCH_SIDES} />
      <div className="kicker">
        <span className={`cat-${c.category} node-class`}>
          <TypeIcon name={c.icon} size={13} />
          {c.type}
        </span>
        <span className="kicker-end">
          {hasNestedContent ? (
            <span className="node-nested-badge" title="Элемент содержит внутреннюю архитектуру">
              <Layers2 size={12} />
            </span>
          ) : null}
          <FileBadge count={files} />
          <span className={`status-dot ${c.status}`} />
        </span>
      </div>
      <h4>{c.name}</h4>
      <div className="meta">
        {extra || CATEGORY_LABELS[c.category] || c.category.toLowerCase()}
      </div>
    </div>
  )
}

// ---- TableNode: a database table box --------------------------------------------

export type TableRFNode = Node<{ component: Component }, 'table'>

export function TableNode({ data, selected }: NodeProps<TableRFNode>) {
  const c = data.component
  const cols = c.table?.columns || []
  const files = c.files?.length ?? 0
  return (
    <div className={`table-node handle-hidden ${selected ? 'selected' : ''}`}>
      <NodePorts sides={ARCH_SIDES} />
      <header>
        {c.name}
        <FileBadge count={files} />
      </header>
      {cols.slice(0, 8).map((col) => (
        <div className={`col ${col.primary_key ? 'is-key' : ''}`} key={col.id}>
          <span className="col-name">
            {col.primary_key ? (
              <span className="col-key" title="Первичный ключ">
                <KeyRound size={11} />
              </span>
            ) : null}
            {col.name}
          </span>
          <span>{col.type}</span>
        </div>
      ))}
      {!cols.length ? <div className="col">нет колонок</div> : null}
    </div>
  )
}

// ---- LabeledEdge: a connection/data-flow edge with an optional label -----------

export type LabeledEdgeData = {
  label?: string
  kind?: string
  bidirectional?: boolean
}

export type LabeledRFEdge = Edge<LabeledEdgeData, 'labeled'>

export function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  markerStart,
  style,
}: EdgeProps<LabeledRFEdge>) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })
  const label = data?.label
  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} markerStart={markerStart} style={style} />
      {label ? (
        <EdgeLabelRenderer>
          <div
            className="edge-label nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  )
}
