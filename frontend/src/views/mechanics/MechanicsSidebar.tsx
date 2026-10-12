import { useState } from 'react'
import { KIND_LABEL, MECH_GROUPS } from '../../model/mechanics/catalog'
import { markPathStale } from '../../model/mechanics/factory'
import { numParam } from '../../model/mechanics/geometry'
import { emptyMechanical } from '../../model/defaults'
import { architectureCandidates, massBreakdown, parseMassKg } from '../../model/mechanics/mass'
import { mToMm, mmToM, radSToRpm, rpmToRadS } from '../../model/mechanics/units'
import { useProjectStore } from '../../store/useProjectStore'
import type { KinStageId, KinTaskKind, MechCanvasTool, MechElement, MechKind, MechObstacle, MechanicsModel, MechWaypoint } from '../../model/mechanics/types'
import { CheckList, MechanicsResults } from './MechanicsResults'
import { ParamField } from './ParamField'

const COPY: Record<
  KinStageId,
  { title: string; how: string; why: string; result: string; next: string; back?: string }
> = {
  robot: {
    title: 'Шаг 1. Настройте робота',
    how: 'Выберите готовую конструкцию или соберите робота вручную. Укажите размеры и ограничения движения — они нужны для проверки столкновений и расчёта времени.',
    why: 'Габариты задают, сколько места занимает платформа на карте. Скорости колёс и корпуса влияют на оценку движения.',
    result: 'Модель с геометрией, пригодная для карты и расчётов.',
    next: 'Продолжить',
  },
  mass: {
    title: 'Шаг 2. Компоненты и масса',
    how: 'Проверьте массу узлов модели. Отметьте компоненты архитектурной канвы, которые входят в движущуюся конструкцию. Незаданная масса не подставляется.',
    why: 'Известная масса нужна для оценок, но без корпуса, колёс и креплений итог неполный.',
    result: 'Сумма известных масс и список неучтённых частей.',
    next: 'Продолжить',
    back: 'Назад к роботу',
  },
  map: {
    title: 'Карта и препятствия',
    how: 'Добавьте стены, прямоугольники и круги в реальных метрах. Препятствия необязательны: пустая карта тоже допустима.',
    why: 'Карта — система координат, относительно которой строится и проверяется маршрут. Масштаб экрана не меняет метры.',
    result: 'Рабочая область с известными препятствиями (или без них).',
    next: 'Продолжить к маршруту',
    back: 'Назад',
  },
  path: {
    title: 'Постройте маршрут',
    how: 'Поставьте старт и цель, при необходимости промежуточные точки. Затем постройте ломаную по точкам или обход A*. Прямая линия — не результат A*.',
    why: 'Нужен геометрический путь, который можно проверить на столкновения с учётом габарита робота.',
    result: 'Ломаная в метрах карты и отчёт о пересечениях.',
    next: 'Перейти к расчёту движения',
    back: 'Назад к карте',
  },
  motion: {
    title: 'Шаг 4. Рассчитайте движение',
    how: 'Задайте максимальную скорость, ускорение и торможение. Приложение оценит время по трапецеидальному профилю вдоль длины пути.',
    why: 'Это расчёт времени, а не физическая симуляция: инерция корпуса и проскальзывание не учитываются.',
    result: 'Длина пути, тип профиля и расчётное время.',
    next: 'Проверить результат',
    back: 'Назад к маршруту',
  },
  check: {
    title: 'Шаг 5. Проверка движения',
    how: 'Просмотрите каждый пункт: столкновения, геометрию, скорость и актуальность данных. Если маршрут допустим, робот пройдёт его по профилю скорости. При проблеме вернитесь к нужному шагу.',
    why: 'Отдельные статусы показывают, что именно проверено, а что ещё нет.',
    result: 'Сводный отчёт без общего «готово», если часть проверок не выполнялась.',
    next: '',
    back: 'Изменить параметры движения',
  },
}

