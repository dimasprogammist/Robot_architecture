import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Square } from 'lucide-react'
import { Toggle } from '../../components/Toggle'
import { createElement } from '../../model/mechanics/catalog'
import { ensureMechanics, makeJoint, removeElement } from '../../model/mechanics/factory'
import { clampJoint, numParam, solvePoses } from '../../model/mechanics/geometry'
import { inverse2R, findSerial2R, findDiffPlatform } from '../../model/mechanics/kinematics'
import { mmToM } from '../../model/mechanics/units'
import { createJointError } from '../../model/mechanics/validate'
import type { MechJointKind, MechMode, MechanicsModel } from '../../model/mechanics/types'
import { useProjectStore } from '../../store/useProjectStore'
import { MechanicsCanvas, eeWorld } from './MechanicsCanvas'
import { MechanicsInspector } from './MechanicsInspector'
import { MechanicsLibrary } from './MechanicsLibrary'
import { MechanicsResults } from './MechanicsResults'

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
  const selectedJoint = model.joints.find((j) => j.id === selectedId) || model.joints.find((j) => j.child_id === selectedId) || null

  const [mode, setMode] = useState<MechMode>('constructor')
  const [query, setQuery] = useState('')
  const [connectKind, setConnectKind] = useState<MechJointKind | null>(null)
  const [connectFrom, setConnectFrom] = useState<{ elementId: string; anchorId: string } | null>(null)
  const [pan, setPan] = useState({ x: 280, y: 260 })
  const [zoom, setZoom] = useState(1)
  const [resultTab, setResultTab] = useState<'mech' | 'kin' | 'move' | 'issues'>('kin')
  const [collapsed, setCollapsed] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [ikX, setIkX] = useState('250')
  const [ikY, setIkY] = useState('0')
  const [ikMsg, setIkMsg] = useState('')
  const playRef = useRef<number | null>(null)
  const lastRef = useRef<number>(0)

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
    if (!playing || paused) {
      if (playRef.current) cancelAnimationFrame(playRef.current)
      playRef.current = null
      return
    }
    const tick = (t: number) => {
      const dt = lastRef.current ? Math.min(0.05, (t - lastRef.current) / 1000) * speed : 0
      lastRef.current = t
      const current = ensureMechanics(useProjectStore.getState().project?.mechanics)
      const next: MechanicsModel = {
        ...current,
        joints: current.joints.map((j) => {
          if (!j.driven || j.kind === 'fixed') return j
          const motor = j.motor_id ? current.elements.find((e) => e.id === j.motor_id) : undefined
          const w = motor ? numParam(motor, 'omega') : j.kind === 'revolute' ? 0.4 : 0.02
          return { ...j, q: clampJoint(j, j.q + w * dt) }
        }),
      }
      const plat = findDiffPlatform(next, solvePoses(next).poses)
      if (plat?.motion.ok && plat.pose) {
        next.elements = next.elements.map((el) => {
          if (el.id !== plat.chassis.id) return el
          return {
            ...el,
            x: el.x + plat.motion.v * Math.cos(el.theta) * dt,
            y: el.y + plat.motion.v * Math.sin(el.theta) * dt,
            theta: el.theta + plat.motion.w * dt,
          }
        })
      }
      if (next.trail_on) {
        const ee = eeWorld(next)
        next.trail = [...next.trail, ee].slice(-400)
      }
      setModel(next, false)
      playRef.current = requestAnimationFrame(tick)
    }
    playRef.current = requestAnimationFrame(tick)
    return () => {
      if (playRef.current) cancelAnimationFrame(playRef.current)
      lastRef.current = 0
    }
  }, [playing, paused, speed])

  const add = (kind: Parameters<typeof createElement>[0]) => {
    const el = createElement(kind, 0.15 + model.elements.length * 0.05, 0.08)
    setModel({ ...model, elements: [...model.elements, el] })
    select([el.id])
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

  const applyIk = () => {
    const { poses } = solvePoses(model)
    const arm = findSerial2R(model, poses)
    if (!arm) {
      setIkMsg('Нет двухзвенного манипулятора.')
      return
    }
    const x = mmToM(Number(ikX.replace(',', '.')))
    const y = mmToM(Number(ikY.replace(',', '.')))
    const ik = inverse2R(arm.l1, arm.l2, x, y, model.elbow)
    if (!ik.ok) {
      setIkMsg(ik.reason)
      return
    }
    if (clampJoint(arm.j1, ik.t1) !== ik.t1 || clampJoint(arm.j2, ik.t2) !== ik.t2) {
      setIkMsg('Решение не проходит ограничения шарниров.')
      return
    }
    setModel({
      ...model,
      joints: model.joints.map((j) => (j.id === arm.j1.id ? { ...j, q: ik.t1 } : j.id === arm.j2.id ? { ...j, q: ik.t2 } : j)),
    })
    setIkMsg(`Использована конфигурация «локоть ${model.elbow === 'up' ? 'вверх' : 'вниз'}».`)
  }

  return (
    <div className="page mech-page">
      <header className="mech-toolbar">
        <div>
          <h1>Механика и кинематика</h1>
          <input
            className="mech-title"
            value={model.name}
            aria-label="Имя механической модели"
            onChange={(e) => setModel({ ...model, name: e.target.value })}
          />
        </div>
        <div className="mech-modes">
          {(['constructor', 'kinematics', 'calc'] as const).map((id) => (
            <button key={id} type="button" className={mode === id ? 'on' : ''} onClick={() => setMode(id)}>
              {id === 'constructor' ? 'Конструктор' : id === 'kinematics' ? 'Кинематика' : 'Расчёты'}
            </button>
          ))}
        </div>
        <div className="mech-toolbar-actions">
          {dirty ? <span className="save-meta">Есть изменения</span> : null}
          <button className="btn ghost" type="button" onClick={() => undo()}>
            Отменить
          </button>
          <button className="btn ghost" type="button" onClick={() => redo()}>
            Повторить
          </button>
          <button
            className="btn danger"
            type="button"
            disabled={!selectedId}
            onClick={() => {
              if (!selectedId) return
              setModel(removeElement(model, selectedId))
              select([])
            }}
          >
            Удалить
          </button>
          <Toggle checked={model.show_axes} onChange={(v) => setModel({ ...model, show_axes: v })} label="Оси" />
          <Toggle checked={model.show_dims} onChange={(v) => setModel({ ...model, show_dims: v })} label="Размеры" />
        </div>
      </header>
      <div className="mech-body">
        <MechanicsLibrary
          query={query}
          onQuery={setQuery}
          connectKind={connectKind}
          onTool={(k) => {
            setConnectKind(k)
            setConnectFrom(null)
          }}
          onAdd={add}
        />
        <div className="mech-center">
          <MechanicsCanvas
            model={model}
            selectedId={selectedId}
            connectKind={connectKind}
            connectFrom={connectFrom}
            pan={pan}
            zoom={zoom}
            onPan={setPan}
            onZoom={setZoom}
            onSelect={(id) => select(id ? [id] : [])}
            onMoveRoot={(id, x, y) =>
              setModel({ ...model, elements: model.elements.map((el) => (el.id === id ? { ...el, x, y } : el)) }, false)
            }
            onPickAnchor={pickAnchor}
          />
          {mode !== 'constructor' ? (
            <div className="mech-kin-bar">
              <button className="icon-btn" type="button" title="Запуск" aria-label="Запуск" onClick={() => { setPlaying(true); setPaused(false) }}>
                <Play size={16} />
              </button>
              <button className="icon-btn" type="button" title="Пауза" aria-label="Пауза" onClick={() => setPaused(true)}>
                <Pause size={16} />
              </button>
              <button
                className="icon-btn"
                type="button"
                title="Стоп"
                aria-label="Стоп"
                onClick={() => {
                  setPlaying(false)
                  setPaused(false)
                }}
              >
                <Square size={16} />
              </button>
              <button
                className="icon-btn"
                type="button"
                title="В начало"
                aria-label="В начало"
                onClick={() => {
                  setPlaying(false)
                  setModel({
                    ...model,
                    joints: model.joints.map((j) => ({ ...j, q: j.kind === 'prismatic' ? (j.q_min ?? 0) : 0 })),
                    trail: [],
                  })
                }}
              >
                <RotateCcw size={16} />
              </button>
              <label className="hint">
                Скорость
                <input type="range" min={0.2} max={3} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
              </label>
              <Toggle checked={model.trail_on} onChange={(v) => setModel({ ...model, trail_on: v })} label="Траектория" />
              <button className="btn ghost" type="button" onClick={() => setModel({ ...model, trail: [] })}>
                Очистить след
              </button>
              {mode === 'kinematics' ? (
                <>
                  <label className="hint">
                    IK x, мм
                    <input value={ikX} onChange={(e) => setIkX(e.target.value)} style={{ width: 72 }} />
                  </label>
                  <label className="hint">
                    y, мм
                    <input value={ikY} onChange={(e) => setIkY(e.target.value)} style={{ width: 72 }} />
                  </label>
                  <select value={model.elbow} onChange={(e) => setModel({ ...model, elbow: e.target.value as 'up' | 'down' })}>
                    <option value="up">Локоть вверх</option>
                    <option value="down">Локоть вниз</option>
                  </select>
                  <button className="btn" type="button" onClick={applyIk}>
                    Обратная кинематика
                  </button>
                  {ikMsg ? <span className="hint">{ikMsg}</span> : null}
                </>
              ) : null}
            </div>
          ) : null}
          <MechanicsResults
            model={model}
            tab={mode === 'calc' ? 'move' : resultTab}
            onTab={setResultTab}
            collapsed={collapsed}
            onCollapsed={setCollapsed}
            onModel={setModel}
            catalogIds={new Set(project.components.map((c) => c.id))}
          />
        </div>
        <MechanicsInspector
          model={model}
          selected={selected}
          joint={selectedJoint}
          components={project.components.filter((c) => c.entity_kind !== 'table')}
          onChange={setModel}
        />
      </div>
    </div>
  )
}
