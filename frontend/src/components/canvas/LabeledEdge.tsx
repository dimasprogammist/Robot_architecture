import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react'

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
