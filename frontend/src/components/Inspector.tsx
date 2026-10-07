import { useEffect, useState } from 'react'
import { ColorSwatches } from './ColorSwatches'
import { PanelRightClose } from 'lucide-react'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'
import { FilesPanel, MechPanel, TablePanel } from './InspectorExtras'
import { uid } from '../lib/ids'
import { CATEGORY_LABELS, STATUS_LABELS, STEP_KIND_LABELS, TAB_LABELS } from '../i18n'
import type { AlgorithmStepKind, Component, Connection, Protocol } from '../types'
import {
  OTHER_VALUE,
  componentSupportsAlgorithm,
  groupedComponentFields,
  inferManufacturer,
  inspectorChrome,
} from '../model/componentCatalog'
import { catalogLook } from '../model/library'
import { PROGRAM_LANGUAGES, RELIABILITY_OPTIONS, protocolSelectOptions } from '../model/protocols'

const STATUSES = ['planned', 'in-progress', 'ready', 'deprecated']

function EditableName({
  value,
  onSave,
}: {
  value: string
  onSave: (next: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  const commit = () => {
    const next = draft.trim() || value
    setEditing(false)
    if (next !== value) onSave(next)
  }

  if (!editing) {
    return (
      <h2
        className="editable-title"
        title="Изменить название"
        onClick={() => setEditing(true)}
      >
        {value}
      </h2>
    )
  }

  return (
    <input
      className="editable-title-input"
      value={draft}
      autoFocus
      aria-label="Название"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          commit()
        }
        if (e.key === 'Escape') {
          setDraft(value)
          setEditing(false)
        }
      }}
    />
  )
}

