import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createElement } from '../../model/mechanics/catalog'
import { fliesOverObstacle, obstacleHit } from '../../model/mechanics/collision'
import { applyTemplate, commitPath, ensureMechanics, makeJoint, markPathStale, orderedWaypoints, removeElement } from '../../model/mechanics/factory'
import { planAStar } from '../../model/mechanics/astar'
import { motionAt, pathLength, pointAlong, travelTime } from '../../model/mechanics/motion'
import { blockedReason, canEnterStep, continueFrom, flightParams, robotInflate, stageList } from '../../model/mechanics/stages'
import { numParam } from '../../model/mechanics/geometry'
import { animateView, fitPointView, fitWorkspaceView } from '../../model/mechanics/units'
import { CANVAS_FIT_MS, shouldReduceMotion } from '../../model/canvasMotion'
import { createJointError } from '../../model/mechanics/validate'
import type { KinStageId, KinTaskKind, MechCanvasTool, MechJointKind, MechanicsModel } from '../../model/mechanics/types'
import { useProjectStore } from '../../store/useProjectStore'
import { useUiStore } from '../../store/useUiStore'
import { MechanicsCanvas } from './MechanicsCanvas'
import { MechanicsSidebar } from './MechanicsSidebar'

const STEP_LABEL: Record<KinStageId, string> = {
  robot: 'Робот',
  mass: 'Масса',
  map: 'Карта',
  path: 'Маршрут',
  motion: 'Движение',
  check: 'Проверка',
}

