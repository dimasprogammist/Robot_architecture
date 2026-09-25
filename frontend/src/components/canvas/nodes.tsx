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
import { TypeIcon } from '../TypeIcon'
import type { Component } from '../../types'

// ---- ArchNode: a software/hardware component box -------------------------------

export type ArchNodeData = { component: Component }
export type ArchRFNode = Node<ArchNodeData, 'arch'>

export function ArchNode({ data, selected }: NodeProps<ArchRFNode>) {
  const c = data.component
  return (
    <div className={`arch-node handle-hidden tone-${c.category} ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Top} />
      <div className="kicker">
        <span className={`cat-${c.category}`}>{c.type}</span>
        <span className={`status-dot ${c.status}`} />
      </div>
      <h4>{c.name}</h4>
      <div className="meta">
        <TypeIcon name={c.icon} /> {c.technology || c.category.toLowerCase()}
        {c.nested_architecture_id ? ' · вложенный' : ''}
      </div>
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

// ---- TableNode: a database table box --------------------------------------------

export type TableRFNode = Node<{ component: Component }, 'table'>

export function TableNode({ data, selected }: NodeProps<TableRFNode>) {
  const c = data.component
  const cols = c.table?.columns || []
  return (
    <div className={`table-node handle-hidden ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <header>{c.name}</header>
      {cols.slice(0, 8).map((col) => (
        <div className="col" key={col.id}>
          <span>{col.name}</span>
          <span>
            {col.primary_key ? 'ключ ' : ''}
            {col.type}
          </span>
        </div>
      ))}
      {!cols.length ? <div className="col">нет колонок</div> : null}
      <Handle type="source" position={Position.Right} />
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