export function Inspector({ onClose }: { onClose?: () => void }) {
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
  const tabRaw = useUiStore((s) => s.inspectorTab)
  const setTab = useUiStore((s) => s.setInspectorTab)
  const tab = tabRaw === 'docs' || tabRaw === 'nested' ? 'overview' : tabRaw

  if (!project) return null

  const component = project.components.find((c) => c.id === selectedIds[0])
  const connection = project.connections.find((c) => c.id === selectedConnectionId)

  if (connection && !component) {
    return (
      <ConnectionInspector
        connection={connection}
        components={project.components}
        protocols={project.protocols}
        onChange={(patch) => updateConnection(connection.id, patch)}
      />
    )
  }

  if (!component) {
    return (
      <aside className="inspector">
        <div className="inspector-heading">
          <h2>Свойства</h2>
          {onClose ? (
            <button
              className="icon-btn"
              type="button"
              title="Скрыть свойства"
              aria-label="Скрыть свойства"
              onClick={onClose}
            >
              <PanelRightClose size={16} />
            </button>
          ) : null}
        </div>

        <p className="sub">Выберите блок или связь.</p>
      </aside>
    )
  }

  if (component.entity_kind === 'table' || component.table) {
    return (
      <aside className="inspector">
        <div className="inspector-heading">
          <EditableName
            value={component.name}
            onSave={(name) => updateComponent(component.id, { name })}
          />
          {onClose ? (
            <button
              className="icon-btn"
              type="button"
              title="Скрыть свойства"
              aria-label="Скрыть свойства"
              onClick={onClose}
            >
              <PanelRightClose size={16} />
            </button>
          ) : null}
        </div>
        <p className="sub">Таблица</p>

        <TablePanel component={component} />
      </aside>
    )
  }

  const alg = project.algorithms.find((a) => a.component_id === component.id)
  const linkedReqs = project.requirements.filter(
    (r) =>
      r.component_ids.includes(component.id) ||
      component.requirement_ids.includes(r.id),
  )
  const appearance = catalogLook(component, project.library_presets || [])
  const supportsAlgorithm = componentSupportsAlgorithm(appearance)
  const chrome = inspectorChrome(appearance)
  const inspectorTabs = (
    [
      'overview',
      ...(supportsAlgorithm ? (['algorithm'] as const) : []),
      'requirements',
      ...(component.category === 'MECHANICS' ? (['mechanics'] as const) : []),
      'files',
    ] as const
  )

  return (
    <aside className="inspector">
      <div className="inspector-heading">
        <div className="inspector-title-row">
          <EditableName
            value={component.name}
            onSave={(name) => updateComponent(component.id, { name })}
          />
          <span
            className="inspector-type"
            title={`${component.extra_fields?.sensor_kind || appearance.type} · ${CATEGORY_LABELS[appearance.category] || appearance.category}`}
          >
            {(component.extra_fields?.sensor_kind || appearance.type)} · {CATEGORY_LABELS[appearance.category] || appearance.category}
          </span>
        </div>

        {onClose ? (
          <button
            className="icon-btn"
            type="button"
            title="Скрыть свойства"
            aria-label="Скрыть свойства"
            onClick={onClose}
          >
            <PanelRightClose size={16} />
          </button>
        ) : null}
      </div>

      <div className="tabs">
        {inspectorTabs.map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
            type="button"
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {(() => {
            const groups = groupedComponentFields(appearance)
            const mainFields = groups.find((group) => group.id === 'main')?.fields || []
            const otherGroups = groups.filter((group) => group.id !== 'main')
            const renderExtra = (field: (typeof mainFields)[number]) => {
              const extra = component.extra_fields || {}
              const raw = extra[field.key] || ''
              const guessed =
                field.auto && field.key === 'manufacturer'
                  ? inferManufacturer(component.name, component.type, extra.model || '')
                  : ''
              const value = raw || guessed
              return (
                <Field
                  key={field.key}
                  label={field.label}
                  value={value}
                  options={field.options}
                  allowOther={field.allowOther}
                  multiline={field.multiline}
                  onChange={(v) => {
                    if (field.key === 'model') {
                      const maker = inferManufacturer(component.name, component.type, v)
                      updateComponent(component.id, {
                        extra_fields: {
                          ...extra,
                          model: v,
                          ...(maker ? { manufacturer: maker } : {}),
                        },
                      })
                      return
                    }
                    updateComponent(component.id, {
                      extra_fields: { ...extra, [field.key]: v },
                    })
                  }}
                />
              )
            }
            return (
              <>
                <div className="prop-group">
                  <p className="prop-kicker">Основное</p>
                  <div className="field">
                    <label>Готовность</label>
                    <select
                      value={component.status}
                      onChange={(e) => updateComponent(component.id, { status: e.target.value })}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                  {mainFields.map(renderExtra)}
                </div>
                {otherGroups.map((group) => (
                  <div className="prop-group" key={group.id}>
                    <p className="prop-kicker">{group.title}</p>
                    {group.fields.map(renderExtra)}
                  </div>
                ))}
              </>
            )
          })()}

          {chrome.connection ? (
            <div className="prop-group">
              <p className="prop-kicker">Связь</p>
              <Field
                label="Технология"
                value={component.technology}
                onChange={(v) => updateComponent(component.id, { technology: v })}
              />
              <Field
                label="Адрес / API"
                value={component.api}
                onChange={(v) => updateComponent(component.id, { api: v })}
              />
            </div>
          ) : null}

          {component.category === 'MECHANICS' ? (
            <p className="hint">Размеры и материал — на вкладке «Механика».</p>
          ) : null}

          <div className="prop-group">
            <Field
              label="Описание"
              value={component.description}
              onChange={(v) => updateComponent(component.id, { description: v })}
              multiline
            />
          </div>

          <button className="btn" type="button" onClick={() => enterComponent(component.id)}>
            Внутренняя архитектура
          </button>
        </>
      )}

      {tab === 'algorithm' && supportsAlgorithm && (
        <AlgorithmEditor
          component={component}
          algorithmId={alg?.id}
          onOpen={() => ensureAlgorithm(component.id)}
          onChange={(id, patch) => updateAlgorithm(id, patch)}
        />
      )}

      {tab === 'mechanics' && <MechPanel component={component} />}
      {tab === 'table' && <TablePanel component={component} />}
      {tab === 'files' && <FilesPanel component={component} />}

      {tab === 'requirements' && (
        <>
          <button
            className="btn"
            type="button"
            onClick={() => addRequirement('')}
          >
            Связать новое требование
          </button>

          {linkedReqs.map((r) => (
            <div
              key={r.id}
              className="field"
              style={{ marginTop: 12 }}
            >
              <label>{r.code}</label>

              <textarea
                value={r.text}
                onChange={(e) =>
                  updateRequirement(r.id, {
                    text: e.target.value,
                  })
                }
              />
            </div>
          ))}
        </>
      )}
    </aside>
  )
}

