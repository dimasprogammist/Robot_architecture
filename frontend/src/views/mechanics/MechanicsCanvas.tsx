import { useMemo, useRef, useState } from 'react'
import { distalPoint, numParam, solvePoses, worldPoint } from '../../model/mechanics/geometry'
import { KIND_LABEL } from '../../model/mechanics/catalog'
import { PX_PER_M } from '../../model/mechanics/units'
import { uid } from '../../lib/ids'
import type { MechCanvasTool, MechElement, MechJointKind, MechanicsModel, MechObstacle, MechWaypoint } from '../../model/mechanics/types'
import { useUiStore } from '../../store/useUiStore'

export function MechanicsCanvas({
  model,
  selectedId,
  selectedIds,
  connectKind,
  connectFrom,
  tool,
  pan,
  zoom,
  onPan,
  onZoom,
  onSelect,
  onSelectMany,
  onMoveRoot,
  onUserView,
  onPickAnchor,
  onModel,
  overlayPose,
}: {
  model: MechanicsModel
  selectedId: string | null
  selectedIds?: string[]
  connectKind: MechJointKind | null
  connectFrom: { elementId: string; anchorId: string } | null
  tool: MechCanvasTool
  pan: { x: number; y: number }
  zoom: number
  onPan: (pan: { x: number; y: number }) => void
  onZoom: (zoom: number) => void
  onSelect: (id: string | null, mods?: { ctrlKey: boolean; metaKey: boolean }) => void
  onSelectMany?: (ids: string[]) => void
  onMoveRoot: (id: string, x: number, y: number) => void
  onUserView?: () => void
  onPickAnchor: (elementId: string, anchorId: string) => void
  onModel: (next: MechanicsModel, history?: boolean) => void
  overlayPose?: { x: number; y: number; theta: number } | null
}) {
  const showGrid = useUiStore((s) => s.settings.show_grid)
  const wrap = useRef<HTMLDivElement>(null)
  const drag = useRef<{
    kind: 'el' | 'obs' | 'wp' | 'pan' | 'draw' | 'box'
    id?: string
    dx?: number
    dy?: number
    x?: number
    y?: number
    x2?: number
    y2?: number
    panX?: number
    panY?: number
    additive?: boolean
  } | null>(null)
  const picked = selectedIds || (selectedId ? [selectedId] : [])
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const { poses } = useMemo(() => solvePoses(model), [model])
  const scale = PX_PER_M * zoom
  const ws = model.workspace

  const toModel = (clientX: number, clientY: number) => {
    const rect = wrap.current!.getBoundingClientRect()
    return {
      x: (clientX - rect.left - pan.x) / scale,
      y: -(clientY - rect.top - pan.y) / scale,
    }
  }

  const snap = (v: number) => {
    const g = ws.grid || 0.05
    return Math.round(v / g) * g
  }

  return (
    <div
      className="mech-canvas"
      ref={wrap}
      onWheel={(e) => {
        e.preventDefault()
        onZoom(Math.min(8, Math.max(0.05, zoom * (e.deltaY > 0 ? 0.92 : 1.08))))
      }}
      onPointerDown={(e) => {
        if (e.button === 1 || e.button === 2) {
          onUserView?.()
          drag.current = { kind: 'pan', x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
          ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
          return
        }
        const tgt = e.target as HTMLElement
        if (tool === 'select' && e.button === 0 && (tgt === e.currentTarget || tgt.classList.contains('mech-svg'))) {
          const m = toModel(e.clientX, e.clientY)
          drag.current = { kind: 'box', x: m.x, y: m.y, x2: m.x, y2: m.y, additive: e.ctrlKey || e.metaKey }
          ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
          return
        }
        if (tool === 'line' || tool === 'rect' || tool === 'circle') {
          const m = toModel(e.clientX, e.clientY)
          drag.current = { kind: 'draw', x: snap(m.x), y: snap(m.y) }
          ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
        }
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (!d) return
        if (d.kind === 'pan') {
          onPan({ x: (d.panX ?? 0) + e.clientX - (d.x ?? 0), y: (d.panY ?? 0) + e.clientY - (d.y ?? 0) })
        }
        if (d.kind === 'box' && d.x != null && d.y != null) {
          const m = toModel(e.clientX, e.clientY)
          d.x2 = m.x
          d.y2 = m.y
          setBox({ x: Math.min(d.x, m.x), y: Math.min(d.y, m.y), w: Math.abs(m.x - d.x), h: Math.abs(m.y - d.y) })
        }
        if (d.kind === 'el' && d.id) {
          const m = toModel(e.clientX, e.clientY)
          onMoveRoot(d.id, m.x - (d.dx ?? 0), m.y - (d.dy ?? 0))
        }
        if (d.kind === 'wp' && d.id) {
          const m = toModel(e.clientX, e.clientY)
          onModel(
            {
              ...model,
              waypoints: model.waypoints.map((w) => (w.id === d.id ? { ...w, x: snap(m.x), y: snap(m.y) } : w)),
              path: model.path ? { ...model.path, stale: true } : model.path,
            },
            false,
          )
        }
        if (d.kind === 'obs' && d.id) {
          const m = toModel(e.clientX, e.clientY)
          onModel(
            {
              ...model,
              obstacles: model.obstacles.map((o) =>
                o.id === d.id ? { ...o, x: snap(m.x - (d.dx ?? 0)), y: snap(m.y - (d.dy ?? 0)) } : o,
              ),
              path: model.path ? { ...model.path, stale: true } : model.path,
            },
            false,
          )
        }
      }}
      onPointerUp={(e) => {
        const d = drag.current
        if (d?.kind === 'box' && d.x != null && d.y != null) {
          const m = toModel(e.clientX, e.clientY)
          const x1 = Math.min(d.x, m.x)
          const y1 = Math.min(d.y, m.y)
          const x2 = Math.max(d.x, m.x)
          const y2 = Math.max(d.y, m.y)
          const hit = (x: number, y: number) => x >= x1 && x <= x2 && y >= y1 && y <= y2
          const ids = [
            ...model.elements.filter((el) => hit(el.x, el.y)).map((el) => el.id),
            ...model.obstacles.filter((o) => hit(o.x, o.y)).map((o) => o.id),
            ...model.waypoints.filter((w) => hit(w.x, w.y)).map((w) => w.id),
          ]
          if (Math.hypot(x2 - x1, y2 - y1) < 0.01) {
            if (!d.additive) onSelect(null)
          } else if (onSelectMany) onSelectMany(d.additive ? Array.from(new Set([...picked, ...ids])) : ids)
          else onSelect(ids[0] || null)
          setBox(null)
          drag.current = null
          return
        }
        if (d?.kind === 'draw' && d.x != null && d.y != null) {
          const m = toModel(e.clientX, e.clientY)
          const x2 = snap(m.x)
          const y2 = snap(m.y)
          const obs: MechObstacle =
            tool === 'line'
              ? {
                  id: uid(),
                  kind: 'line',
                  name: 'Линия',
                  x: d.x,
                  y: d.y,
                  x2,
                  y2,
                  width: 0,
                  height: 0,
                  theta: 0,
                  thickness: 0.02,
                  z_height: 1,
                }
              : tool === 'circle'
                ? {
                    id: uid(),
                    kind: 'circle',
                    name: 'Круг',
                    x: d.x,
                    y: d.y,
                    x2: d.x,
                    y2: d.y,
                    width: Math.max(0.05, 2 * Math.hypot(x2 - d.x, y2 - d.y)),
                    height: Math.max(0.05, 2 * Math.hypot(x2 - d.x, y2 - d.y)),
                    theta: 0,
                    thickness: 0.02,
                    z_height: 1,
                  }
                : {
                    id: uid(),
                    kind: 'rect',
                    name: 'Прямоугольник',
                    x: (d.x + x2) / 2,
                    y: (d.y + y2) / 2,
                    x2: (d.x + x2) / 2,
                    y2: (d.y + y2) / 2,
                    width: Math.max(0.05, Math.abs(x2 - d.x)),
                    height: Math.max(0.05, Math.abs(y2 - d.y)),
                    theta: 0,
                    thickness: 0.02,
                    z_height: 1,
                  }
          onModel({ ...model, obstacles: [...model.obstacles, obs], path: model.path ? { ...model.path, stale: true } : model.path })
          onSelect(obs.id)
        }
        drag.current = null
      }}
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => {
        if (e.target !== e.currentTarget && !(e.target as HTMLElement).classList.contains('mech-svg')) return
        const m = toModel(e.clientX, e.clientY)
        if (tool === 'start' || tool === 'goal') {
          const rest = model.waypoints.filter((w) => w.role !== tool)
          const wp: MechWaypoint = { id: uid(), role: tool, x: snap(m.x), y: snap(m.y), theta: 0 }
          onModel({ ...model, waypoints: [...rest, wp], path: model.path ? { ...model.path, stale: true } : model.path })
          onSelect(wp.id)
          return
        }
        if (tool === 'via') {
          const wp: MechWaypoint = { id: uid(), role: 'via', x: snap(m.x), y: snap(m.y), theta: 0 }
          onModel({ ...model, waypoints: [...model.waypoints, wp], path: model.path ? { ...model.path, stale: true } : model.path })
          onSelect(wp.id)
          return
        }
        onSelect(null)
      }}
    >
      <svg className="mech-svg" width="100%" height="100%">
        <g transform={`translate(${pan.x} ${pan.y}) scale(${scale} ${-scale})`}>
          {showGrid ? <Grid ws={ws} /> : null}
          <rect x={0} y={0} width={ws.width} height={ws.height} fill="none" stroke="var(--line-strong)" strokeWidth={0.004} />
          {box ? (
            <rect
              x={box.x}
              y={box.y}
              width={Math.max(box.w, 0.001)}
              height={Math.max(box.h, 0.001)}
              fill="color-mix(in srgb, var(--accent) 18%, transparent)"
              stroke="var(--accent)"
              strokeWidth={0.004}
            />
          ) : null}
          {model.path && model.path.points.length > 1 ? (
            <polyline
              className={model.path.collision_obstacle_id ? 'mech-collision' : 'mech-trail'}
              fill="none"
              stroke={model.path.collision_obstacle_id ? 'var(--danger)' : 'var(--accent)'}
              strokeWidth={0.008}
              strokeDasharray={model.path.stale ? '0.03 0.02' : undefined}
              points={model.path.points.map((p) => `${p.x},${p.y}`).join(' ')}
            />
          ) : null}
          {model.trail_on && model.trail.length > 1 ? (
            <polyline fill="none" stroke="var(--accent)" strokeWidth={0.004} points={model.trail.map((p) => `${p.x},${p.y}`).join(' ')} />
          ) : null}
          {model.obstacles.map((o) => (
            <g
              key={o.id}
              className={picked.includes(o.id) ? 'is-selected' : ''}
              onPointerDown={(e) => {
                if (connectKind || tool !== 'select') return
                e.stopPropagation()
                onSelect(o.id, { ctrlKey: e.ctrlKey, metaKey: e.metaKey })
                drag.current = { kind: 'obs', id: o.id, dx: toModel(e.clientX, e.clientY).x - o.x, dy: toModel(e.clientX, e.clientY).y - o.y }
                ;(e.currentTarget as SVGGElement).setPointerCapture(e.pointerId)
              }}
            >
              {o.kind === 'line' ? (
                <>
                  <line
                    x1={o.x}
                    y1={o.y}
                    x2={o.x2}
                    y2={o.y2}
                    stroke="transparent"
                    strokeWidth={Math.max(o.thickness, 14 / scale)}
                  />
                  <line
                    x1={o.x}
                    y1={o.y}
                    x2={o.x2}
                    y2={o.y2}
                    stroke={model.path?.collision_obstacle_id === o.id ? 'var(--danger)' : 'var(--ink)'}
                    strokeWidth={Math.max(o.thickness, 0.012)}
                  />
                </>
              ) : o.kind === 'circle' ? (
                <>
                  <circle cx={o.x} cy={o.y} r={Math.max(o.width / 2, 10 / scale)} fill="transparent" />
                  <circle
                    cx={o.x}
                    cy={o.y}
                    r={o.width / 2}
                    fill="color-mix(in srgb, var(--warn) 18%, transparent)"
                    stroke={model.path?.collision_obstacle_id === o.id ? 'var(--danger)' : 'var(--warn)'}
                    strokeWidth={0.006}
                  />
                </>
              ) : (
                <>
                  <rect
                    x={o.x - Math.max(o.width, 16 / scale) / 2}
                    y={o.y - Math.max(o.height, 16 / scale) / 2}
                    width={Math.max(o.width, 16 / scale)}
                    height={Math.max(o.height, 16 / scale)}
                    fill="transparent"
                  />
                  <rect
                    x={o.x - o.width / 2}
                    y={o.y - o.height / 2}
                    width={o.width}
                    height={o.height}
                    fill="color-mix(in srgb, var(--warn) 18%, transparent)"
                    stroke={model.path?.collision_obstacle_id === o.id ? 'var(--danger)' : 'var(--warn)'}
                    strokeWidth={0.006}
                  />
                </>
              )}
            </g>
          ))}
          {model.waypoints.map((w) => (
            <g
              key={w.id}
              onPointerDown={(e) => {
                if (tool !== 'select') return
                e.stopPropagation()
                onSelect(w.id, { ctrlKey: e.ctrlKey, metaKey: e.metaKey })
                drag.current = { kind: 'wp', id: w.id }
                ;(e.currentTarget as SVGGElement).setPointerCapture(e.pointerId)
              }}
            >
              <circle cx={w.x} cy={w.y} r={Math.max(0.03, 10 / scale)} fill="transparent" />
              <circle cx={w.x} cy={w.y} r={0.03} fill={w.role === 'start' ? 'var(--accent)' : w.role === 'goal' ? 'var(--danger)' : 'var(--data)'} />
              {w.role === 'start' ? <line x1={w.x} y1={w.y} x2={w.x + 0.08 * Math.cos(w.theta)} y2={w.y + 0.08 * Math.sin(w.theta)} stroke="var(--ink)" strokeWidth={0.006} /> : null}
            </g>
          ))}
          {overlayPose
            ? (() => {
                const ch = model.elements.find((e) => e.kind === 'chassis')
                const L = ch ? numParam(ch, 'length', 0.24) : 0.2
                const W = ch ? numParam(ch, 'width', 0.16) : 0.16
                return (
                  <g transform={`translate(${overlayPose.x} ${overlayPose.y}) rotate(${(overlayPose.theta * 180) / Math.PI})`}>
                    {model.task === 'drone' ? (
                      <>
                        <line x1={-L / 2} y1={-W / 2} x2={L / 2} y2={W / 2} stroke="var(--accent)" strokeWidth={0.012} />
                        <line x1={-L / 2} y1={W / 2} x2={L / 2} y2={-W / 2} stroke="var(--accent)" strokeWidth={0.012} />
                        <circle r={0.03} fill="var(--accent)" />
                        {[
                          [-L / 2, -W / 2],
                          [L / 2, -W / 2],
                          [L / 2, W / 2],
                          [-L / 2, W / 2],
                        ].map(([x, y], i) => (
                          <circle key={i} cx={x} cy={y} r={0.035} fill="none" stroke="var(--ink)" strokeWidth={0.006} />
                        ))}
                      </>
                    ) : (
                      <>
                        <rect x={-L / 2} y={-W / 2} width={L} height={W} rx={0.01} fill="var(--accent)" fillOpacity={0.35} stroke="var(--accent)" strokeWidth={0.005} />
                        <line x1={0} y1={0} x2={L / 2} y2={0} stroke="var(--ink)" strokeWidth={0.006} />
                      </>
                    )}
                  </g>
                )
              })()
            : null}
          {model.elements.map((el) => {
            const pose = poses.get(el.id)
            if (!pose) return null
            if (overlayPose && el.kind === 'chassis') return null
            const selected = picked.includes(el.id)
            const child = model.joints.some((j) => j.child_id === el.id)
            return (
              <g
                key={el.id}
                className={`mech-el ${selected ? 'is-selected' : ''}`}
                transform={`translate(${pose.x} ${pose.y}) rotate(${(pose.theta * 180) / Math.PI})`}
                onPointerDown={(e) => {
                  if (connectKind) return
                  e.stopPropagation()
                  onSelect(el.id, { ctrlKey: e.ctrlKey, metaKey: e.metaKey })
                  if (!child && e.button === 0 && tool === 'select') {
                    const m = toModel(e.clientX, e.clientY)
                    drag.current = { kind: 'el', id: el.id, dx: m.x - el.x, dy: m.y - el.y }
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
                    onClick={(ev) => {
                      ev.stopPropagation()
                      if (connectKind) onPickAnchor(el.id, a.id)
                      else onSelect(el.id)
                    }}
                    onPointerDown={(ev) => {
                      ev.stopPropagation()
                      if (connectKind) onPickAnchor(el.id, a.id)
                      else onSelect(el.id)
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
      {connectKind ? <p className="hint mech-hint">Режим соединения: две точки крепления. ПКМ — панорама.</p> : null}
      {tool !== 'select' && !connectKind ? (
        <p className="hint mech-hint">
          {tool === 'line' || tool === 'rect' || tool === 'circle' ? 'Потяните, чтобы создать препятствие в метрах карты.' : 'Кликните по карте, чтобы поставить точку.'} Колёсико — масштаб.
        </p>
      ) : null}
      <ScaleBar zoom={zoom} />
    </div>
  )
}

function ScaleBar({ zoom }: { zoom: number }) {
  const scale = PX_PER_M * zoom
  const barM = zoom < 0.15 ? 2 : zoom < 0.4 ? 1 : zoom < 1.2 ? 0.5 : 0.2
  return (
    <div className="kin-scale" aria-label={`Масштаб ${barM} м`}>
      <span className="kin-scale-bar" style={{ width: barM * scale }} />
      <span>{barM} м</span>
    </div>
  )
}

function Grid({ ws }: { ws: MechanicsModel['workspace'] }) {
  const lines = []
  const g = ws.grid || 0.05
  for (let x = 0; x <= ws.width + 1e-9; x += g) {
    lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={ws.height} stroke="var(--line)" strokeWidth={Math.abs(x % (g * 4)) < 1e-9 ? 0.002 : 0.0008} />)
  }
  for (let y = 0; y <= ws.height + 1e-9; y += g) {
    lines.push(<line key={`h${y}`} x1={0} y1={y} x2={ws.width} y2={y} stroke="var(--line)" strokeWidth={Math.abs(y % (g * 4)) < 1e-9 ? 0.002 : 0.0008} />)
  }
  return (
    <g>
      {lines}
      <line x1={0} y1={0} x2={ws.width} y2={0} stroke="var(--line-strong)" strokeWidth={0.004} />
      <line x1={0} y1={0} x2={0} y2={ws.height} stroke="var(--line-strong)" strokeWidth={0.004} />
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
      <line x1={0} y1={0} x2={0.04} y2={0} stroke="var(--danger)" strokeWidth={0.002} />
      <line x1={0} y1={0} x2={0} y2={0.04} stroke="var(--accent)" strokeWidth={0.002} />
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
