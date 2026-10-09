import { useMemo, useRef } from 'react'
import { distalPoint, numParam, solvePoses, worldPoint } from '../../model/mechanics/geometry'
import { KIND_LABEL } from '../../model/mechanics/catalog'
import { PX_PER_M } from '../../model/mechanics/units'
import type { MechElement, MechJointKind, MechanicsModel } from '../../model/mechanics/types'
import { useUiStore } from '../../store/useUiStore'

export function MechanicsCanvas({
  model,
  selectedId,
  connectKind,
  connectFrom,
  pan,
  zoom,
  onPan,
  onZoom,
  onSelect,
  onMoveRoot,
  onPickAnchor,
}: {
  model: MechanicsModel
  selectedId: string | null
  connectKind: MechJointKind | null
  connectFrom: { elementId: string; anchorId: string } | null
  pan: { x: number; y: number }
  zoom: number
  onPan: (pan: { x: number; y: number }) => void
  onZoom: (zoom: number) => void
  onSelect: (id: string | null) => void
  onMoveRoot: (id: string, x: number, y: number) => void
  onPickAnchor: (elementId: string, anchorId: string) => void
}) {
  const showGrid = useUiStore((s) => s.settings.show_grid)
  const reduceMotion = useUiStore((s) => s.settings.reduce_motion)
  const wrap = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null)
  const panDrag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const { poses } = useMemo(() => solvePoses(model), [model])
  const scale = PX_PER_M * zoom

  const toModel = (clientX: number, clientY: number) => {
    const rect = wrap.current!.getBoundingClientRect()
    return {
      x: (clientX - rect.left - pan.x) / scale,
      y: -(clientY - rect.top - pan.y) / scale,
    }
  }

  return (
    <div
      className="mech-canvas"
      ref={wrap}
      onWheel={(e) => {
        e.preventDefault()
        const next = Math.min(3, Math.max(0.25, zoom * (e.deltaY > 0 ? 0.92 : 1.08)))
        onZoom(next)
      }}
      onPointerDown={(e) => {
        if (e.button === 1 || e.button === 2) {
          panDrag.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
          ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
        }
      }}
      onPointerMove={(e) => {
        if (panDrag.current) {
          onPan({
            x: panDrag.current.panX + e.clientX - panDrag.current.x,
            y: panDrag.current.panY + e.clientY - panDrag.current.y,
          })
        }
        if (drag.current) {
          const m = toModel(e.clientX, e.clientY)
          onMoveRoot(drag.current.id, m.x - drag.current.dx, m.y - drag.current.dy)
        }
      }}
      onPointerUp={() => {
        drag.current = null
        panDrag.current = null
      }}
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('mech-svg')) onSelect(null)
      }}
    >
      <svg className="mech-svg" width="100%" height="100%">
        <g transform={`translate(${pan.x} ${pan.y}) scale(${scale} ${-scale})`}>
          {showGrid ? <Grid /> : null}
          {model.trail_on && model.trail.length > 1 ? (
            <polyline
              className="mech-trail"
              fill="none"
              stroke="var(--accent)"
              strokeWidth={0.004}
              points={model.trail.map((p) => `${p.x},${p.y}`).join(' ')}
            />
          ) : null}
          {model.elements.map((el) => {
            const pose = poses.get(el.id)
            if (!pose) return null
            const selected = selectedId === el.id
            const child = model.joints.some((j) => j.child_id === el.id)
            return (
              <g
                key={el.id}
                className={`mech-el ${selected ? 'is-selected' : ''}`}
                transform={`translate(${pose.x} ${pose.y}) rotate(${(pose.theta * 180) / Math.PI})`}
                onPointerDown={(e) => {
                  if (connectKind) return
                  e.stopPropagation()
                  onSelect(el.id)
                  if (!child && e.button === 0) {
                    const m = toModel(e.clientX, e.clientY)
                    drag.current = { id: el.id, dx: m.x - el.x, dy: m.y - el.y }
                    ;(e.currentTarget as SVGGElement).setPointerCapture(e.pointerId)
                  }
                }}
              >
                <ElementShape el={el} selected={selected} showDims={model.show_dims} showAxes={model.show_axes} />
                {el.anchors.map((a) => (
                  <circle
                    key={a.id}
                    className={`mech-anchor ${connectFrom?.elementId === el.id && connectFrom.anchorId === a.id ? 'is-from' : ''}`}
                    cx={a.x}
                    cy={a.y}
                    r={Math.max(0.012, 9 / scale)}
                    data-el={el.id}
                    data-anchor={a.id}
                    role="button"
                    aria-label={`Крепление ${el.name} ${a.name}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (connectKind) onPickAnchor(el.id, a.id)
                      else onSelect(el.id)
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      if (connectKind) {
                        onPickAnchor(el.id, a.id)
                        return
                      }
                      onSelect(el.id)
                    }}
                  >
                    <title>{`${el.name} ${a.name}`}</title>
                  </circle>
                ))}
              </g>
            )
          })}
        </g>
      </svg>
      {connectKind ? <p className="hint mech-hint">Режим соединения: выберите две точки крепления. ПКМ — панорама.</p> : null}
      {reduceMotion ? null : null}
    </div>
  )
}

function Grid() {
  const lines = []
  for (let i = -2; i <= 2; i += 0.05) {
    lines.push(<line key={`v${i}`} x1={i} y1={-2} x2={i} y2={2} stroke="var(--line)" strokeWidth={i % 0.2 === 0 ? 0.002 : 0.0008} />)
    lines.push(<line key={`h${i}`} x1={-2} y1={i} x2={2} y2={i} stroke="var(--line)" strokeWidth={i % 0.2 === 0 ? 0.002 : 0.0008} />)
  }
  return (
    <g className="mech-grid">
      {lines}
      <line x1={-2} y1={0} x2={2} y2={0} stroke="var(--line-strong)" strokeWidth={0.003} />
      <line x1={0} y1={-2} x2={0} y2={2} stroke="var(--line-strong)" strokeWidth={0.003} />
    </g>
  )
}

function ElementShape({
  el,
  selected,
  showDims,
  showAxes,
}: {
  el: MechElement
  selected: boolean
  showDims: boolean
  showAxes: boolean
}) {
  const stroke = selected ? 'var(--accent)' : 'var(--ink)'
  if (el.kind === 'link') {
    const L = numParam(el, 'length', 0.2)
    const W = numParam(el, 'width', 0.028)
    return (
      <>
        <rect x={0} y={-W / 2} width={L} height={W} rx={W / 4} fill="var(--surface)" stroke={stroke} strokeWidth={0.003} />
        {showDims ? (
          <text x={L / 2} y={-W} fontSize={0.018} fill="var(--muted)" textAnchor="middle" transform="scale(1 -1)">
            {KIND_LABEL.link} {(L * 1000).toFixed(0)} мм
          </text>
        ) : null}
        {showAxes ? <Axes /> : null}
      </>
    )
  }
  if (el.kind === 'chassis') {
    const L = numParam(el, 'length', 0.24)
    const W = numParam(el, 'width', 0.16)
    return <rect x={-L / 2} y={-W / 2} width={L} height={W} rx={0.01} fill="var(--surface)" stroke={stroke} strokeWidth={0.003} />
  }
  if (el.kind === 'wheel' || el.kind === 'caster') {
    const r = numParam(el, 'radius', 0.04)
    return <circle r={r} fill="var(--bg)" stroke={stroke} strokeWidth={0.003} />
  }
  if (el.kind === 'gripper') {
    const o = numParam(el, 'opening', 0.04)
    return (
      <g>
        <line x1={0} y1={-o / 2} x2={0.04} y2={-o / 2} stroke={stroke} strokeWidth={0.006} />
        <line x1={0} y1={o / 2} x2={0.04} y2={o / 2} stroke={stroke} strokeWidth={0.006} />
      </g>
    )
  }
  const w = el.kind === 'base' ? 0.05 : 0.04
  return <rect x={-w / 2} y={-w / 2} width={w} height={w} fill="var(--surface)" stroke={stroke} strokeWidth={0.003} />
}

function Axes() {
  return (
    <g>
      <line x1={0} y1={0} x2={0.04} y2={0} stroke="#b55252" strokeWidth={0.002} />
      <line x1={0} y1={0} x2={0} y2={0.04} stroke="#2f8a6a" strokeWidth={0.002} />
    </g>
  )
}

export function eeWorld(model: MechanicsModel) {
  const { poses } = solvePoses(model)
  if (model.ee_id) {
    const el = model.elements.find((e) => e.id === model.ee_id)
    const pose = el ? poses.get(el.id) : undefined
    if (el && pose) return distalPoint(el, pose)
  }
  const last = model.elements[model.elements.length - 1]
  const pose = last ? poses.get(last.id) : undefined
  if (last && pose) return distalPoint(last, pose)
  return worldPoint({ x: 0, y: 0, theta: 0 }, 0, 0)
}