export function MechanicsSidebar({
  model,
  step,
  selected,
  selectedCount,
  obstacle,
  waypoint,
  canvasTool,
  planMsg,
  planReason,
  timeReason,
  continueReason,
  onTask,
  onTemplate,
  onAdd,
  onChange,
  onTool,
  onPlan,
  onTime,
  onContinue,
  onBack,
  onGo,
  sim,
  onPlay,
  onPause,
  onReset,
  onRate,
}: {
  model: MechanicsModel
  step: KinStageId
  selected: MechElement | null
  selectedCount?: number
  obstacle: MechObstacle | null
  waypoint: MechWaypoint | null
  canvasTool: MechCanvasTool
  planMsg: string
  planReason: string | null
  timeReason: string | null
  continueReason: string | null
  onTask: (t: KinTaskKind) => void
  onTemplate: (t: KinTaskKind) => void
  onAdd: (k: MechKind) => void
  onChange: (next: MechanicsModel) => void
  onTool: (t: MechCanvasTool) => void
  onPlan: (mode: 'waypoints' | 'astar') => void
  onTime: () => void
  onContinue: () => void
  onBack: () => void
  onGo: (step: KinStageId) => void
  sim: {
    t: number
    playing: boolean
    rate: number
    v: number
    s: number
    total: number
    hit: string
    canPlay: boolean
    stale: boolean
  }
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  onRate: (r: number) => void
}) {
  const [help, setHelp] = useState(true)
  const [why, setWhy] = useState(false)
  const copy = COPY[step]
  const chassis = model.elements.find((e) => e.kind === 'chassis')
  const groupCount = selectedCount ?? 0
  const left = model.elements.find((e) => e.kind === 'wheel' && e.params.side === 'left')
  const right = model.elements.find((e) => e.kind === 'wheel' && e.params.side === 'right')

  const patchEl = (id: string, fn: (el: MechElement) => MechElement, stale = false) => {
    const next = { ...model, elements: model.elements.map((el) => (el.id === id ? fn(el) : el)) }
    onChange(stale ? markPathStale(next) : next)
  }

  return (
    <aside className="kin-side">
      <div className="kin-side-scroll">
        <header className="kin-step-head">
          <h2>{copy.title}</h2>
          {help ? (
            <div className="kin-help">
              <p>{copy.how}</p>
              <p className="hint">Результат шага: {copy.result}</p>
              <button type="button" className="btn ghost" onClick={() => setHelp(false)}>
                Свернуть подсказку
              </button>
            </div>
          ) : (
            <button type="button" className="btn ghost" onClick={() => setHelp(true)}>
              Что делать на этом шаге
            </button>
          )}
        </header>

        {groupCount > 1 ? (
          <p className="hint">Выбрано объектов: {groupCount}. Групповое редактирование свойств недоступно. Перемещение и удаление действуют на всю группу.</p>
        ) : null}

        {step === 'robot' ? (
          <>
            <section className="kin-group">
              <h3>Заготовка</h3>
              <p className="hint">Числа в заготовках примерные, не характеристики серийных моделей. Структура — реальные узлы и связи.</p>
              <div className="kin-toolrow">
                <button type="button" className="btn" onClick={() => onTemplate('diff')} title="Два ведущих колеса и опорное. Оценка движения по плоскости.">
                  2WD дифф.
                </button>
                <button type="button" className="btn ghost" onClick={() => onTemplate('diff4')} title="Четыре колеса, ским-привод. Нет модели проскальзывания.">
                  4WD платформа
                </button>
                <button type="button" className="btn ghost" onClick={() => onTemplate('linear')} title="Линейное перемещение по направляющей с шагом передачи.">
                  Линейная ось
                </button>
                <button type="button" className="btn ghost" onClick={() => onTemplate('arm2r')} title="Прямая и обратная кинематика двухзвенника. Без карты.">
                  Двухзвенник
                </button>
                <button type="button" className="btn ghost" onClick={() => onTemplate('drone')} title="Квадрокоптер: корпус и роторы. Упрощённая 2.5D модель высоты, не аэродинамика.">
                  Дрон
                </button>
              </div>
              <p className="hint">
                {model.task === 'diff'
                  ? 'Дифференциальная платформа: маршрут по карте, кинематика колёс, без динамики.'
                  : model.task === 'diff4'
                    ? 'Четырёхколёсная платформа с типом привода skid: та же плоская кинематика, что и 2WD, без модели бокового сноса.'
                    : model.task === 'linear'
                      ? 'Линейная ось: скорость по ω и шагу винта. Карта мобильного робота не нужна.'
                      : model.task === 'arm2r'
                        ? 'Двухзвенник: достижимость точки в плоскости манипулятора.'
                        : model.task === 'drone'
                          ? 'Дрон: плоский маршрут плюс высота полёта. Это не аэродинамическая симуляция.'
                          : 'Произвольная сборка. Этапы зависят от выбранного типа.'}
              </p>
              <div className="field">
                <label>Тип модели</label>
                <select value={model.task} onChange={(e) => onTask(e.target.value as KinTaskKind)}>
                  <option value="custom">Произвольная</option>
                  <option value="diff">Двухколёсный дифференциальный</option>
                  <option value="diff4">Четырёхколёсная платформа</option>
                  <option value="linear">Линейная ось</option>
                  <option value="arm2r">Двухзвенный манипулятор</option>
                  <option value="drone">Дрон</option>
                </select>
              </div>
            </section>
            {chassis && model.task !== 'arm2r' && model.task !== 'linear' ? (
              <section className="kin-group">
                <h3>Габариты робота</h3>
                <p className="hint">Для столкновений используется окружность по диагонали корпуса.</p>
                <ParamField
                  label="Длина"
                  unit="мм"
                  value={mToMm(numParam(chassis, 'length', 0.24))}
                  min={50}
                  max={800}
                  step={1}
                  slider
                  onChange={(v) => v != null && patchEl(chassis.id, (el) => ({ ...el, params: { ...el.params, length: mmToM(v) } }), true)}
                />
                <ParamField
                  label="Ширина"
                  unit="мм"
                  value={mToMm(numParam(chassis, 'width', 0.16))}
                  min={40}
                  max={600}
                  step={1}
                  slider
                  onChange={(v) => v != null && patchEl(chassis.id, (el) => ({ ...el, params: { ...el.params, width: mmToM(v) } }), true)}
                />
                {model.task === 'drone' ? (
                  <>
                    <ParamField
                      label="Высота корпуса"
                      unit="мм"
                      value={mToMm(numParam(chassis, 'body_height', 0.1))}
                      min={20}
                      max={400}
                      step={1}
                      slider
                      hint="Вертикальный габарит рамы. Участвует в проверке пролёта."
                      onChange={(v) => v != null && patchEl(chassis.id, (el) => ({ ...el, params: { ...el.params, body_height: mmToM(v) } }), true)}
                    />
                    <p className="hint">Роторов: {model.elements.filter((e) => e.kind === 'motor').length}. Модель 2.5D, без аэродинамики.</p>
                  </>
                ) : (
                  <>
                    <ParamField
                      label="Колея"
                      unit="мм"
                      value={mToMm(numParam(chassis, 'track', 0.18))}
                      min={40}
                      max={800}
                      step={1}
                      slider
                      hint="Расстояние между ведущими колёсами."
                      onChange={(v) => v != null && patchEl(chassis.id, (el) => ({ ...el, params: { ...el.params, track: mmToM(v) } }), true)}
                    />
                    <p className="hint">
                      Колёс: {model.elements.filter((e) => e.kind === 'wheel' || e.kind === 'caster').length}. Привод:{' '}
                      {String(chassis.params.drive || (model.task === 'diff4' ? 'skid' : 'diff'))}.
                    </p>
                  </>
                )}
              </section>
            ) : null}
            {(left || right) && model.task !== 'arm2r' && model.task !== 'linear' && model.task !== 'drone' ? (
              <section className="kin-group">
                <h3>Колёсный привод</h3>
                {left ? (
                  <ParamField
                    label="Радиус левого"
                    unit="мм"
                    value={mToMm(numParam(left, 'radius', 0.04))}
                    min={5}
                    max={200}
                    step={1}
                    slider
                    onChange={(v) => v != null && patchEl(left.id, (el) => ({ ...el, params: { ...el.params, radius: mmToM(v) } }), true)}
                  />
                ) : null}
                {right ? (
                  <ParamField
                    label="Радиус правого"
                    unit="мм"
                    value={mToMm(numParam(right, 'radius', 0.04))}
                    min={5}
                    max={200}
                    step={1}
                    slider
                    onChange={(v) => v != null && patchEl(right.id, (el) => ({ ...el, params: { ...el.params, radius: mmToM(v) } }), true)}
                  />
                ) : null}
                {left ? (
                  <ParamField
                    label="ω левого"
                    unit="об/мин"
                    value={radSToRpm(numParam(left, 'omega'))}
                    min={-300}
                    max={300}
                    step={1}
                    slider
                    hint="Текущая скорость колеса для кинематики платформы, не ограничение маршрута."
                    onChange={(v) => v != null && patchEl(left.id, (el) => ({ ...el, params: { ...el.params, omega: rpmToRadS(v) } }))}
                  />
                ) : null}
                {right ? (
                  <ParamField
                    label="ω правого"
                    unit="об/мин"
                    value={radSToRpm(numParam(right, 'omega'))}
                    min={-300}
                    max={300}
                    step={1}
                    slider
                    onChange={(v) => v != null && patchEl(right.id, (el) => ({ ...el, params: { ...el.params, omega: rpmToRadS(v) } }))}
                  />
                ) : null}
              </section>
            ) : null}
            {model.task !== 'arm2r' ? (
              <section className="kin-group">
                <h3>Ограничения движения</h3>
                <MotionLite model={model} onChange={onChange} showW={model.task !== 'drone'} />
                <button type="button" className="linkish" onClick={() => setWhy((v) => !v)}>
                  {why ? 'Скрыть' : 'Зачем нужны эти параметры?'}
                </button>
                {why ? <p className="hint">{copy.why}</p> : null}
              </section>
            ) : null}
            <details className="kin-more">
              <summary>Добавить элемент вручную</summary>
              <div className="kin-toolrow">
                {MECH_GROUPS.flatMap((g) => g.kinds).map((kind) => (
                  <button key={kind} type="button" className="btn ghost" onClick={() => onAdd(kind)}>
                    {KIND_LABEL[kind]}
                  </button>
                ))}
              </div>
            </details>
          </>
        ) : null}

        {step === 'mass' ? <MassStep model={model} onChange={onChange} /> : null}

        {step === 'map' ? (
          <>
            <section className="kin-group">
              <h3>Инструменты</h3>
              <p className="hint">«Стена» — нажмите и протяните. «Прямоугольник» — нарисуйте область. «Выбор» — перемещайте объекты. Колёсико — масштаб, ПКМ — панорама.</p>
              <div className="kin-toolrow">
                {(
                  [
                    ['select', 'Выбор'],
                    ['line', 'Стена'],
                    ['rect', 'Прямоугольник'],
                    ['circle', 'Круг'],
                  ] as const
                ).map(([id, label]) => (
                  <button key={id} type="button" className={`btn ${canvasTool === id ? '' : 'ghost'}`} onClick={() => onTool(id)}>
                    {label}
                  </button>
                ))}
              </div>
            </section>
            <section className="kin-group">
              <h3>Рабочая область</h3>
              <WorkspaceLite model={model} onChange={onChange} />
            </section>
            {obstacle && groupCount <= 1 ? <ObstacleEditor model={model} obstacle={obstacle} onChange={onChange} /> : null}
          </>
        ) : null}

        {step === 'path' ? (
          <>
            <section className="kin-group">
              <h3>Точки маршрута</h3>
              <p className="hint">Старт задаёт положение и ориентацию. Цель — куда ехать. Промежуточные точки обязательны к прохождению.</p>
              <div className="kin-toolrow">
                {(
                  [
                    ['select', 'Выбор'],
                    ['start', 'Старт'],
                    ['goal', 'Цель'],
                    ['via', 'Точка'],
                  ] as const
                ).map(([id, label]) => (
                  <button key={id} type="button" className={`btn ${canvasTool === id ? '' : 'ghost'}`} onClick={() => onTool(id)}>
                    {label}
                  </button>
                ))}
              </div>
            </section>
            {waypoint ? <WaypointEditor model={model} waypoint={waypoint} onChange={onChange} /> : null}
            <section className="kin-group">
              <h3>Построение</h3>
              <button type="button" className="btn" disabled={!!planReason} title={planReason || ''} onClick={() => onPlan('waypoints')}>
                Построить по точкам
              </button>
              <button type="button" className="btn ghost" disabled={!!planReason} title={planReason || ''} onClick={() => onPlan('astar')}>
                Найти обход A*
              </button>
              {planReason ? <p className="hint">{planReason}</p> : <p className="hint">A* ищет путь по сетке с учётом габарита. Это не оптимальная траектория.</p>}
              {planMsg ? <p className="hint">{planMsg}</p> : null}
            </section>
          </>
        ) : null}

        {step === 'motion' ? (
          <section className="kin-group">
            <h3>Ограничения движения</h3>
            <p className="hint">Слайдер удобен для оценки влияния; точное значение введите в поле справа.</p>
            <MotionLite model={model} onChange={onChange} showW={model.task === 'diff' || model.task === 'diff4' || model.task === 'custom'} />
            <button type="button" className="btn" disabled={!!timeReason} title={timeReason || ''} onClick={onTime}>
              Рассчитать время
            </button>
            {timeReason ? <p className="hint">{timeReason}</p> : null}
            {planMsg ? <p className="hint">{planMsg}</p> : null}
            {model.task !== 'arm2r' && model.task !== 'linear' ? (
              <>
                <h3>Симуляция по профилю</h3>
                <p className="hint">Положение считается от времени симуляции и трапеции скорости, не от числа кадров. Скорость воспроизведения не меняет физическое t.</p>
                <div className="kin-toolrow">
                  <button type="button" className="btn" disabled={!sim.canPlay || sim.playing} title={!sim.canPlay ? 'Сначала рассчитайте маршрут и время' : ''} onClick={onPlay}>
                    {sim.t > 0 && !sim.playing ? 'Продолжить' : 'Запустить'}
                  </button>
                  <button type="button" className="btn ghost" disabled={!sim.playing} onClick={onPause}>
                    Пауза
                  </button>
                  <button type="button" className="btn ghost" onClick={onReset}>
                    Сбросить
                  </button>
                </div>
                <div className="kin-toolrow">
                  {([0.25, 0.5, 1, 2] as const).map((r) => (
                    <button key={r} type="button" className={`btn ${sim.rate === r ? '' : 'ghost'}`} onClick={() => onRate(r)}>
                      {r}×
                    </button>
                  ))}
                </div>
                <p className="hint">
                  t = {sim.t.toFixed(2)} с / {sim.total.toFixed(2)} с · s = {sim.s.toFixed(3)} м · v = {sim.v.toFixed(3)} м/с
                </p>
                {sim.stale ? <p className="hint">Результат устарел: изменились параметры. Пересчитайте перед запуском.</p> : null}
                {sim.hit ? <p className="hint">{sim.hit}</p> : null}
              </>
            ) : (
              <p className="hint">Для этой модели нет объезда по карте: симуляция платформы не запускается.</p>
            )}
          </section>
        ) : null}

        {step === 'check' ? (
          <>
            <CheckList model={model} />
            <div className="kin-toolrow">
              <button type="button" className="btn ghost" onClick={() => onGo('map')}>
                Вернуться к карте
              </button>
              <button type="button" className="btn ghost" onClick={() => onGo('path')}>
                Перестроить маршрут
              </button>
              <button type="button" className="btn ghost" onClick={() => onGo('motion')}>
                Изменить параметры движения
              </button>
            </div>
          </>
        ) : null}

        {selected && step === 'robot' ? (
          <p className="hint">Выбран «{selected.name}». Параметры модели выше относятся к корпусу и колёсам заготовки.</p>
        ) : null}

        <MechanicsResults model={model} step={step} />

        <details className="kin-more">
          <summary>Как рассчитано</summary>
          <HowCalculated model={model} step={step} />
        </details>
      </div>
      <footer className="kin-nav">
        {copy.back ? (
          <button type="button" className="btn ghost" onClick={onBack}>
            {copy.back}
          </button>
        ) : (
          <span />
        )}
        {copy.next ? (
          <div className="kin-nav-next">
            <button type="button" className="btn" disabled={!!continueReason} title={continueReason || ''} onClick={onContinue}>
              {copy.next}
            </button>
            {continueReason ? <p className="hint">{continueReason}</p> : step === 'map' && !model.obstacles.length ? <p className="hint">Препятствий нет — проверка будет без стен.</p> : null}
          </div>
        ) : null}
      </footer>
    </aside>
  )
}

