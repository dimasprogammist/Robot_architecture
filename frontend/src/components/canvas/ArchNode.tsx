import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { TypeIcon } from '../TypeIcon'
import type { Component } from '../../types'

export type ArchNodeData = { component: Component }

export type ArchRFNode = Node<ArchNodeData, 'arch'>

export function ArchNode({ data, selected }: NodeProps<ArchRFNode>) {
  const c = data.component
  return (
    <div className={`arch-node handle-hidden ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Top} />
      <div className="kicker">
        <span className={`cat-${c.category}`}>{c.type}</span>
        <span className={`status-dot ${c.status}`} />
      </div>
      <h4>{c.name}</h4>
      <div className="meta">
        <TypeIcon name={c.icon} /> {c.technology || c.category.toLowerCase()}
        {c.nested_architecture_id ? ' · nested' : ''}
      </div>
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
