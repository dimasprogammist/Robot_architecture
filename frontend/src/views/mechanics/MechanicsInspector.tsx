import { KIND_LABEL, syncLinkAnchors } from '../../model/mechanics/catalog'
import { markPathStale } from '../../model/mechanics/factory'
import { clampJoint } from '../../model/mechanics/geometry'
import { applyCatalogHints } from '../../model/mechanics/kinematics'
import { degToRad, mToMm, mmToM, radToDeg, rpmToRadS, radSToRpm } from '../../model/mechanics/units'
import type { KinTaskKind, MechElement, MechJoint, MechObstacle, MechanicsModel, MechWaypoint } from '../../model/mechanics/types'
import type { Component } from '../../types'
import { ParamField } from './ParamField'

export function MechanicsInspector({
  model,
  selected,
  joint,
  obstacle,
  waypoint,
  components,
  onChange,
}: {
  model: MechanicsModel
  selected: MechElement | null
  joint: MechJoint | null
  obstacle: MechObstacle | null
  waypoint: MechWaypoint | null
  components: Component[]
  onChange: (next: MechanicsModel) => void
}) {
  const patchModel = (next: MechanicsModel, stalePath = false) => onChange(stalePath ? markPathStale(next) : next)

  if (!selected && !joint && !obstacle && !waypoint) {
    return (
      <aside className="inspector mech-inspector">
        <h2>Свойства</h2>
        <p className="hint">Выберите элемент, препятствие или точку. Параметры карты и движения доступны всегда.</p>
        <div className="field">
          <label>Имя модели</label>
          <input value={model.name} onChange={(e) => onChange({ ...model, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Тип кинематической модели</label>
          <select
            value={model.task}
            onChange={(e) => patchModel({ ...model, task: e.target.value as KinTaskKind }, true)}
          >
            <option value="custom">Произвольная</option>
            <option value="diff">Дифференциальная платформа</option>
            <option value="linear">Линейная ось</option>
            <option value="arm2r">Двухзвенный манипулятор</option>
          </select>
        </div>
        <WorkspaceFields model={model} onChange={onChange} />
        <MotionFields model={model} onChange={onChange} />
      </aside>
    )
  }

  const patchEl = (id: string, fn: (el: MechElement) => MechElement, stale = false) => {
    patchModel({ ...model, elements: model.elements.map((el) => (el.id === id ? fn(el) : el)) }, stale)
  }

  const patchJoint = (id: string, fn: (j: MechJoint) => MechJoint) => {
    onChange({ ...model, joints: model.joints.map((j) => (j.id === id ? fn(j) : j)) })
  }

  return (
    <aside className="inspector mech-inspector">
      {waypoint ? (
        <>
          <h2>{waypoint.role === 'start' ? 'Начало' : waypoint.role === 'goal' ? 'Цель' : 'Промежуточная точка'}</h2>
          <p className="hint">Координаты в метрах рабочей области. Ориентация задаёт направление корпуса на старте.</p>
          <ParamField
            label="X"
            unit="м"
            value={waypoint.x}
            min={0}
            max={model.workspace.width}
            step={0.01}
            slider
            onChange={(v) => {
              if (v == null) return
              patchModel({ ...model, waypoints: model.waypoints.map((w) => (w.id === waypoint.id ? { ...w, x: v } : w)) }, true)
            }}
          />
          <ParamField
            label="Y"
            unit="м"
            value={waypoint.y}
            min={0}
            max={model.workspace.height}
            step={0.01}
            slider
            onChange={(v) => {
              if (v == null) return
              patchModel({ ...model, waypoints: model.waypoints.map((w) => (w.id === waypoint.id ? { ...w, y: v } : w)) }, true)
            }}
          />
          <ParamField
            label="Ориентация"
            unit="°"
            value={radToDeg(waypoint.theta)}
            min={-180}
            max={180}
            step={1}
            slider
            onChange={(v) => {
              if (v == null) return
              onChange({
                ...model,
                waypoints: model.waypoints.map((w) => (w.id === waypoint.id ? { ...w, theta: degToRad(v) } : w)),
              })
            }}
          />
        </>
      ) : null}
      {obstacle ? (
        <>
          <h2>{obstacle.name}</h2>
          <p className="hint">{obstacle.kind === 'line' ? 'Линейное препятствие (стена).' : 'Прямоугольник без поворота в расчёте столкновений.'}</p>
          <div className="field">
            <label>Название</label>
            <input
              value={obstacle.name}
              onChange={(e) =>
                onChange({
                  ...model,
                  obstacles: model.obstacles.map((o) => (o.id === obstacle.id ? { ...o, name: e.target.value } : o)),
                })
              }
            />
          </div>
          <ParamField
            label="X"
            unit="м"
            value={obstacle.x}
            min={0}
            max={model.workspace.width}
            step={0.01}
            slider
            onChange={(v) => {
              if (v == null) return
              patchModel({ ...model, obstacles: model.obstacles.map((o) => (o.id === obstacle.id ? { ...o, x: v } : o)) }, true)
            }}
          />
          <ParamField
            label="Y"
            unit="м"
            value={obstacle.y}
            min={0}
            max={model.workspace.height}
            step={0.01}
            slider
            onChange={(v) => {
              if (v == null) return
              patchModel({ ...model, obstacles: model.obstacles.map((o) => (o.id === obstacle.id ? { ...o, y: v } : o)) }, true)
            }}
          />
          {obstacle.kind === 'line' ? (
            <>
              <ParamField
                label="X2"
                unit="м"
                value={obstacle.x2}
                min={0}
                max={model.workspace.width}
                step={0.01}
                slider
                onChange={(v) => {
                  if (v == null) return
                  patchModel({ ...model, obstacles: model.obstacles.map((o) => (o.id === obstacle.id ? { ...o, x2: v } : o)) }, true)
                }}
              />
              <ParamField
                label="Y2"
                unit="м"
                value={obstacle.y2}
                min={0}
                max={model.workspace.height}
                step={0.01}
                slider
                onChange={(v) => {
                  if (v == null) return
                  patchModel({ ...model, obstacles: model.obstacles.map((o) => (o.id === obstacle.id ? { ...o, y2: v } : o)) }, true)
                }}
              />
              <ParamField
                label="Толщина"
                unit="м"
                value={obstacle.thickness}
                min={0.005}
                max={0.2}
                step={0.005}
                slider
                onChange={(v) => {
                  if (v == null) return
                  patchModel({ ...model, obstacles: model.obstacles.map((o) => (o.id === obstacle.id ? { ...o, thickness: v } : o)) }, true)
                }}
              />
            </>
          ) : (
            <>
              <ParamField
                label="Ширина"
                unit="м"
                value={obstacle.width}
                min={0.05}
                max={model.workspace.width}
                step={0.01}
                slider
                onChange={(v) => {
                  if (v == null) return
                  patchModel({ ...model, obstacles: model.obstacles.map((o) => (o.id === obstacle.id ? { ...o, width: v } : o)) }, true)
                }}
              />
              <ParamField
                label="Размер по Y"
                unit="м"
                value={obstacle.height}
                min={0.05}
                max={model.workspace.height}
                step={0.01}
                slider
                onChange={(v) => {
                  if (v == null) return
                  patchModel({ ...model, obstacles: model.obstacles.map((o) => (o.id === obstacle.id ? { ...o, height: v } : o)) }, true)
                }}
              />
            </>
          )}
          <ParamField
            label="Высота"
            unit="м"
            value={obstacle.z_height ?? 1}
            min={0}
            max={8}
            step={0.05}
            slider
            hint="Вертикальный размер препятствия, метры. Учитывается при проверке пролёта дрона."
            onChange={(v) => {
              if (v == null) return
              patchModel({ ...model, obstacles: model.obstacles.map((o) => (o.id === obstacle.id ? { ...o, z_height: v } : o)) }, true)
            }}
          />
        </>
      ) : null}
      {selected ? (
        <>
          <h2>{selected.name}</h2>
          <p className="hint">{KIND_LABEL[selected.kind]}</p>
          <div className="field">
            <label>Название</label>
            <input value={selected.name} onChange={(e) => patchEl(selected.id, (el) => ({ ...el, name: e.target.value }))} />
          </div>
          <div className="field">
            <label>Идентификатор</label>
            <input readOnly value={selected.id} />
          </div>
          <ParamField
            label="X"
            unit="мм"
            value={mToMm(selected.x)}
            onChange={(v) => {
              if (v == null) return
              patchEl(selected.id, (el) => ({ ...el, x: mmToM(v) }), true)
            }}
          />
          <ParamField
            label="Y"
            unit="мм"
            value={mToMm(selected.y)}
            onChange={(v) => {
              if (v == null) return
              patchEl(selected.id, (el) => ({ ...el, y: mmToM(v) }), true)
            }}
          />
          <ParamField
            label="Угол"
            unit="°"
            value={radToDeg(selected.theta)}
            min={-180}
            max={180}
            step={1}
            slider
            onChange={(v) => {
              if (v == null) return
              patchEl(selected.id, (el) => ({ ...el, theta: degToRad(v) }))
            }}
          />
          <ParamField
            label="Масса"
            unit="кг"
            value={selected.mass}
            optional
            min={0}
            max={50}
            step={0.1}
            slider
            onChange={(v) => patchEl(selected.id, (el) => ({ ...el, mass: v }))}
          />
          {selected.kind === 'link' ? (
            <>
              <ParamField
                label="Длина"
                unit="мм"
                value={mToMm(Number(selected.params.length) || 0)}
                min={1}
                max={2000}
                step={1}
                slider
                onChange={(v) => {
                  if (v == null || v <= 0) return
                  patchEl(selected.id, (el) => syncLinkAnchors({ ...el, params: { ...el.params, length: mmToM(v) } }), true)
                }}
              />
              <ParamField
                label="Ширина отображения"
                unit="мм"
                value={mToMm(Number(selected.params.width) || 0)}
                min={1}
                max={200}
                onChange={(v) => {
                  if (v == null) return
                  patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, width: mmToM(v) } }))
                }}
              />
            </>
          ) : null}
          {selected.kind === 'wheel' || selected.kind === 'caster' ? (
            <>
              <ParamField
                label="Радиус"
                unit="мм"
                value={mToMm(Number(selected.params.radius) || 0)}
                min={5}
                max={200}
                step={1}
                slider
                onChange={(v) => {
                  if (v == null || v <= 0) return
                  patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, radius: mmToM(v) } }), true)
                }}
              />
              <ParamField
                label="ω"
                unit="об/мин"
                value={radSToRpm(Number(selected.params.omega) || 0)}
                min={-300}
                max={300}
                step={1}
                slider
                onChange={(v) => {
                  if (v == null) return
                  patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, omega: rpmToRadS(v) } }))
                }}
              />
              {selected.kind === 'wheel' ? (
                <div className="field">
                  <label>Сторона</label>
                  <select
                    value={String(selected.params.side || 'left')}
                    onChange={(e) => patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, side: e.target.value } }), true)}
                  >
                    <option value="left">Левое</option>
                    <option value="right">Правое</option>
                  </select>
                </div>
              ) : null}
            </>
          ) : null}
          {selected.kind === 'motor' ? (
            <>
              <ParamField
                label="Текущая ω"
                unit="об/мин"
                value={radSToRpm(Number(selected.params.omega) || 0)}
                min={0}
                max={6000}
                step={10}
                slider
                onChange={(v) => {
                  if (v == null) return
                  patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, omega: rpmToRadS(v) } }))
                }}
              />
              <ParamField
                label="Номинальная ω"
                unit="об/мин"
                value={selected.params.omega_nom == null ? null : radSToRpm(Number(selected.params.omega_nom))}
                optional
                min={0}
                max={6000}
                onChange={(v) =>
                  patchEl(selected.id, (el) => ({
                    ...el,
                    params: { ...el.params, omega_nom: v == null ? null : rpmToRadS(v) },
                  }))
                }
              />
            </>
          ) : null}
          {selected.kind === 'gearbox' ? (
            <>
              <ParamField
                label="Передаточное отношение"
                value={Number(selected.params.ratio) || 0}
                min={0.1}
                max={100}
                step={0.1}
                slider
                onChange={(v) => {
                  if (v == null) return
                  patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, ratio: v } }))
                }}
              />
              <ParamField
                label="КПД"
                value={Number(selected.params.efficiency) || 0}
                min={0}
                max={1}
                step={0.01}
                slider
                onChange={(v) => {
                  if (v == null) return
                  patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, efficiency: Math.min(1, Math.max(0, v)) } }))
                }}
              />
              <ParamField
                label="Шаг передачи"
                unit="мм/об"
                value={selected.params.pitch == null ? null : mToMm(Number(selected.params.pitch))}
                optional
                min={0.5}
                max={20}
                step={0.1}
                slider
                onChange={(v) =>
                  patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, pitch: v == null ? null : mmToM(v) } }))
                }
              />
            </>
          ) : null}
          {selected.kind === 'gripper' ? (
            <ParamField
              label="Раскрытие"
              unit="мм"
              value={mToMm(Number(selected.params.opening) || 0)}
              min={0}
              max={200}
              onChange={(v) => {
                if (v == null) return
                patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, opening: mmToM(v) } }))
              }}
            />
          ) : null}
          {selected.kind === 'chassis' ? (
            <>
              <ParamField
                label="Длина корпуса"
                unit="мм"
                value={mToMm(Number(selected.params.length) || 0)}
                min={50}
                max={800}
                step={1}
                slider
                onChange={(v) => {
                  if (v == null) return
                  patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, length: mmToM(v) } }), true)
                }}
              />
              <ParamField
                label="Ширина корпуса"
                unit="мм"
                value={mToMm(Number(selected.params.width) || 0)}
                min={40}
                max={600}
                step={1}
                slider
                onChange={(v) => {
                  if (v == null) return
                  patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, width: mmToM(v) } }), true)
                }}
              />
              <ParamField
                label="Колея"
                unit="мм"
                value={mToMm(Number(selected.params.track) || 0)}
                min={40}
                max={800}
                step={1}
                slider
                onChange={(v) => {
                  if (v == null) return
                  patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, track: mmToM(v) } }), true)
                }}
              />
            </>
          ) : null}
          <div className="field">
            <label>Компонент каталога</label>
            <select
              value={selected.catalog_component_id || ''}
              onChange={(e) => {
                const id = e.target.value || null
                const comp = components.find((c) => c.id === id)
                patchEl(selected.id, (el) =>
                  id && comp ? applyCatalogHints({ ...el, catalog_component_id: id }, comp.extra_fields || {}, comp.mechanical?.weight) : { ...el, catalog_component_id: id },
                )
              }}
            >
              <option value="">Не назначен</option>
              {components.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.type}
                </option>
              ))}
            </select>
          </div>
          <button className="btn ghost" type="button" onClick={() => onChange({ ...model, ee_id: selected.id })}>
            Считать рабочим органом
          </button>
        </>
      ) : null}
      {joint ? (
        <>
          <h2 style={{ marginTop: selected ? 16 : 0 }}>Соединение</h2>
          <p className="hint">{joint.kind === 'revolute' ? 'Вращательный шарнир' : joint.kind === 'prismatic' ? 'Поступательное' : 'Жёсткое'}</p>
          <div className="field">
            <label>Идентификатор</label>
            <input readOnly value={joint.id} />
          </div>
          {joint.kind !== 'fixed' ? (
            <>
              <ParamField
                label={joint.kind === 'revolute' ? 'Угол' : 'Ход'}
                unit={joint.kind === 'revolute' ? '°' : 'мм'}
                value={joint.kind === 'revolute' ? radToDeg(joint.q) : mToMm(joint.q)}
                min={joint.kind === 'revolute' ? radToDeg(joint.q_min ?? -Math.PI) : mToMm(joint.q_min ?? 0)}
                max={joint.kind === 'revolute' ? radToDeg(joint.q_max ?? Math.PI) : mToMm(joint.q_max ?? 0.3)}
                step={joint.kind === 'revolute' ? 0.5 : 1}
                slider
                onChange={(v) => {
                  if (v == null) return
                  patchJoint(joint.id, (j) => {
                    const q = joint.kind === 'revolute' ? degToRad(v) : mmToM(v)
                    return { ...j, q: clampJoint(j, q) }
                  })
                }}
              />
              <ParamField
                label={joint.kind === 'revolute' ? 'Мин. угол' : 'Мин. ход'}
                unit={joint.kind === 'revolute' ? '°' : 'мм'}
                value={joint.q_min == null ? null : joint.kind === 'revolute' ? radToDeg(joint.q_min) : mToMm(joint.q_min)}
                optional
                onChange={(v) =>
                  patchJoint(joint.id, (j) => {
                    const next = {
                      ...j,
                      q_min: v == null ? null : joint.kind === 'revolute' ? degToRad(v) : mmToM(v),
                    }
                    return { ...next, q: clampJoint(next, next.q) }
                  })
                }
              />
              <ParamField
                label={joint.kind === 'revolute' ? 'Макс. угол' : 'Макс. ход'}
                unit={joint.kind === 'revolute' ? '°' : 'мм'}
                value={joint.q_max == null ? null : joint.kind === 'revolute' ? radToDeg(joint.q_max) : mToMm(joint.q_max)}
                optional
                onChange={(v) =>
                  patchJoint(joint.id, (j) => {
                    const next = {
                      ...j,
                      q_max: v == null ? null : joint.kind === 'revolute' ? degToRad(v) : mmToM(v),
                    }
                    return { ...next, q: clampJoint(next, next.q) }
                  })
                }
              />
            </>
          ) : null}
        </>
      ) : null}
      {selected || obstacle || waypoint ? (
        <div style={{ marginTop: 16 }}>
          <WorkspaceFields model={model} onChange={onChange} />
          <MotionFields model={model} onChange={onChange} />
        </div>
      ) : null}
    </aside>
  )
}

