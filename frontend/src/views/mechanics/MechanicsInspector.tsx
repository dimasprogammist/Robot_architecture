import { KIND_LABEL, syncLinkAnchors } from '../../model/mechanics/catalog'
import { clampJoint } from '../../model/mechanics/geometry'
import { applyCatalogHints } from '../../model/mechanics/kinematics'
import { degToRad, mToMm, mmToM, parseFinite, radToDeg, rpmToRadS, radSToRpm } from '../../model/mechanics/units'
import type { MechElement, MechJoint, MechanicsModel } from '../../model/mechanics/types'
import type { Component } from '../../types'

export function MechanicsInspector({
  model,
  selected,
  joint,
  components,
  onChange,
}: {
  model: MechanicsModel
  selected: MechElement | null
  joint: MechJoint | null
  components: Component[]
  onChange: (next: MechanicsModel) => void
}) {
  if (!selected && !joint) {
    return (
      <aside className="inspector mech-inspector">
        <h2>Свойства</h2>
        <p className="hint">Выберите элемент или соединение.</p>
        <div className="field">
          <label>Имя модели</label>
          <input value={model.name} onChange={(e) => onChange({ ...model, name: e.target.value })} />
        </div>
      </aside>
    )
  }

  const patchEl = (id: string, fn: (el: MechElement) => MechElement) => {
    onChange({
      ...model,
      elements: model.elements.map((el) => (el.id === id ? fn(el) : el)),
    })
  }

  const patchJoint = (id: string, fn: (j: MechJoint) => MechJoint) => {
    onChange({
      ...model,
      joints: model.joints.map((j) => (j.id === id ? fn(j) : j)),
    })
  }

  return (
    <aside className="inspector mech-inspector">
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
          <Num
            label="X, мм"
            value={mToMm(selected.x)}
            onChange={(v) => patchEl(selected.id, (el) => ({ ...el, x: mmToM(v) }))}
          />
          <Num
            label="Y, мм"
            value={mToMm(selected.y)}
            onChange={(v) => patchEl(selected.id, (el) => ({ ...el, y: mmToM(v) }))}
          />
          <Num
            label="Угол, °"
            value={radToDeg(selected.theta)}
            onChange={(v) => patchEl(selected.id, (el) => ({ ...el, theta: degToRad(v) }))}
          />
          <Num
            label="Масса, кг"
            value={selected.mass ?? ''}
            optional
            onChange={(v) => patchEl(selected.id, (el) => ({ ...el, mass: Number.isFinite(v) ? v : null }))}
          />
          {selected.kind === 'link' ? (
            <Num
              label="Длина, мм"
              value={mToMm(Number(selected.params.length) || 0)}
              min={1}
              onChange={(v) => {
                if (v <= 0) return
                patchEl(selected.id, (el) => syncLinkAnchors({ ...el, params: { ...el.params, length: mmToM(v) } }))
              }}
            />
          ) : null}
          {selected.kind === 'link' ? (
            <Num
              label="Ширина отображения, мм"
              value={mToMm(Number(selected.params.width) || 0)}
              onChange={(v) => patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, width: mmToM(v) } }))}
            />
          ) : null}
          {selected.kind === 'wheel' || selected.kind === 'caster' ? (
            <>
              <Num
                label="Радиус, мм"
                value={mToMm(Number(selected.params.radius) || 0)}
                min={1}
                onChange={(v) => patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, radius: mmToM(v) } }))}
              />
              <Num
                label="ω, об/мин"
                value={radSToRpm(Number(selected.params.omega) || 0)}
                onChange={(v) => patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, omega: rpmToRadS(v) } }))}
              />
              {selected.kind === 'wheel' ? (
                <div className="field">
                  <label>Сторона</label>
                  <select
                    value={String(selected.params.side || 'left')}
                    onChange={(e) => patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, side: e.target.value } }))}
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
              <Num
                label="Текущая ω, об/мин"
                value={radSToRpm(Number(selected.params.omega) || 0)}
                onChange={(v) => patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, omega: rpmToRadS(v) } }))}
              />
              <Num
                label="Номинальная ω, об/мин"
                value={selected.params.omega_nom == null ? '' : radSToRpm(Number(selected.params.omega_nom))}
                optional
                onChange={(v) =>
                  patchEl(selected.id, (el) => ({
                    ...el,
                    params: { ...el.params, omega_nom: Number.isFinite(v) ? rpmToRadS(v) : null },
                  }))
                }
              />
            </>
          ) : null}
          {selected.kind === 'gearbox' ? (
            <>
              <Num
                label="Передаточное отношение"
                value={Number(selected.params.ratio) || 0}
                onChange={(v) => patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, ratio: v } }))}
              />
              <Num
                label="КПД"
                value={Number(selected.params.efficiency) || 0}
                onChange={(v) => patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, efficiency: Math.min(1, Math.max(0, v)) } }))}
              />
            </>
          ) : null}
          {selected.kind === 'gripper' ? (
            <Num
              label="Раскрытие, мм"
              value={mToMm(Number(selected.params.opening) || 0)}
              onChange={(v) => patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, opening: mmToM(v) } }))}
            />
          ) : null}
          {selected.kind === 'chassis' ? (
            <Num
              label="Колея, мм"
              value={mToMm(Number(selected.params.track) || 0)}
              onChange={(v) => patchEl(selected.id, (el) => ({ ...el, params: { ...el.params, track: mmToM(v) } }))}
            />
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
          <button
            className="btn ghost"
            type="button"
            onClick={() => onChange({ ...model, ee_id: selected.id })}
          >
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
              <Num
                label={joint.kind === 'revolute' ? 'Угол, °' : 'Ход, мм'}
                value={joint.kind === 'revolute' ? radToDeg(joint.q) : mToMm(joint.q)}
                onChange={(v) =>
                  patchJoint(joint.id, (j) => {
                    const q = joint.kind === 'revolute' ? degToRad(v) : mmToM(v)
                    return { ...j, q: clampJoint(j, q) }
                  })
                }
              />
              <input
                type="range"
                min={joint.q_min ?? (joint.kind === 'revolute' ? -Math.PI : 0)}
                max={joint.q_max ?? (joint.kind === 'revolute' ? Math.PI : 0.3)}
                step={joint.kind === 'revolute' ? 0.01 : 0.001}
                value={joint.q}
                onChange={(e) => patchJoint(joint.id, (j) => ({ ...j, q: clampJoint(j, Number(e.target.value)) }))}
              />
              <Num
                label={joint.kind === 'revolute' ? 'Мин. угол, °' : 'Мин. ход, мм'}
                value={joint.q_min == null ? '' : joint.kind === 'revolute' ? radToDeg(joint.q_min) : mToMm(joint.q_min)}
                optional
                onChange={(v) =>
                  patchJoint(joint.id, (j) => {
                    const next = {
                      ...j,
                      q_min: Number.isFinite(v) ? (joint.kind === 'revolute' ? degToRad(v) : mmToM(v)) : null,
                    }
                    return { ...next, q: clampJoint(next, next.q) }
                  })
                }
              />
              <Num
                label={joint.kind === 'revolute' ? 'Макс. угол, °' : 'Макс. ход, мм'}
                value={joint.q_max == null ? '' : joint.kind === 'revolute' ? radToDeg(joint.q_max) : mToMm(joint.q_max)}
                optional
                onChange={(v) =>
                  patchJoint(joint.id, (j) => {
                    const next = {
                      ...j,
                      q_max: Number.isFinite(v) ? (joint.kind === 'revolute' ? degToRad(v) : mmToM(v)) : null,
                    }
                    return { ...next, q: clampJoint(next, next.q) }
                  })
                }
              />
            </>
          ) : null}
        </>
      ) : null}
    </aside>
  )
}

function Num({
  label,
  value,
  onChange,
  optional,
  min,
}: {
  label: string
  value: number | string
  onChange: (v: number) => void
  optional?: boolean
  min?: number
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        value={typeof value === 'number' && Number.isFinite(value) ? String(Number(value.toFixed(3))) : value}
        onChange={(e) => {
          const raw = e.target.value
          if (optional && raw.trim() === '') {
            onChange(Number.NaN)
            return
          }
          const n = parseFinite(raw, Number(value) || 0)
          if (min != null && n < min) return
          onChange(n)
        }}
        onBlur={(e) => {
          if (optional && e.target.value.trim() === '') onChange(Number.NaN)
        }}
      />
    </div>
  )
}