function WorkspaceLite({ model, onChange }: { model: MechanicsModel; onChange: (n: MechanicsModel) => void }) {
  const ws = model.workspace
  const patch = (partial: Partial<typeof ws>) => onChange(markPathStale({ ...model, workspace: { ...ws, ...partial } }))
  return (
    <>
      <ParamField label="Ширина" unit="м" value={ws.width} min={0.4} max={8} step={0.1} slider onChange={(v) => v != null && patch({ width: v })} />
      <ParamField label="Высота" unit="м" value={ws.height} min={0.4} max={8} step={0.1} slider onChange={(v) => v != null && patch({ height: v })} />
      <ParamField label="Шаг сетки" unit="м" value={ws.grid} min={0.02} max={0.2} step={0.01} slider hint="Масштаб экрана не меняет физические размеры." onChange={(v) => v != null && patch({ grid: v })} />
    </>
  )
}

function MotionLite({
  model,
  onChange,
  showW = true,
}: {
  model: MechanicsModel
  onChange: (n: MechanicsModel) => void
  showW?: boolean
}) {
  const m = model.motion
  const patch = (partial: Partial<typeof m>) => onChange({ ...model, motion: { ...m, ...partial, stale: true } })
  return (
    <>
      <ParamField label="v max" unit="м/с" value={m.v_max} optional min={0} max={2} step={0.01} slider hint="Максимальная линейная скорость профиля." onChange={(v) => patch({ v_max: v })} />
      <ParamField label="Ускорение" unit="м/с²" value={m.acc} optional min={0} max={4} step={0.05} slider onChange={(v) => patch({ acc: v })} />
      <ParamField label="Торможение" unit="м/с²" value={m.dec} optional min={0} max={4} step={0.05} slider onChange={(v) => patch({ dec: v })} />
      {showW ? (
        <ParamField label="ω max" unit="рад/с" value={m.w_max} optional min={0} max={6} step={0.05} slider hint="Ограничение поворота; в оценке времени по длине пути не участвует." onChange={(v) => patch({ w_max: v })} />
      ) : null}
      {model.task === 'drone' ? (
        <ParamField
          label="Высота полёта"
          unit="м"
          value={m.altitude}
          optional
          min={0.05}
          max={8}
          step={0.05}
          slider
          hint="Высота центра рамы над плоскостью карты. Нижняя точка = высота − половина корпуса."
          onChange={(v) => patch({ altitude: v })}
        />
      ) : null}
    </>
  )
}

