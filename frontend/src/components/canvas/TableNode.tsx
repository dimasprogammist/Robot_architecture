import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { Component } from '../../types'

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
            {col.primary_key ? 'PK ' : ''}
            {col.type}
          </span>
        </div>
      ))}
      {!cols.length ? <div className="col">нет колонок</div> : null}
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
