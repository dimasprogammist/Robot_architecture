// Small React Flow rendering primitives (node types + edge type) used
// together by ArchitectureCanvas — kept in one file since each is only a
// few lines and they only ever make sense alongside one another.

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Handle,
  NodeResizer,
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
import { catalogLook, presetColor } from '../../model/library'
import { clampStripeWidth, typeDefaultSize } from '../../model/cardSize'
import { handleOffsetStyle, rfTerminalHandleIds, terminalClass, terminalTooltip, terminalsFor } from '../../model/terminals'
import type { Component, LibraryPreset } from '../../types'

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
            <Handle
              type="target"
              id={`${id}-tgt`}
              position={position}
              className="nodrag nopan"
              isConnectableStart
              isConnectableEnd
            />
            <Handle
              type="source"
              id={`${id}-src`}
              position={position}
              className="nodrag nopan"
              isConnectableStart
              isConnectableEnd
            />
          </span>
        )
      })}
    </>
  )
}

function signalBadge(c: Component) {
  const extra = c.extra_fields || {}
  const signal = extra.signal_type?.trim()
  if (signal === 'аналоговый' && extra.analog_range) return extra.analog_range
  if (signal === 'дискретный') return extra.discrete_kind || 'DI'
  if (signal === 'ШИМ' || signal === 'PWM') return 'PWM'
  if (signal === 'DI' || signal === 'DO') return signal
  return ''
}

function powerBadge(c: Component) {
  return (c.extra_fields || {}).power?.trim() || ''
}

function nodeExtra(c: Component) {
  const extra = c.extra_fields || {}
  const kind = extra.sensor_kind?.trim()
  const model = extra.model?.trim()
  const line = [kind || model || c.technology, signalBadge(c), powerBadge(c)].filter(Boolean).join(' · ')
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

function stripeStyle(c: Component, presets: LibraryPreset[]) {
  const preset = presets.find((item) => item.id === c.library_preset_id)
  const color = c.color || (preset ? presetColor(preset) : '') || c.color
  return {
    borderLeftColor: color,
    borderLeftWidth: clampStripeWidth(preset?.stripe_width),
  }
}

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
      style={stripeStyle(c, presets)}
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

export type PowerRFNode = Node<ArchNodeData, 'power'>

export function PowerNode({ data, selected }: NodeProps<PowerRFNode>) {
  const presets = useProjectStore((s) => s.project?.library_presets || [])
  const c = catalogLook(data.component, presets)
  const extra = nodeExtra(c)
  const terminals = terminalsFor(c)
  const min = typeDefaultSize(c)
  return (
    <div
      className={`arch-node power-node handle-hidden tone-${c.category} ${selected ? 'selected' : ''}`}
      style={{
        ...stripeStyle(c, presets),
        width: '100%',
        height: '100%',
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={min.width}
        minHeight={min.height}
        maxWidth={720}
        maxHeight={520}
        lineStyle={{ borderColor: 'var(--accent)' }}
        handleStyle={{ width: 10, height: 10, background: 'var(--accent)', zIndex: 40 }}
      />
      {terminals.map((term) => {
        const offset = handleOffsetStyle(term)
        const tip = terminalTooltip(term)
        const handles = rfTerminalHandleIds(term.id)
        return (
          <span key={term.id}>
            <Handle
              type="target"
              id={handles.target}
              position={term.position}
              className={`nodrag nopan ${terminalClass(term.kind)}`}
              style={offset}
              title={tip}
              isConnectableStart
              isConnectableEnd
            />
            <Handle
              type="source"
              id={handles.source}
              position={term.position}
              className={`nodrag nopan ${terminalClass(term.kind)}`}
              style={offset}
              title={tip}
              isConnectableStart
              isConnectableEnd
            />
            <span className={`term-label term-${term.position}`} style={offset} title={tip}>
              {term.label}
            </span>
          </span>
        )
      })}
      <div className="kicker">
        <span className={`cat-${c.category} node-class`}>
          <TypeIcon name={c.icon} size={13} />
          {c.type}
        </span>
      </div>
      <h4>{c.name}</h4>
      <div className="meta">{extra || CATEGORY_LABELS[c.category] || ''}</div>
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