function WorkspaceFields({ model, onChange }: { model: MechanicsModel; onChange: (n: MechanicsModel) => void }) {
  const ws = model.workspace
  const patch = (partial: Partial<typeof ws>) =>
    onChange(markPathStale({ ...model, workspace: { ...ws, ...partial } }))
  return (
    <>
      <h3>Рабочая область</h3>
      <p className="hint">Масштаб канваса не меняет физические размеры. Сетка — в метрах.</p>
      <ParamField label="Ширина" unit="м" value={ws.width} min={0.4} max={8} step={0.1} slider onChange={(v) => v != null && patch({ width: v })} />
      <ParamField label="Высота" unit="м" value={ws.height} min={0.4} max={8} step={0.1} slider onChange={(v) => v != null && patch({ height: v })} />
      <ParamField label="Шаг сетки" unit="м" value={ws.grid} min={0.02} max={0.2} step={0.01} slider onChange={(v) => v != null && patch({ grid: v })} />
    </>
  )
}

function MotionFields({ model, onChange }: { model: MechanicsModel; onChange: (n: MechanicsModel) => void }) {
  const m = model.motion
  const patch = (partial: Partial<typeof m>) =>
    onChange({ ...model, motion: { ...m, ...partial, stale: true } })
  return (
    <>
      <h3>Движение</h3>
      <p className="hint">Трапецеидальный профиль: разгон → скорость → торможение. Не динамика.</p>
      <ParamField label="v" unit="м/с" value={m.v} optional min={0} max={2} step={0.01} slider onChange={(v) => patch({ v: v })} />
      <ParamField label="v max" unit="м/с" value={m.v_max} optional min={0} max={2} step={0.01} slider onChange={(v) => patch({ v_max: v })} />
      <ParamField label="ω" unit="рад/с" value={m.w} optional min={-3} max={3} step={0.05} slider onChange={(v) => patch({ w: v })} />
      <ParamField label="ω max" unit="рад/с" value={m.w_max} optional min={0} max={6} step={0.05} slider onChange={(v) => patch({ w_max: v })} />
      <ParamField label="Ускорение" unit="м/с²" value={m.acc} optional min={0} max={4} step={0.05} slider onChange={(v) => patch({ acc: v })} />
      <ParamField label="Торможение" unit="м/с²" value={m.dec} optional min={0} max={4} step={0.05} slider onChange={(v) => patch({ dec: v })} />
    </>
  )
}
