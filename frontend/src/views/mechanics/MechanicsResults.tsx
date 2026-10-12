import { findDiffPlatform, findSerial2R, workspaceReach } from '../../model/mechanics/kinematics'
import { numParam, solvePoses } from '../../model/mechanics/geometry'
import { accelTime, linearAxisSpeed, odometry, pathLength, stoppingDistance, travelTime } from '../../model/mechanics/motion'
import { massBreakdown, minObstacleDistance } from '../../model/mechanics/mass'
import { useProjectStore } from '../../store/useProjectStore'
import { robotInflate } from '../../model/mechanics/stages'
import { mToMm, radToDeg } from '../../model/mechanics/units'
import type { KinStageId, MechanicsModel } from '../../model/mechanics/types'

function Card({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: string
  note?: string
  tone?: 'ok' | 'warn' | 'err' | 'mute'
}) {
  return (
    <article className={`kin-metric ${tone ? `is-${tone}` : ''}`}>
      <div className="kin-metric-label">{label}</div>
      <div className="kin-metric-value">{value}</div>
      {note ? <p className="hint">{note}</p> : null}
    </article>
  )
}

export function MechanicsResults({ model, step }: { model: MechanicsModel; step: KinStageId }) {
  const components = useProjectStore((s) => s.project?.components) || []
  const { poses } = solvePoses(model)
  const arm = findSerial2R(model, poses)
  const plat = findDiffPlatform(model, poses)
  const len = model.path && model.path.points.length > 1 ? pathLength(model.path.points) : null
  const time = len != null ? travelTime(len, model.motion.v_max ?? model.motion.v, model.motion.acc, model.motion.dec) : null
  const inflate = robotInflate(model)
  const vias = model.waypoints.filter((w) => w.role === 'via').length
  const hitName = model.path?.collision_obstacle_id
    ? model.obstacles.find((o) => o.id === model.path?.collision_obstacle_id)?.name
    : null
  const gear = model.elements.find((e) => e.kind === 'gearbox')
  const motor = model.elements.find((e) => e.kind === 'motor')
  const pitch = gear ? Number(gear.params.pitch) : 0
  const axis = motor && pitch > 0 ? linearAxisSpeed(numParam(motor, 'omega'), pitch) : null
  const odo =
    plat && model.encoder_left != null && model.encoder_right != null
      ? odometry(plat.r, plat.track, model.encoder_left, model.encoder_right)
      : null

  return (
    <div className="kin-metrics">
      {step === 'mass' ? (
        <>
          {(() => {
            const b = massBreakdown(model, components)
            return (
              <>
                <Card
                  label="Известная масса"
                  value={`${b.known.toFixed(3)} кг`}
                  note={b.incomplete ? 'Неполная: часть масс не задана, нули не подставлялись.' : 'Все отмеченные позиции имеют массу.'}
                  tone={b.incomplete ? 'warn' : 'ok'}
                />
                {b.rows.map((r) => (
                  <Card
                    key={r.id}
                    label={r.name}
                    value={r.total == null ? 'Не задана' : `${r.total.toFixed(3)} кг`}
                    note={r.total != null && b.known > 0 ? `${((r.total / b.known) * 100).toFixed(1)}% известной массы · ${r.qty} шт.` : `${r.qty} шт.`}
                    tone={r.total == null ? 'warn' : undefined}
                  />
                ))}
              </>
            )
          })()}
        </>
      ) : null}
      {step === 'robot' ? (
        plat?.motion.ok ? (
          <Card
            label="Модель"
            value="Дифф. платформа"
            note={`v = ${plat.motion.v.toFixed(3)} м/с при текущих ω колёс. Это кинематика, не динамика.`}
            tone="ok"
          />
        ) : arm ? (
          <Card
            label="Модель"
            value="Двухзвенник 2R"
            note={`Досягаемость ${mToMm(workspaceReach(arm.l1, arm.l2).min).toFixed(0)}–${mToMm(workspaceReach(arm.l1, arm.l2).max).toFixed(0)} мм.`}
            tone="ok"
          />
        ) : (
          <Card label="Модель" value="Не собрана" note="Выберите заготовку или добавьте элементы." tone="mute" />
        )
      ) : null}
      {step === 'map' ? (
        <Card
          label="Препятствия"
          value={String(model.obstacles.length)}
          note={model.obstacles.length ? 'Учитываются при построении и проверке пути.' : 'Можно продолжить без препятствий.'}
          tone={model.obstacles.length ? 'ok' : 'mute'}
        />
      ) : null}
      {step === 'path' || step === 'motion' || step === 'check' ? (
        <>
          <Card
            label="Длина маршрута"
            value={len != null ? `${len.toFixed(3)} м` : '—'}
            note={
              model.path
                ? model.path.source === 'astar'
                  ? 'Источник: A* по сетке, не оптимальная траектория.'
                  : 'Источник: ломаная по точкам, не поиск A*.'
                : 'Маршрут ещё не построен.'
            }
            tone={model.path?.collision_obstacle_id ? 'err' : model.path && !model.path.stale ? 'ok' : 'mute'}
          />
          <Card
            label="Проверка столкновений"
            value={hitName ? 'Пересечение' : model.path && !model.path.stale ? 'Чисто' : '—'}
            note={
              hitName
                ? `Конфликт с «${hitName}». Габарит — окружность R=${inflate.toFixed(3)} м.`
                : `Модель габарита: окружность по диагонали корпуса, R=${inflate.toFixed(3)} м.`
            }
            tone={hitName ? 'err' : model.path && !model.path.stale ? 'ok' : 'mute'}
          />
          {vias ? <Card label="Промежуточные точки" value={String(vias)} /> : null}
        </>
      ) : null}
      {step === 'motion' || step === 'check' ? (
        <>
          <Card
            label="Время движения"
            value={time?.ok ? `${time.t.toFixed(2)} с` : '—'}
            note={
              time?.ok
                ? `Профиль «${time.profile}»${model.motion.stale ? '. Оценка устарела — подтвердите расчёт' : ''}.`
                : time && !time.ok
                  ? time.reason
                  : 'Задайте скорость и постройте путь.'
            }
            tone={time?.ok && !model.motion.stale ? 'ok' : time?.ok ? 'warn' : 'mute'}
          />
          {time?.ok && len != null && len > 0 ? (
            <Card
              label="Средняя скорость"
              value={`${(len / time.t).toFixed(3)} м/с`}
              note={`Оценка s/t по профилю, не измерение. v_max = ${(model.motion.v_max ?? model.motion.v ?? 0).toFixed(3)} м/с.`}
            />
          ) : null}
          {(() => {
            const vmax = model.motion.v_max ?? model.motion.v
            const stop = vmax != null ? stoppingDistance(vmax, model.motion.dec) : null
            const acc = vmax != null ? accelTime(vmax, model.motion.acc) : null
            return (
              <>
                {stop ? (
                  <Card
                    label="Остановочный путь"
                    value={stop.ok ? `${stop.s.toFixed(3)} м` : '—'}
                    note={stop.ok ? 's = v² / 2d при текущем v_max. Без учёта задержки привода.' : stop.reason}
                    tone={stop.ok ? 'ok' : 'mute'}
                  />
                ) : null}
                {acc ? (
                  <Card
                    label="Время разгона"
                    value={acc.ok ? `${acc.t.toFixed(2)} с` : '—'}
                    note={acc.ok ? 't = v / a до v_max, оценка.' : acc.reason}
                  />
                ) : null}
              </>
            )
          })()}
          {plat?.motion.ok ? (
            <Card
              label="Угловая скорость"
              value={`${plat.motion.w.toFixed(3)} рад/с`}
              note={`Радиус поворота ${Number.isFinite(plat.motion.v / (plat.motion.w || 1e-12)) ? (Math.abs(plat.motion.w) < 1e-9 ? '∞' : (plat.motion.v / plat.motion.w).toFixed(3)) : '—'} м. Кинематика колёс, не динамика.`}
            />
          ) : null}
          {(() => {
            const start = model.waypoints.find((w) => w.role === 'start')
            const d = start ? minObstacleDistance(model, start.x, start.y) : null
            return d != null ? (
              <Card label="До препятствия (старт)" value={`${d.toFixed(3)} м`} note="Кратчайшее расстояние от старта до геометрии препятствия, без габарита робота." />
            ) : null
          })()}
        </>
      ) : null}
      {step === 'motion' && axis?.ok ? (
        <Card label="Линейная ось" value={`${axis.v.toFixed(4)} м/с`} note="v = ω·p / 2π по шагу передачи." />
      ) : null}
      {step === 'check' && odo?.ok ? (
        <Card label="Одометрия" value={`Δs ${odo.ds.toFixed(3)} м`} note={`Δθ = ${radToDeg(odo.dtheta).toFixed(1)}°. Без проскальзывания.`} />
      ) : null}
    </div>
  )
}