function ConnectionInspector({
  connection,
  components,
  protocols,
  onChange,
}: {
  connection: Connection
  components: Component[]
  protocols: Protocol[]
  onChange: (patch: Partial<Connection>) => void
}) {
  const source = components.find((c) => c.id === connection.source)
  const target = components.find((c) => c.id === connection.target)
  const names = protocolSelectOptions(protocols.map((p) => p.name))
  const tableLink =
    (source?.entity_kind === 'table' || Boolean(source?.table)) &&
    (target?.entity_kind === 'table' || Boolean(target?.table))
  const reliabilityOptions = connection.reliability && !RELIABILITY_OPTIONS.includes(connection.reliability as typeof RELIABILITY_OPTIONS[number])
    ? [connection.reliability, ...RELIABILITY_OPTIONS]
    : [...RELIABILITY_OPTIONS]
  return (
    <aside className="inspector">
      <div className="inspector-heading">
        <h2>Связь</h2>
      </div>

      <p className="sub">
        {connection.kind === 'data_flow'
          ? 'Поток данных'
          : 'Соединение'}
      </p>

      <div className="field">
        <label>Источник</label>
        <input value={source?.name || connection.source} readOnly />
      </div>

      <div className="field">
        <label>Назначение</label>
        <input value={target?.name || connection.target} readOnly />
      </div>

      <div className="field">
        <label>Протокол</label>
        <select
          value={connection.protocol_name}
          onChange={(e) => {
            const name = e.target.value
            const proto = protocols.find((p) => p.name === name)
            onChange({
              protocol_name: name,
              protocol_id: proto?.id || null,
              color: proto?.color || connection.color,
            })
          }}
        >
          <option value="">Без протокола</option>
          {names.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Направление</label>

        <select
          value={connection.direction}
          onChange={(e) =>
            onChange({
              direction: e.target.value as Connection['direction'],
            })
          }
        >
          <option value="unidirectional">Одностороннее</option>
          <option value="bidirectional">Двустороннее</option>
        </select>
      </div>

      <div className="field">
        <label>Цвет линии</label>
        <ColorSwatches
          value={connection.color}
          onChange={(color) => onChange({ color })}
        />
      </div>

      <Field
        label="Что передаётся"
        value={connection.description}
        onChange={(v) => onChange({ description: v })}
        multiline
      />

      <details className="prop-extra">
        <summary>Дополнительно</summary>

        <Field
          label="Формат данных"
          value={connection.data_format}
          onChange={(v) =>
            onChange({ data_format: v })
          }
        />

        <Field
          label="Пример"
          value={connection.data_example}
          onChange={(v) =>
            onChange({ data_example: v })
          }
          multiline
        />

        <Field
          label="Как часто"
          value={connection.frequency}
          onChange={(v) =>
            onChange({ frequency: v })
          }
        />

        <Field
          label="Допустимая задержка"
          value={connection.latency}
          onChange={(v) =>
            onChange({ latency: v })
          }
        />

        <div className="field">
          <label>Надёжность</label>
          <select
            value={connection.reliability}
            onChange={(e) => onChange({ reliability: e.target.value })}
          >
            <option value="">Не задано</option>
            {reliabilityOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <Field
          label="Заметки"
          value={connection.notes}
          onChange={(v) =>
            onChange({ notes: v })
          }
          multiline
        />
      </details>

      {tableLink ? (
        <div className="prop-group">
          <p className="prop-kicker">Связь таблиц</p>
          <div className="field">
            <label>Кардинальность</label>
            <select
              value={connection.cardinality}
              onChange={(e) =>
                onChange({
                  cardinality: e.target.value,
                })
              }
            >
              <option value="">Не задано</option>
              <option value="one_to_one">Один к одному</option>
              <option value="one_to_many">Один ко многим</option>
              <option value="many_to_many">Многие ко многим</option>
            </select>
          </div>
          <Field
            label="Колонка источника"
            value={connection.source_column}
            onChange={(v) =>
              onChange({
                source_column: v,
              })
            }
          />
          <Field
            label="Колонка цели"
            value={connection.target_column}
            onChange={(v) =>
              onChange({
                target_column: v,
              })
            }
          />
        </div>
      ) : null}
    </aside>
  )
}

function Field({
  label,
  value,
  onChange,
  multiline,
  options,
  allowOther,
  readOnly,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  options?: string[]
  allowOther?: boolean
  readOnly?: boolean
}) {
  const selectOptions = options?.length
    ? allowOther && !options.includes(OTHER_VALUE)
      ? [...options, OTHER_VALUE]
      : options
    : []
  const known = selectOptions.includes(value)
  const selectValue = !selectOptions.length
    ? ''
    : !value
      ? ''
      : known
        ? value
        : OTHER_VALUE
  const showOther = Boolean(allowOther && selectValue === OTHER_VALUE)

  return (
    <div className="field">
      <label>{label}</label>
      {selectOptions.length ? (
        <>
          <select
            value={selectValue}
            disabled={readOnly}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Не задано</option>
            {selectOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {showOther ? (
            <input
              value={value === OTHER_VALUE ? '' : value}
              placeholder="Своё значение"
              onChange={(e) => onChange(e.target.value || OTHER_VALUE)}
            />
          ) : null}
        </>
      ) : multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} readOnly={readOnly} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} readOnly={readOnly} />
      )}
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
  const algorithm = useProjectStore(
    (s) => s.project?.algorithms.find((a) => a.id === algorithmId),
  )
  const [stepsOpen, setStepsOpen] = useState(true)

  if (!algorithm) {
    return (
      <div>
        <p className="hint">
          Для «{component.name}» алгоритм ещё не задан.
        </p>

        <button
          className="btn primary"
          type="button"
          onClick={onOpen}
        >
          Создать алгоритм
        </button>
      </div>
    )
  }

  const setList = (
    key:
      | 'inputs'
      | 'outputs'
      | 'errors'
      | 'conditions'
      | 'loops'
      | 'states',
    v: string,
  ) =>
    onChange(algorithm.id, {
      [key]: v
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
    })

  return (
    <div>
      <Field
        label="Название"
        value={algorithm.name}
        onChange={(v) =>
          onChange(algorithm.id, { name: v })
        }
      />

      <Field
        label="Описание"
        value={algorithm.description}
        onChange={(v) =>
          onChange(algorithm.id, {
            description: v,
          })
        }
        multiline
      />

      <Field
        label="Программа"
        value={algorithm.program_name || ''}
        onChange={(v) => onChange(algorithm.id, { program_name: v })}
      />

      <Field
        label="Язык программирования"
        value={algorithm.language || ''}
        options={[...PROGRAM_LANGUAGES]}
        onChange={(v) => onChange(algorithm.id, { language: v })}
      />

      <Field
        label="Назначение"
        value={algorithm.purpose || ''}
        onChange={(v) => onChange(algorithm.id, { purpose: v })}
        multiline
      />

      <div className="prop-group algo-steps">
        <button
          className="algo-steps-toggle"
          type="button"
          onClick={() => setStepsOpen((open) => !open)}
        >
          Шаги {stepsOpen ? '▼' : '▶'}
        </button>
        {stepsOpen ? (
        <div className="algo-steps-body">

        {algorithm.steps.map((step, i) => (
          <div className="step-row" key={step.id}>
            <select
              value={step.kind}
              onChange={(e) => {
                const steps = algorithm.steps.map((s) =>
                  s.id === step.id
                    ? {
                        ...s,
                        kind: e.target.value as AlgorithmStepKind,
                      }
                    : s,
                )

                onChange(algorithm.id, { steps })
              }}
            >
              <option value="action">
                {STEP_KIND_LABELS.action}
              </option>
              <option value="condition">
                {STEP_KIND_LABELS.condition}
              </option>
              <option value="loop">
                {STEP_KIND_LABELS.loop}
              </option>
              <option value="input">
                {STEP_KIND_LABELS.input}
              </option>
              <option value="output">
                {STEP_KIND_LABELS.output}
              </option>
              <option value="error">
                {STEP_KIND_LABELS.error}
              </option>
            </select>

            <input
              value={step.text}
              placeholder={
                step.kind === 'condition'
                  ? 'Значение > порога?'
                  : 'Прочитать датчик'
              }
              onChange={(e) => {
                const steps = algorithm.steps.map((s) =>
                  s.id === step.id
                    ? {
                        ...s,
                        text: e.target.value,
                      }
                    : s,
                )

                onChange(algorithm.id, { steps })
              }}
            />

            <button
              className="btn ghost"
              type="button"
              onClick={() =>
                onChange(algorithm.id, {
                  steps: algorithm.steps.filter(
                    (s) => s.id !== step.id,
                  ),
                })
              }
            >
              ×
            </button>

            {step.kind === 'condition' && (
              <input
                style={{ gridColumn: '1 / -1' }}
                placeholder="ДА / НЕТ"
                value={`${step.on_true}${
                  step.on_false ? ' / ' + step.on_false : ''
                }`}
                onChange={(e) => {
                  const [yes, no] = e.target.value
                    .split('/')
                    .map((x) => x.trim())

                  const steps = algorithm.steps.map((s) =>
                    s.id === step.id
                      ? {
                          ...s,
                          condition: step.text,
                          on_true: yes || '',
                          on_false: no || '',
                        }
                      : s,
                  )

                  onChange(algorithm.id, { steps })
                }}
              />
            )}

            <span
              className="hint"
              style={{ gridColumn: '1 / -1' }}
            >
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
                {
                  id: uid(),
                  kind: 'action',
                  text: '',
                  condition: '',
                  on_true: '',
                  on_false: '',
                },
              ],
            })
          }
        >
          Добавить шаг
        </button>
        </div>
        ) : null}
      </div>

      <Field
        label="Входы"
        value={algorithm.inputs.join('\n')}
        onChange={(v) => setList('inputs', v)}
        multiline
      />

      <Field
        label="Выходы"
        value={algorithm.outputs.join('\n')}
        onChange={(v) => setList('outputs', v)}
        multiline
      />

      <Field
        label="Ошибки"
        value={algorithm.errors.join('\n')}
        onChange={(v) => setList('errors', v)}
        multiline
      />

      <Field
        label="Условия"
        value={algorithm.conditions.join('\n')}
        onChange={(v) => setList('conditions', v)}
        multiline
      />

      <Field
        label="Циклы"
        value={algorithm.loops.join('\n')}
        onChange={(v) => setList('loops', v)}
        multiline
      />

      <Field
        label="Состояния"
        value={algorithm.states.join('\n')}
        onChange={(v) => setList('states', v)}
        multiline
      />

      <div className="field">
        <label>Переходы состояний</label>

        {algorithm.transitions.map((t) => (
          <input
            key={t.id}
            value={`${t.source} > ${t.target} : ${t.trigger}`}
            onChange={(e) => {
              const [path, trigger] = e.target.value.split(':')
              const [source, target] = (path || '')
                .split('>')
                .map((x) => x.trim())

              onChange(algorithm.id, {
                transitions: algorithm.transitions.map((x) =>
                  x.id === t.id
                    ? {
                        ...x,
                        source: source || '',
                        target: target || '',
                        trigger: (trigger || '').trim(),
                      }
                    : x,
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
                {
                  id: uid(),
                  source: 'IDLE',
                  target: 'RUNNING',
                  trigger: 'START',
                  guard: '',
                },
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
