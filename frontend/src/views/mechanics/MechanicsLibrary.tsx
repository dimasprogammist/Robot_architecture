import { SearchField } from '../../components/SearchField'
import { JOINT_TOOLS, KIND_LABEL, MECH_GROUPS } from '../../model/mechanics/catalog'
import { stageList } from '../../model/mechanics/stages'
import type { KinTaskKind, MechCanvasTool, MechJointKind, MechKind, MechanicsModel } from '../../model/mechanics/types'

const STATUS: Record<string, string> = {
  idle: 'не начат',
  needs_data: 'нужны данные',
  ready: 'готов',
  done: 'выполнен',
  stale: 'пересчитать',
  error: 'ошибки',
}

export function MechanicsLibrary({
  model,
  query,
  onQuery,
  connectKind,
  onTool,
  onAdd,
  canvasTool,
  onCanvasTool,
  onTask,
  onTemplate,
  onPlan,
  onTime,
  planReason,
  timeReason,
}: {
  model: MechanicsModel
  query: string
  onQuery: (v: string) => void
  connectKind: MechJointKind | null
  onTool: (kind: MechJointKind | null) => void
  onAdd: (kind: MechKind) => void
  canvasTool: MechCanvasTool
  onCanvasTool: (t: MechCanvasTool) => void
  onTask: (task: KinTaskKind) => void
  onTemplate: (kind: KinTaskKind) => void
  onPlan: (mode: 'waypoints' | 'astar') => void
  onTime: () => void
  planReason: string | null
  timeReason: string | null
}) {
  const q = query.trim().toLowerCase()
  const stages = stageList(model)
  const showMap = model.task !== 'arm2r' && model.task !== 'linear'
  return (
    <aside className="library-rail mech-lib">
      <h3>Кинематика</h3>
      <div className="field">
        <label>Модель расчёта</label>
        <select value={model.task} onChange={(e) => onTask(e.target.value as KinTaskKind)}>
          <option value="custom">Произвольная</option>
          <option value="diff">Дифференциальная платформа</option>
          <option value="linear">Линейная ось</option>
          <option value="arm2r">Двухзвенный манипулятор</option>
        </select>
      </div>
      <p className="hint">Заготовки создают узлы и связи. Числа — примерные, их можно править.</p>
      <div className="kin-toolrow">
        <button type="button" className="btn ghost" onClick={() => onTemplate('diff')}>
          Платформа
        </button>
        <button type="button" className="btn ghost" onClick={() => onTemplate('linear')}>
          Линейная ось
        </button>
        <button type="button" className="btn ghost" onClick={() => onTemplate('arm2r')}>
          Двухзвенник
        </button>
      </div>
      {stages.map((s) => (
        <article key={s.id} className={`kin-stage is-${s.status}`}>
          <div className="st">{STATUS[s.status]}</div>
          <h4>{s.title}</h4>
          <p className="hint">{s.purpose}</p>
          <p className="hint">Результат: {s.result}</p>
          <p>{s.detail}</p>
        </article>
      ))}
      {showMap ? (
        <>
          <div className="kin-toolrow">
            <button type="button" className="btn" disabled={!!planReason} title={planReason || ''} onClick={() => onPlan('waypoints')}>
              Путь по точкам
            </button>
            <button type="button" className="btn" disabled={!!planReason} title={planReason || ''} onClick={() => onPlan('astar')}>
              Обход A*
            </button>
          </div>
          {planReason ? <p className="hint">{planReason}</p> : <p className="hint">A* ищет путь по сетке с учётом габарита. Это не оптимальная траектория.</p>}
        </>
      ) : null}
      <button type="button" className="btn ghost" disabled={!!timeReason} title={timeReason || ''} onClick={onTime}>
        Оценить время
      </button>
      {timeReason ? <p className="hint">{timeReason}</p> : null}
      {showMap ? (
        <>
          <h3>Карта</h3>
          <div className="kin-toolrow">
            {(
              [
                ['select', 'Выбор'],
                ['line', 'Стена'],
                ['rect', 'Прямоугольник'],
                ['start', 'Старт'],
                ['goal', 'Цель'],
                ['via', 'Точка'],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" className={`lib-item ${canvasTool === id ? 'on' : ''}`} onClick={() => onCanvasTool(id)}>
                {label}
              </button>
            ))}
          </div>
        </>
      ) : null}
      <SearchField placeholder="Поиск элементов" value={query} onChange={onQuery} />
      <section className="lib-group">
        <p className="hint" style={{ margin: '8px 0 4px' }}>
          Шарниры и направляющие
        </p>
        {JOINT_TOOLS.filter((t) => !q || t.title.toLowerCase().includes(q)).map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={`lib-item ${connectKind === tool.id ? 'on' : ''}`}
            title={tool.hint}
            onClick={() => onTool(connectKind === tool.id ? null : tool.id)}
          >
            {tool.title}
          </button>
        ))}
      </section>
      {MECH_GROUPS.filter((g) => g.kinds.length).map((group) => {
        const kinds = group.kinds.filter((k) => !q || KIND_LABEL[k].toLowerCase().includes(q) || k.includes(q))
        if (!kinds.length) return null
        return (
          <section className="lib-group" key={group.id}>
            <p className="hint" style={{ margin: '8px 0 4px' }}>
              {group.title}
            </p>
            {kinds.map((kind) => (
              <button key={kind} type="button" className="lib-item" onClick={() => onAdd(kind)}>
                {KIND_LABEL[kind]}
              </button>
            ))}
          </section>
        )
      })}
    </aside>
  )
}