export function CheckList({ model }: { model: MechanicsModel }) {
  const { poses } = solvePoses(model)
  const plat = findDiffPlatform(model, poses)
  const len = model.path && model.path.points.length > 1 ? pathLength(model.path.points) : null
  const time = len != null ? travelTime(len, model.motion.v_max ?? model.motion.v, model.motion.acc, model.motion.dec) : null
  const items = [
    {
      ok: !model.path?.collision_obstacle_id && !!model.path && !model.path.stale,
      wait: !model.path,
      title: 'Столкновения',
      text: model.path?.collision_obstacle_id
        ? 'Маршрут пересекает препятствие с учётом габарита.'
        : model.path?.stale
          ? 'Маршрут устарел после изменения карты или робота.'
          : model.path
            ? 'Пересечений на заявленной модели не найдено.'
            : 'Маршрут ещё не проверялся.',
    },
    {
      ok: plat?.motion.ok || (model.task !== 'diff' && model.task !== 'diff4'),
      wait: (model.task === 'diff' || model.task === 'diff4') && !plat,
      title: 'Геометрия',
      text:
        model.task === 'diff' || model.task === 'diff4'
          ? plat?.motion.ok
            ? 'Корпус, колея и радиусы колёс заданы. Габарит для столкновений — окружность.'
            : plat?.motion.reason || 'Недостаточно данных платформы.'
          : 'Для этой модели геометрическая проверка карты не требуется.',
    },
    {
      ok: !!(time && time.ok && !model.motion.stale),
      wait: !time || !time.ok,
      title: 'Скорость и время',
      text: time?.ok
        ? model.motion.stale
          ? 'Есть расчёт, но исходные данные изменились.'
          : `Профиль «${time.profile}», t = ${time.t.toFixed(2)} с.`
        : time && !time.ok
          ? time.reason
          : 'Время не рассчитывалось.',
    },
    {
      ok: !model.path?.stale && !model.motion.stale,
      wait: false,
      title: 'Актуальность',
      text: model.path?.stale || model.motion.stale ? 'Пересчитайте маршрут или время.' : 'Результаты соответствуют текущим данным.',
    },
    {
      ok: true,
      wait: false,
      title: 'Ограничения модели',
      text: 'Габарит — окружность, не многоугольник. Нет динамики, проскальзывания и оптимальной траектории.',
    },
  ]
  return (
    <ul className="kin-checks">
      {items.map((it) => (
        <li key={it.title} className={it.wait ? 'is-wait' : it.ok ? 'is-ok' : 'is-err'}>
          <strong>{it.title}</strong>
          <span>{it.text}</span>
        </li>
      ))}
    </ul>
  )
}
