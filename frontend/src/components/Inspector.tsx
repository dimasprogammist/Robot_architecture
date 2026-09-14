import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'
import { DocsPanel, FilesPanel, MechPanel, TablePanel } from './InspectorExtras'
import { MarkdownField } from './MarkdownField'
import { uid } from '../lib/ids'
import { CATEGORY_LABELS, STATUS_LABELS, STEP_KIND_LABELS, TAB_LABELS } from '../i18n'
import type { AlgorithmStepKind, Component, Connection } from '../types'

const STATUSES = ['planned', 'in-progress', 'ready', 'deprecated']

export function Inspector() {
  const project = useProjectStore((s) => s.project)
  const selectedIds = useProjectStore((s) => s.selectedIds)
  const selectedConnectionId = useProjectStore((s) => s.selectedConnectionId)
  const updateComponent = useProjectStore((s) => s.updateComponent)
  const updateConnection = useProjectStore((s) => s.updateConnection)
  const enterComponent = useProjectStore((s) => s.enterComponent)
  const ensureAlgorithm = useProjectStore((s) => s.ensureAlgorithm)
  const updateAlgorithm = useProjectStore((s) => s.updateAlgorithm)
  const addRequirement = useProjectStore((s) => s.addRequirement)
  const updateRequirement = useProjectStore((s) => s.updateRequirement)
  const tab = useUiStore((s) => s.inspectorTab)
  const setTab = useUiStore((s) => s.setInspectorTab)

  if (!project) return null
  const component = project.components.find((c) => c.id === selectedIds[0])
  const connection = project.connections.find((c) => c.id === selectedConnectionId)

  if (connection && !component) {
    return <ConnectionInspector connection={connection} projectProtocols={project.protocols.map((p) => p.name)} onChange={(patch) => updateConnection(connection.id, patch)} />
  }

  if (!component) {
    return (
      <aside className="inspector">
        <h2>Инспектор</h2>
        <p className="sub">Выберите блок или связь, чтобы описать семантику.</p>
        <p className="hint">Двойной клик по блоку открывает внутреннюю архитектуру.</p>
      </aside>
    )
  }

  const alg = project.algorithms.find((a) => a.component_id === component.id)
  const types = Array.from(new Set([...project.custom_types.map((t) => t.name), component.type]))
  const linkedReqs = project.requirements.filter((r) => r.component_ids.includes(component.id) || component.requirement_ids.includes(r.id))

  return (
    <aside className="inspector">
      <h2>{component.name}</h2>
      <p className="sub">
        {component.type} · {CATEGORY_LABELS[component.category] || component.category}
      </p>
      <div className="tabs">
        {(
          [
            'overview',
            'docs',
            'algorithm',
            'nested',
            'requirements',
            ...(component.category === 'MECHANICS' ? (['mechanics'] as const) : []),
            ...(component.entity_kind === 'table' || component.table ? (['table'] as const) : []),
            'files',
          ] as const
        ).map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} type="button">
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <Field label="Название" value={component.name} onChange={(v) => updateComponent(component.id, { name: v })} />
          <div className="field">
            <label>Тип</label>
            <input
              value={component.type}
              onChange={(e) => updateComponent(component.id, { type: e.target.value })}
              list="type-list"
            />
            <datalist id="type-list">
              {types.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
          <Field label="Технология" value={component.technology} onChange={(v) => updateComponent(component.id, { technology: v })} />
          <Field label="Версия" value={component.version} onChange={(v) => updateComponent(component.id, { version: v })} />
          <div className="field">
            <label>Статус</label>
            <select value={component.status} onChange={(e) => updateComponent(component.id, { status: e.target.value })}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <Field label="Владелец" value={component.owner} onChange={(v) => updateComponent(component.id, { owner: v })} />
          <Field label="Теги" value={component.tags.join(', ')} onChange={(v) => updateComponent(component.id, { tags: v.split(',').map((x) => x.trim()).filter(Boolean) })} />
          <Field label="Описание" value={component.description} onChange={(v) => updateComponent(component.id, { description: v })} multiline />
          <Field label="Модули" value={component.modules.join('\n')} onChange={(v) => updateComponent(component.id, { modules: v.split('\n').map((x) => x.trim()).filter(Boolean) })} multiline />
          <Field label="API" value={component.api} onChange={(v) => updateComponent(component.id, { api: v })} multiline />
          <Field label="Состояние" value={component.state} onChange={(v) => updateComponent(component.id, { state: v })} />
          <Field label="Заметки" value={component.notes} onChange={(v) => updateComponent(component.id, { notes: v })} multiline />
        </>
      )}

      {tab === 'docs' && (
        <>
          {(
            [
              ['purpose', 'Назначение'],
              ['responsibilities', 'Ответственность'],
              ['inputs', 'Входы'],
              ['outputs', 'Выходы'],
              ['dependencies', 'Зависимости'],
              ['interfaces', 'Интерфейсы'],
              ['failure_modes', 'Отказы'],
              ['notes', 'Заметки'],
            ] as const
          ).map(([key, label]) => (
            <MarkdownField
              key={key}
              label={label}
              value={component.documentation[key]}
              onChange={(v) =>
                updateComponent(component.id, {
                  documentation: { ...component.documentation, [key]: v },
                })
              }
            />
          ))}
          <DocsPanel component={component} />
        </>
      )}

      {tab === 'algorithm' && (
        <AlgorithmEditor
          component={component}
          algorithmId={alg?.id}
          onOpen={() => ensureAlgorithm(component.id)}
          onChange={(id, patch) => updateAlgorithm(id, patch)}
        />
      )}

      {tab === 'nested' && (
        <>
          <p className="hint">Откройте вложенный холст для подсистем, модулей и функций.</p>
          <button className="btn primary" type="button" onClick={() => enterComponent(component.id)}>
            Открыть внутреннюю архитектуру
          </button>
        </>
      )}

      {tab === 'mechanics' && <MechPanel component={component} />}
      {tab === 'table' && <TablePanel component={component} />}
      {tab === 'files' && <FilesPanel component={component} />}

      {tab === 'requirements' && (
        <>
          <button className="btn" type="button" onClick={() => addRequirement('')}>
            Связать новое требование
          </button>
          {linkedReqs.map((r) => (
            <div key={r.id} className="field" style={{ marginTop: 12 }}>
              <label>{r.code}</label>
              <textarea value={r.text} onChange={(e) => updateRequirement(r.id, { text: e.target.value })} />
            </div>
          ))}
        </>
      )}
    </aside>
  )
}