export function MechanicsView() {
  const project = useProjectStore((s) => s.project)!
  const mutate = useProjectStore((s) => s.mutate)
  const dirty = useProjectStore((s) => s.dirty)
  const selectedIds = useProjectStore((s) => s.selectedIds)
  const select = useProjectStore((s) => s.select)
  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const model = ensureMechanics(project.mechanics)
  const selectedId = selectedIds[0] || null
  const selected = model.elements.find((e) => e.id === selectedId) || null
  const selectedObstacle = model.obstacles.find((o) => o.id === selectedId) || null
  const selectedWaypoint = model.waypoints.find((w) => w.id === selectedId) || null

  const [step, setStep] = useState<KinStageId>('robot')
  const [connectKind, setConnectKind] = useState<MechJointKind | null>(null)
  const [connectFrom, setConnectFrom] = useState<{ elementId: string; anchorId: string } | null>(null)
  const [canvasTool, setCanvasTool] = useState<MechCanvasTool>('select')
  const [pan, setPan] = useState({ x: 80, y: 420 })
  const [zoom, setZoom] = useState(1)
  const [planMsg, setPlanMsg] = useState('')
  const [sideW, setSideW] = useState(360)
  const [playing, setPlaying] = useState(false)
  const [simT, setSimT] = useState(0)
  const [rate, setRate] = useState(1)
  const [hitMsg, setHitMsg] = useState('')
  const mainRef = useRef<HTMLDivElement>(null)
  const playRef = useRef({ playing: false, t: 0, rate: 1, last: 0 })
  playRef.current.playing = playing
  playRef.current.t = simT
  playRef.current.rate = rate

  const stages = stageList(model)
  const planReason = blockedReason('plan', stages)
  const timeReason = blockedReason('time', stages)
  const cont = continueFrom(step, stages)
  const mobile = model.task === 'diff' || model.task === 'diff4' || model.task === 'custom' || model.task === 'drone'
  const pathPts = model.path?.points
  const pathLen = pathPts && pathPts.length > 1 ? pathLength(pathPts) : 0
  const profile = travelTime(pathLen, model.motion.v_max ?? model.motion.v, model.motion.acc, model.motion.dec)
  const at = profile.ok && pathPts && pathPts.length > 1 ? motionAt(pathLen, simT, model.motion.v_max ?? model.motion.v, model.motion.acc, model.motion.dec) : null
  const overlayPose =
    at && pathPts && (playing || simT > 0) && step !== 'robot' && step !== 'mass'
      ? pointAlong(pathPts, at.s)
      : null

  useEffect(() => {
    if (!stages.some((s) => s.id === step)) setStep(stages[0].id)
  }, [model.task, step, stages])

  const fittedRef = useRef(false)
  const stopFit = useRef<() => void>(() => undefined)
  const reduceMotion = useUiStore((s) => s.settings.reduce_motion)
  useEffect(() => {
    if (fittedRef.current) return
    let n = 0
    let id = 0
    const tick = () => {
      const r = mainRef.current?.getBoundingClientRect()
      const w = r?.width || 0
      const h = r?.height || 0
      if (w > 80 && h > 80) {
        fittedRef.current = true
        const next = fitWorkspaceView(model.workspace, w, h)
        stopFit.current = animateView({ pan, zoom }, next, (frame) => {
          setPan(frame.pan)
          setZoom(frame.zoom)
        }, CANVAS_FIT_MS, shouldReduceMotion(reduceMotion))
        return
      }
      if (n++ < 20) id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(id)
      stopFit.current()
    }
    // first enter only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setModel = (next: MechanicsModel, history = true) => {
    mutate((p) => {
      p.mechanics = next
    }, { history })
  }

  useEffect(() => {
    if (!project.mechanics?.id) {
      mutate((p) => {
        p.mechanics = ensureMechanics(p.mechanics)
      }, { history: false })
    }
  }, [mutate, project.mechanics?.id])

  useEffect(() => {
    if (model.path?.stale || model.motion.stale) {
      setPlaying(false)
    }
  }, [model.path?.stale, model.motion.stale])

  useEffect(() => {
    if (!playing) return
    let raf = 0
    const tick = (now: number) => {
      const st = playRef.current
      if (!st.playing) return
      if (!st.last) st.last = now
      const dt = Math.min(0.05, ((now - st.last) / 1000) * st.rate)
      st.last = now
      const nextT = st.t + dt
      const pts = model.path?.points
      const len = pts && pts.length > 1 ? pathLength(pts) : 0
      const tot = travelTime(len, model.motion.v_max ?? model.motion.v, model.motion.acc, model.motion.dec)
      const pose = pts && pts.length > 1 ? pointAlong(pts, motionAt(len, nextT, model.motion.v_max ?? model.motion.v, model.motion.acc, model.motion.dec).s) : null
      if (pose) {
        const inflate = robotInflate(model)
        for (const o of model.obstacles) {
          const flight = flightParams(model)
          if (flight && fliesOverObstacle(o, flight.altitude, flight.bodyHeight)) continue
          if (obstacleHit(o, pose.x, pose.y, inflate)) {
            setPlaying(false)
            const heightFail = flight && !fliesOverObstacle(o, flight.altitude, flight.bodyHeight)
            setHitMsg(
              heightFail
                ? `Недостаточная высота пролёта над «${o.name}» на t = ${nextT.toFixed(2)} с (высота препятствия ${o.z_height ?? 1} м).`
                : `Столкновение с «${o.name}» на t = ${nextT.toFixed(2)} с. Модель габарита — окружность.`,
            )
            setSimT(nextT)
            return
          }
        }
      }
      if (!tot.ok || nextT >= tot.t) {
        setSimT(tot.ok ? tot.t : nextT)
        setPlaying(false)
        return
      }
      setSimT(nextT)
      raf = requestAnimationFrame(tick)
    }
    playRef.current.last = 0
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, model])

  const toolForStep = useMemo((): MechCanvasTool => {
    if (step === 'map') return canvasTool === 'start' || canvasTool === 'goal' || canvasTool === 'via' ? 'select' : canvasTool
    if (step === 'path') return canvasTool === 'line' || canvasTool === 'rect' || canvasTool === 'circle' ? 'select' : canvasTool
    return 'select'
  }, [step, canvasTool])

  const go = (id: KinStageId) => {
    const reason = canEnterStep(id, stages)
    if (reason) {
      setPlanMsg(reason)
      return
    }
    setPlanMsg('')
    setCanvasTool('select')
    setStep(id)
    if (id === 'check') {
      const playable = Boolean(model.path && !model.path.stale && !model.motion.stale && profile.ok && mobile && pathLen > 0)
      if (playable) {
        setHitMsg('')
        setSimT(0)
        setPlaying(true)
      }
    }
  }

  const viewSize = () => {
    const r = mainRef.current?.getBoundingClientRect()
    return { w: r?.width || 640, h: r?.height || 420 }
  }

  const onPlan = (modePlan: 'waypoints' | 'astar') => {
    if (planReason) {
      setPlanMsg(planReason)
      return
    }
    const wps = orderedWaypoints(model)
    if (!wps) {
      setPlanMsg('Укажите начальную точку и цель.')
      return
    }
    setPlaying(false)
    setSimT(0)
    if (modePlan === 'waypoints') {
      const next = commitPath(
        model,
        wps.map((w) => ({ x: w.x, y: w.y })),
        'waypoints',
      )
      setModel(next)
      setPlanMsg(next.path?.collision_obstacle_id ? 'Ломаная пересекает препятствие. Это не маршрут A*.' : 'Построена ломаная по точкам.')
      return
    }
    const inflate = robotInflate(model)
    const cell = model.workspace.grid || 0.05
    const pts: { x: number; y: number }[] = []
    for (let i = 0; i < wps.length - 1; i++) {
      const res = planAStar(model.workspace, model.obstacles, wps[i], wps[i + 1], inflate, cell)
      if (!res.ok) {
        setPlanMsg(res.reason)
        setModel({ ...model, path: null })
        return
      }
      pts.push(...(i === 0 ? res.points : res.points.slice(1)))
    }
    const next = commitPath(model, pts, 'astar')
    setModel(next)
    setPlanMsg(next.path?.collision_obstacle_id ? 'A* вернул путь, но проверка столкновений его отклонила.' : 'A* нашёл обход по сетке.')
  }

  const onTime = () => {
    if (timeReason) {
      setPlanMsg(timeReason)
      return
    }
    const len = model.path && model.path.points.length > 1 ? pathLength(model.path.points) : 0
    const t = travelTime(len, model.motion.v_max ?? model.motion.v, model.motion.acc, model.motion.dec)
    if (!t.ok) {
      setPlanMsg(t.reason)
      return
    }
    setPlaying(false)
    setSimT(0)
    setHitMsg('')
    setModel({ ...model, motion: { ...model.motion, stale: false } })
    setPlanMsg(`t = ${t.t.toFixed(2)} с (${t.profile}).`)
  }

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const resizer = event.currentTarget
    const pointerId = event.pointerId
    const startX = event.clientX
    const startWidth = sideW
    resizer.setPointerCapture(pointerId)
    document.body.classList.add('inspector-resizing')
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      setSideW(Math.min(620, Math.max(280, startWidth + startX - e.clientX)))
    }
    const end = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      resizer.releasePointerCapture(pointerId)
      resizer.removeEventListener('pointermove', move)
      resizer.removeEventListener('pointerup', end)
      resizer.removeEventListener('pointercancel', end)
      document.body.classList.remove('inspector-resizing')
    }
    resizer.addEventListener('pointermove', move)
    resizer.addEventListener('pointerup', end)
    resizer.addEventListener('pointercancel', end)
  }

  const pickAnchor = (elementId: string, anchorId: string) => {
    if (!connectKind) return
    if (!connectFrom) {
      setConnectFrom({ elementId, anchorId })
      return
    }
    const err = createJointError(model, connectFrom.elementId, elementId)
    if (err) {
      window.alert(err)
      setConnectFrom(null)
      return
    }
    const joint = makeJoint(connectKind, connectFrom.elementId, elementId, connectFrom.anchorId, anchorId)
    setModel({ ...model, joints: [...model.joints, joint] })
    setConnectFrom(null)
    setConnectKind(null)
    select([joint.id])
  }

  const canPlay = Boolean(model.path && !model.path.stale && !model.motion.stale && profile.ok && mobile && pathLen > 0)

  return (
    <div className="page kin-page">
      <header className="kin-top">
        <div>
          <h1>Кинематика</h1>
          <input className="mech-title" value={model.name} aria-label="Имя модели" onChange={(e) => setModel({ ...model, name: e.target.value })} />
        </div>
        <ol className="kin-steps" aria-label="Этапы">
          {stages.map((s, i) => {
            const locked = !!canEnterStep(s.id, stages)
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={`kin-step-btn is-${s.status} ${step === s.id ? 'is-current' : ''}`}
                  disabled={locked && s.id !== step}
                  title={locked && s.id !== step ? canEnterStep(s.id, stages) || '' : s.detail}
                  onClick={() => go(s.id)}
                >
                  <span className="n">{i + 1}</span>
                  {STEP_LABEL[s.id]}
                </button>
              </li>
            )
          })}
        </ol>
        <div className="mech-toolbar-actions">
          {dirty ? <span className="save-meta">Есть изменения</span> : null}
          <button className="btn ghost" type="button" onClick={() => undo()}>
            Отменить
          </button>
          <button className="btn ghost" type="button" onClick={() => redo()}>
            Повторить
          </button>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              const { w, h } = viewSize()
              const next = fitWorkspaceView(model.workspace, w, h)
              stopFit.current()
              stopFit.current = animateView({ pan, zoom }, next, (frame) => {
                setPan(frame.pan)
                setZoom(frame.zoom)
              }, CANVAS_FIT_MS, shouldReduceMotion(reduceMotion))
            }}
          >
            Вся карта
          </button>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              const ch = model.elements.find((e) => e.kind === 'chassis')
              const { w, h } = viewSize()
              const pose = overlayPose || (ch ? { x: ch.x, y: ch.y } : { x: 0.2, y: 0.2 })
              const span = ch ? Math.max(numParam(ch, 'length', 0.2), numParam(ch, 'width', 0.16)) : 0.2
              const next = fitPointView(pose.x, pose.y, span, w, h)
              setPan(next.pan)
              setZoom(next.zoom)
            }}
          >
            Показать робота
          </button>
          <button className="btn ghost" type="button" onClick={() => { setPan({ x: 80, y: 420 }); setZoom(1) }}>
            Сброс вида
          </button>
          <button
            className="btn danger"
            type="button"
            disabled={!selectedIds.length}
            title={!selectedIds.length ? 'Сначала выберите объект' : ''}
            onClick={() => {
              if (!selectedIds.length) return
              let next = model
              for (const id of selectedIds) next = removeElement(next, id)
              setModel(next)
              select([])
            }}
          >
            Удалить
          </button>
        </div>
      </header>
      <div className={`kin-layout ${sideW < 340 ? 'is-compact' : ''}`} style={{ gridTemplateColumns: `minmax(0, 1fr) ${sideW}px` }}>
        <div className="kin-main" ref={mainRef}>
          <MechanicsCanvas
            model={model}
            selectedId={selectedId}
            selectedIds={selectedIds}
            connectKind={connectKind}
            connectFrom={connectFrom}
            tool={toolForStep}
            pan={pan}
            zoom={zoom}
            onPan={setPan}
            onZoom={setZoom}
            onUserView={() => stopFit.current()}
            onSelect={(id, mods) => {
              if (!id) {
                select([])
                return
              }
              if (mods?.ctrlKey || mods?.metaKey) {
                select(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id])
                return
              }
              select([id])
            }}
            onSelectMany={(ids) => select(ids)}
            onMoveRoot={(id, x, y) => {
              const el = model.elements.find((e) => e.id === id)
              if (!el) return
              const dx = x - el.x
              const dy = y - el.y
              const group = selectedIds.includes(id) && selectedIds.length > 1 ? selectedIds : [id]
              const children = new Set(model.joints.map((j) => j.child_id))
              setModel(
                {
                  ...model,
                  elements: model.elements.map((item) =>
                    group.includes(item.id) && !children.has(item.id) ? { ...item, x: item.x + dx, y: item.y + dy } : item,
                  ),
                },
                false,
              )
            }}
            onPickAnchor={pickAnchor}
            onModel={setModel}
            overlayPose={overlayPose}
          />
        </div>
        <div className="kin-side-shell">
          <div
            className="kin-resizer inspector-resizer"
            onPointerDown={startResize}
            aria-label="Изменить ширину панели параметров"
            role="separator"
            aria-orientation="vertical"
          />
          <MechanicsSidebar
            model={model}
            step={step}
            selected={selected}
            selectedCount={selectedIds.length}
            obstacle={selectedObstacle}
            waypoint={selectedWaypoint}
            canvasTool={toolForStep}
            planMsg={planMsg}
            planReason={planReason}
            timeReason={timeReason}
            continueReason={cont.reason}
            sim={{
              t: simT,
              playing,
              rate,
              v: at?.v ?? 0,
              s: at?.s ?? 0,
              total: profile.ok ? profile.t : 0,
              hit: hitMsg,
              canPlay,
              stale: !!(model.path?.stale || model.motion.stale),
            }}
            onTask={(task) => {
              setPlaying(false)
              setSimT(0)
              setModel(markPathStale({ ...model, task }))
            }}
            onTemplate={(kind: KinTaskKind) => {
              if (model.elements.length && !window.confirm('Заменить текущую модель заготовкой? Карта и точки не сохранятся, если они были только в этой модели.')) return
              setPlaying(false)
              setSimT(0)
              setModel(applyTemplate(kind))
              select([])
              setStep('robot')
              setPlanMsg('Параметры заготовки примерные. Проверьте размеры и нажмите «Продолжить».')
              requestAnimationFrame(() => {
                const { w, h } = viewSize()
                const next = fitWorkspaceView(applyTemplate(kind).workspace, w, h)
                setPan(next.pan)
                setZoom(next.zoom)
              })
            }}
            onAdd={(kind) => {
              const el = createElement(kind, 0.15 + model.elements.length * 0.05, 0.08)
              setModel({ ...model, elements: [...model.elements, el] })
              select([el.id])
            }}
            onChange={(next) => {
              setPlaying(false)
              setModel(next)
            }}
            onTool={setCanvasTool}
            onPlan={onPlan}
            onTime={onTime}
            onPlay={() => {
              if (!canPlay) {
                setPlanMsg(model.motion.stale || model.path?.stale ? 'Сначала пересчитайте маршрут и время — предыдущий результат устарел.' : 'Нужен рассчитанный маршрут без столкновений.')
                return
              }
              setHitMsg('')
              setPlaying(true)
            }}
            onPause={() => setPlaying(false)}
            onReset={() => {
              setPlaying(false)
              setSimT(0)
              setHitMsg('')
            }}
            onRate={setRate}
            onContinue={() => {
              if (cont.reason || !cont.next) {
                setPlanMsg(cont.reason || '')
                return
              }
              go(cont.next)
            }}
            onBack={() => {
              const ids = stages.map((s) => s.id)
              const prev = ids[ids.indexOf(step) - 1]
              if (prev) setStep(prev)
            }}
            onGo={go}
          />
        </div>
      </div>
    </div>
  )
}