function ObstacleEditor({
  model,
  obstacle,
  onChange,
}: {
  model: MechanicsModel
  obstacle: MechObstacle
  onChange: (n: MechanicsModel) => void
}) {
  const patch = (partial: Partial<MechObstacle>) =>
    onChange(
      markPathStale({
        ...model,
        obstacles: model.obstacles.map((o) => (o.id === obstacle.id ? { ...o, ...partial } : o)),
      }),
    )
  return (
    <section className="kin-group">
      <h3>Параметры препятствия</h3>
      <div className="field">
        <label>Название</label>
        <input value={obstacle.name} onChange={(e) => patch({ name: e.target.value })} />
      </div>
      <ParamField label="X" unit="м" value={obstacle.x} min={0} max={model.workspace.width} step={0.01} slider onChange={(v) => v != null && patch({ x: v })} />
      <ParamField label="Y" unit="м" value={obstacle.y} min={0} max={model.workspace.height} step={0.01} slider onChange={(v) => v != null && patch({ y: v })} />
      {obstacle.kind === 'rect' ? (
        <>
          <ParamField label="Ширина" unit="м" value={obstacle.width} min={0.05} max={model.workspace.width} step={0.01} slider onChange={(v) => v != null && patch({ width: v })} />
          <ParamField label="Размер по Y" unit="м" value={obstacle.height} min={0.05} max={model.workspace.height} step={0.01} slider onChange={(v) => v != null && patch({ height: v })} />
        </>
      ) : obstacle.kind === 'circle' ? (
        <ParamField
          label="Диаметр"
          unit="м"
          value={obstacle.width}
          min={0.05}
          max={Math.max(model.workspace.width, model.workspace.height)}
          step={0.01}
          slider
          onChange={(v) => v != null && patch({ width: v, height: v })}
        />
      ) : (
        <>
          <ParamField label="X2" unit="м" value={obstacle.x2} min={0} max={model.workspace.width} step={0.01} slider onChange={(v) => v != null && patch({ x2: v })} />
          <ParamField label="Y2" unit="м" value={obstacle.y2} min={0} max={model.workspace.height} step={0.01} slider onChange={(v) => v != null && patch({ y2: v })} />
          <ParamField label="Толщина" unit="м" value={obstacle.thickness} min={0.005} max={0.2} step={0.005} slider onChange={(v) => v != null && patch({ thickness: v })} />
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
        hint="Вертикальный размер. Дрон пролетает, если нижняя точка рамы выше препятствия с зазором 2 см. Наземный робот высоту не использует."
        onChange={(v) => v != null && patch({ z_height: v })}
      />
    </section>
  )
}

function WaypointEditor({
  model,
  waypoint,
  onChange,
}: {
  model: MechanicsModel
  waypoint: MechWaypoint
  onChange: (n: MechanicsModel) => void
}) {
  const patch = (partial: Partial<MechWaypoint>, stale = true) => {
    const next = { ...model, waypoints: model.waypoints.map((w) => (w.id === waypoint.id ? { ...w, ...partial } : w)) }
    onChange(stale ? markPathStale(next) : next)
  }
  return (
    <section className="kin-group">
      <h3>Параметры маршрута</h3>
      <ParamField label="X" unit="м" value={waypoint.x} min={0} max={model.workspace.width} step={0.01} slider onChange={(v) => v != null && patch({ x: v })} />
      <ParamField label="Y" unit="м" value={waypoint.y} min={0} max={model.workspace.height} step={0.01} slider onChange={(v) => v != null && patch({ y: v })} />
    </section>
  )
}

function HowCalculated({ model, step }: { model: MechanicsModel; step: KinStageId }) {
  if (step === 'path' || step === 'check') {
    return (
      <p className="hint">
        Столкновение в плане: сегмент пути ближе к препятствию, чем R = hypot(L, W)/2 = {robotHint(model)}. Для дрона дополнительно
        сравнивается высота полёта с высотой препятствия. A* заполняет сетку с шагом {model.workspace.grid} м и не обещает кратчайший путь.
      </p>
    )
  }
  if (step === 'motion') {
    return (
      <p className="hint">
        Без ускорения t = s / v<sub>max</sub>. С ускорением a и торможением d — трапеция или треугольник, если разгон не успевает
        выйти на v<sub>max</sub>.
      </p>
    )
  }
  if (step === 'robot' && (model.task === 'diff' || model.task === 'diff4' || model.task === 'custom')) {
    return <p className="hint">v = r(ωR+ωL)/2, ω = r(ωR−ωL)/B. Проскальзывание не моделируется. Для 4WD используется та же плоская модель.</p>
  }
  if (step === 'robot' && model.task === 'drone') {
    return <p className="hint">Маршрут в плане как у платформы. Пролёт: (высота полёта − высота корпуса / 2) ≥ высота препятствия + 0,02 м.</p>
  }
  if (step === 'mass') {
    return <p className="hint">Известная масса = Σ (масса экземпляра × количество) только там, где поле задано. Пустое поле не заменяется нулём.</p>
  }
  return <p className="hint">Формулы текущего шага появляются здесь, когда есть исходные данные.</p>
}

function MassStep({ model, onChange }: { model: MechanicsModel; onChange: (n: MechanicsModel) => void }) {
  const project = useProjectStore((s) => s.project)
  const updateComponent = useProjectStore((s) => s.updateComponent)
  const components = project?.components || []
  const breakdown = massBreakdown(model, components)
  const ids = new Set(model.included_component_ids || [])
  const cands = architectureCandidates(components)
  return (
    <>
      <section className="kin-group">
        <h3>Узлы конструкции</h3>
        <table className="kin-mass-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>шт</th>
              <th>кг</th>
              <th>Σ</th>
            </tr>
          </thead>
          <tbody>
            {model.elements.map((el) => (
              <tr key={el.id}>
                <td>{el.name}</td>
                <td>1</td>
                <td>
                  <ParamField
                    label=""
                    unit="кг"
                    value={el.mass}
                    optional
                    min={0}
                    max={200}
                    step={0.01}
                    onChange={(v) =>
                      onChange({ ...model, elements: model.elements.map((e) => (e.id === el.id ? { ...e, mass: v } : e)) })
                    }
                  />
                </td>
                <td>{el.mass == null ? 'не задана' : el.mass.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="kin-group">
        <h3>С архитектурной канвы</h3>
        <p className="hint">Отметьте, что входит в движущуюся конструкцию. Клоны электрической канвы не учитываются повторно.</p>
        {cands.length ? (
          <ul className="kin-checks">
            {cands.map((c) => {
              const on = ids.has(c.id) || model.elements.some((e) => e.catalog_component_id === c.id)
              const unit = parseMassKg(c.mechanical?.weight)
              const qty = c.mechanical?.quantity && c.mechanical.quantity > 0 ? c.mechanical.quantity : 1
              return (
                <li key={c.id}>
                  <label className="kin-mass-row">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(e) => {
                        const next = new Set(ids)
                        if (e.target.checked) next.add(c.id)
                        else next.delete(c.id)
                        onChange({ ...model, included_component_ids: [...next] })
                      }}
                    />
                    <span>
                      <strong>{c.name}</strong> × {qty}
                      {unit == null ? ' · масса не задана' : ` · ${unit} кг × ${qty} = ${(unit * qty).toFixed(3)} кг`}
                    </span>
                  </label>
                  {on ? (
                    <ParamField
                      label="Масса экземпляра"
                      unit="кг"
                      value={unit}
                      optional
                      min={0}
                      max={200}
                      step={0.01}
                      onChange={(v) =>
                        updateComponent(c.id, { mechanical: { ...(c.mechanical || emptyMechanical()), weight: v == null ? '' : String(v) } })
                      }
                    />
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="hint">На архитектурной канве пока нет компонентов.</p>
        )}
      </section>
      <p className="hint">
        Известная масса {breakdown.known.toFixed(3)} кг
        {breakdown.incomplete ? `. Неполная: у ${breakdown.unknownCount} позиций масса не задана.` : '.'} Это не полная масса робота, пока нет всех частей конструкции.
      </p>
    </>
  )
}

function robotHint(model: MechanicsModel) {
  const ch = model.elements.find((e) => e.kind === 'chassis')
  if (!ch) return '0.08 м'
  const L = numParam(ch, 'length', 0.24)
  const W = numParam(ch, 'width', 0.16)
  return `${(Math.hypot(L, W) / 2).toFixed(3)} м`
}
