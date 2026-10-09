import { findDiffPlatform, findSerial2R, gearboxOutput, staticMoment, wheelLinearSpeed, workspaceReach } from '../../model/mechanics/kinematics'
import { solvePoses } from '../../model/mechanics/geometry'
import { mToMm, radToDeg, radSToRpm } from '../../model/mechanics/units'
import { validateMechanics } from '../../model/mechanics/validate'
import type { MechanicsModel } from '../../model/mechanics/types'

export function MechanicsResults({
  model,
  tab,
  onTab,
  collapsed,
  onCollapsed,
  onModel,
  catalogIds,
}: {
  model: MechanicsModel
  tab: 'mech' | 'kin' | 'move' | 'issues'
  onTab: (t: 'mech' | 'kin' | 'move' | 'issues') => void
  collapsed: boolean
  onCollapsed: (v: boolean) => void
  onModel: (next: MechanicsModel) => void
  catalogIds?: Set<string>
}) {
  const { poses } = solvePoses(model)
  const arm = findSerial2R(model, poses)
  const plat = findDiffPlatform(model, poses)
  const issues = validateMechanics(model, catalogIds)
  const moment = staticMoment(model.load_mass, model.load_lever)

  return (
    <section className={`mech-results ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="mech-results-bar">
        <div className="mech-tabs">
          {(
            [
              ['mech', 'Механизм'],
              ['kin', 'Кинематика'],
              ['move', 'Движение'],
              ['issues', `Проверка (${issues.length})`],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" className={tab === id ? 'on' : ''} onClick={() => onTab(id)}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="btn ghost" onClick={() => onCollapsed(!collapsed)}>
          {collapsed ? 'Развернуть' : 'Свернуть'}
        </button>
      </div>
      {collapsed ? null : (
        <div className="mech-results-body">
          {tab === 'mech' ? (
            <p className="hint">
              Элементов: {model.elements.length}. Соединений: {model.joints.length}. Единицы модели — метры и радианы;
              в полях — миллиметры и градусы.
            </p>
          ) : null}
          {tab === 'kin' ? (
            <>
              {arm ? (
                <p>
                  Двухзвенный манипулятор: L1={mToMm(arm.l1).toFixed(0)} мм, L2={mToMm(arm.l2).toFixed(0)} мм, θ1=
                  {radToDeg(arm.t1).toFixed(1)}°, θ2={radToDeg(arm.t2).toFixed(1)}°. Рабочий орган x={mToMm(arm.ee.x).toFixed(1)} мм, y=
                  {mToMm(arm.ee.y).toFixed(1)} мм. Досягаемость {mToMm(workspaceReach(arm.l1, arm.l2).min).toFixed(0)}–
                  {mToMm(workspaceReach(arm.l1, arm.l2).max).toFixed(0)} мм.
                </p>
              ) : (
                <p className="hint">Соберите цепочку основание → шарнир → звено → шарнир → звено для прямой кинематики 2R.</p>
              )}
              {plat?.motion.ok ? (
                <p>
                  Дифф. платформа: v={plat.motion.v.toFixed(3)} м/с, ω={plat.motion.w.toFixed(3)} рад/с. Проскальзывание и динамика шин не
                  учитываются.
                </p>
              ) : (
                <p className="hint">Для платформы нужны корпус и два ведущих колеса (левое/правое).</p>
              )}
            </>
          ) : null}
          {tab === 'move' ? (
            <>
              {plat ? (
                <p>
                  ωL={radSToRpm(plat.wL).toFixed(1)} об/мин, ωR={radSToRpm(plat.wR).toFixed(1)} об/мин, r={mToMm(plat.r).toFixed(0)} мм, колея=
                  {mToMm(plat.track).toFixed(0)} мм, v_колеса={wheelLinearSpeed(plat.r, plat.wR).toFixed(3)} м/с.
                </p>
              ) : null}
              {model.elements.some((e) => e.kind === 'gearbox') ? (
                <p className="hint">
                  {gearboxOutput(1, Number(model.elements.find((e) => e.kind === 'gearbox')?.params.ratio) || 10).note}
                </p>
              ) : null}
              <div className="mech-inline">
                <label>
                  Масса груза, кг
                  <input
                    value={model.load_mass ?? ''}
                    onChange={(e) =>
                      onModel({
                        ...model,
                        load_mass: e.target.value === '' ? null : Number(e.target.value.replace(',', '.')),
                      })
                    }
                  />
                </label>
                <label>
                  Плечо, мм
                  <input
                    value={model.load_lever == null ? '' : mToMm(model.load_lever)}
                    onChange={(e) =>
                      onModel({
                        ...model,
                        load_lever: e.target.value === '' ? null : Number(e.target.value.replace(',', '.')) / 1000,
                      })
                    }
                  />
                </label>
              </div>
              {moment.ok ? (
                <p>
                  Упрощённая оценка M = m g L = {moment.M.toFixed(3)} Н·м. Не включает массу звеньев, инерцию, трение и не подтверждает
                  безопасность механизма.
                </p>
              ) : (
                <p className="hint">Для момента укажите массу и плечо.</p>
              )}
            </>
          ) : null}
          {tab === 'issues' ? (
            issues.length ? (
              <ul className="mech-issues">
                {issues.map((issue, i) => (
                  <li key={i} className={issue.level}>
                    {issue.level === 'error' ? 'Ошибка' : 'Предупреждение'}: {issue.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hint">Замечаний нет.</p>
            )
          ) : null}
        </div>
      )}
    </section>
  )
}