function ConnectionInspector({
  connection,
  projectProtocols,
  onChange,
}: {
  connection: Connection
  projectProtocols: string[]
  onChange: (patch: Partial<Connection>) => void
}) {
  return (
    <aside className="inspector">
      <h2>Связь</h2>
      <p className="sub">{connection.kind === 'data_flow' ? 'Поток данных' : 'Соединение'}</p>
      <div className="field">
        <label>Вид</label>
        <select value={connection.kind} onChange={(e) => onChange({ kind: e.target.value as Connection['kind'] })}>
          <option value="connection">Соединение</option>
          <option value="data_flow">Поток данных</option>
        </select>
      </div>
      <div className="field">
        <label>Протокол</label>
        <input
          value={connection.protocol_name}
          list="proto-list"
          onChange={(e) => onChange({ protocol_name: e.target.value })}
        />
        <datalist id="proto-list">
          {projectProtocols.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </div>
      <div className="field">
        <label>Направление</label>
        <select value={connection.direction} onChange={(e) => onChange({ direction: e.target.value as Connection['direction'] })}>
          <option value="unidirectional">Одностороннее</option>
          <option value="bidirectional">Двустороннее</option>
        </select>
      </div>
      <Field label="Описание" value={connection.description} onChange={(v) => onChange({ description: v })} multiline />
      <Field label="Формат данных" value={connection.data_format} onChange={(v) => onChange({ data_format: v })} />
      <Field label="Пример данных" value={connection.data_example} onChange={(v) => onChange({ data_example: v })} multiline />
      <Field label="Частота" value={connection.frequency} onChange={(v) => onChange({ frequency: v })} />
      <Field label="Задержка" value={connection.latency} onChange={(v) => onChange({ latency: v })} />
      <Field label="Надёжность" value={connection.reliability} onChange={(v) => onChange({ reliability: v })} />
      <Field label="Заметки" value={connection.notes} onChange={(v) => onChange({ notes: v })} multiline />
      <div className="field">
        <label>Цвет линии</label>
        <input type="color" value={connection.color || '#6e6b63'} onChange={(e) => onChange({ color: e.target.value })} />
      </div>
      <div className="field">
        <label>Кардинальность (ER)</label>
        <select value={connection.cardinality} onChange={(e) => onChange({ cardinality: e.target.value })}>
          <option value="">—</option>
          <option value="one_to_one">1 — 1</option>
          <option value="one_to_many">1 — N</option>
          <option value="many_to_many">N — N</option>
        </select>
      </div>
      <Field label="Колонка источника (PK)" value={connection.source_column} onChange={(v) => onChange({ source_column: v })} />
      <Field label="Колонка цели (FK)" value={connection.target_column} onChange={(v) => onChange({ target_column: v })} />
    </aside>
  )
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {multiline ? <textarea value={value} onChange={(e) => onChange(e.target.value)} /> : <input value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  )
}

function AlgorithmEditor({
  component,
  algorithmId,
  onOpen,
  onChange,
}: {
  component: Component
  algorithmId?: string
  onOpen: () => void
  onChange: (id: string, patch: Record<string, unknown>) => void
}) {
  const algorithm = useProjectStore((s) => s.project?.algorithms.find((a) => a.id === algorithmId))
  if (!algorithm) {
    return (
      <div>
        <p className="hint">Для «{component.name}» алгоритм ещё не задан.</p>
        <button className="btn primary" type="button" onClick={onOpen}>
          Создать алгоритм
        </button>
      </div>
    )
  }

  const setList = (key: 'inputs' | 'outputs' | 'errors' | 'conditions' | 'loops' | 'states', v: string) =>
    onChange(algorithm.id, { [key]: v.split('\n').map((x) => x.trim()).filter(Boolean) })

  return (
    <div>
      <Field label="Название" value={algorithm.name} onChange={(v) => onChange(algorithm.id, { name: v })} />
      <Field label="Описание" value={algorithm.description} onChange={(v) => onChange(algorithm.id, { description: v })} multiline />
      <div className="field">
        <label>Шаги</label>
        {algorithm.steps.map((step, i) => (
          <div className="step-row" key={step.id}>
            <select
              value={step.kind}
              onChange={(e) => {
                const steps = algorithm.steps.map((s) => (s.id === step.id ? { ...s, kind: e.target.value as AlgorithmStepKind } : s))
                onChange(algorithm.id, { steps })
              }}
            >
              <option value="action">{STEP_KIND_LABELS.action}</option>
              <option value="condition">{STEP_KIND_LABELS.condition}</option>
              <option value="loop">{STEP_KIND_LABELS.loop}</option>
              <option value="input">{STEP_KIND_LABELS.input}</option>
              <option value="output">{STEP_KIND_LABELS.output}</option>
              <option value="error">{STEP_KIND_LABELS.error}</option>
            </select>
            <input
              value={step.text}
              placeholder={step.kind === 'condition' ? 'Значение > порога?' : 'Прочитать датчик'}
              onChange={(e) => {
                const steps = algorithm.steps.map((s) => (s.id === step.id ? { ...s, text: e.target.value } : s))
                onChange(algorithm.id, { steps })
              }}
            />
            <button
              className="btn ghost"
              type="button"
              onClick={() => onChange(algorithm.id, { steps: algorithm.steps.filter((s) => s.id !== step.id) })}
            >
              ×
            </button>
            {step.kind === 'condition' && (
              <input
                style={{ gridColumn: '1 / -1' }}
                placeholder="ДА / НЕТ"
                value={`${step.on_true}${step.on_false ? ' / ' + step.on_false : ''}`}
                onChange={(e) => {
                  const [yes, no] = e.target.value.split('/').map((x) => x.trim())
                  const steps = algorithm.steps.map((s) =>
                    s.id === step.id ? { ...s, condition: step.text, on_true: yes || '', on_false: no || '' } : s,
                  )
                  onChange(algorithm.id, { steps })
                }}
              />
            )}
            <span className="hint" style={{ gridColumn: '1 / -1' }}>
              {i + 1}
            </span>
          </div>
        ))}
        <button
          className="btn"
          type="button"
          onClick={() =>
            onChange(algorithm.id, {
              steps: [
                ...algorithm.steps,
                { id: uid(), kind: 'action', text: '', condition: '', on_true: '', on_false: '' },
              ],
            })
          }
        >
          Добавить шаг
        </button>
      </div>
      <Field label="Входы" value={algorithm.inputs.join('\n')} onChange={(v) => setList('inputs', v)} multiline />
      <Field label="Выходы" value={algorithm.outputs.join('\n')} onChange={(v) => setList('outputs', v)} multiline />
      <Field label="Ошибки" value={algorithm.errors.join('\n')} onChange={(v) => setList('errors', v)} multiline />
      <Field label="Условия" value={algorithm.conditions.join('\n')} onChange={(v) => setList('conditions', v)} multiline />
      <Field label="Циклы" value={algorithm.loops.join('\n')} onChange={(v) => setList('loops', v)} multiline />
      <Field label="Состояния" value={algorithm.states.join('\n')} onChange={(v) => setList('states', v)} multiline />
      <div className="field">
        <label>Переходы состояний</label>
        {algorithm.transitions.map((t) => (
          <input
            key={t.id}
            value={`${t.source} > ${t.target} : ${t.trigger}`}
            onChange={(e) => {
              const [path, trigger] = e.target.value.split(':')
              const [source, target] = (path || '').split('>').map((x) => x.trim())
              onChange(algorithm.id, {
                transitions: algorithm.transitions.map((x) =>
                  x.id === t.id ? { ...x, source: source || '', target: target || '', trigger: (trigger || '').trim() } : x,
                ),
              })
            }}
          />
        ))}
        <button
          className="btn"
          type="button"
          onClick={() =>
            onChange(algorithm.id, {
              transitions: [
                ...algorithm.transitions,
                { id: uid(), source: 'IDLE', target: 'RUNNING', trigger: 'START', guard: '' },
              ],
            })
          }
        >
          Добавить переход
        </button>
      </div>
    </div>
  )
}
