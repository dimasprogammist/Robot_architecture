import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'
import { MarkdownField } from './MarkdownField'
import { uid } from '../lib/ids'
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
        <h2>Inspector</h2>
        <p className="sub">Select a block or connection to edit its semantics.</p>
        <p className="hint">Double-click a block to open internal architecture.</p>
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
        {component.type} · {component.category}
      </p>
      <div className="tabs">
        {(['overview', 'docs', 'algorithm', 'nested', 'requirements'] as const).map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} type="button">
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <Field label="Name" value={component.name} onChange={(v) => updateComponent(component.id, { name: v })} />
          <div className="field">
            <label>Type</label>
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
          <Field label="Technology" value={component.technology} onChange={(v) => updateComponent(component.id, { technology: v })} />
          <Field label="Version" value={component.version} onChange={(v) => updateComponent(component.id, { version: v })} />
          <div className="field">
            <label>Status</label>
            <select value={component.status} onChange={(e) => updateComponent(component.id, { status: e.target.value })}>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <Field label="Owner" value={component.owner} onChange={(v) => updateComponent(component.id, { owner: v })} />
          <Field label="Tags" value={component.tags.join(', ')} onChange={(v) => updateComponent(component.id, { tags: v.split(',').map((x) => x.trim()).filter(Boolean) })} />
          <Field label="Description" value={component.description} onChange={(v) => updateComponent(component.id, { description: v })} multiline />
          <Field label="Modules" value={component.modules.join('\n')} onChange={(v) => updateComponent(component.id, { modules: v.split('\n').map((x) => x.trim()).filter(Boolean) })} multiline />
          <Field label="API" value={component.api} onChange={(v) => updateComponent(component.id, { api: v })} multiline />
          <Field label="State" value={component.state} onChange={(v) => updateComponent(component.id, { state: v })} />
          <Field label="Notes" value={component.notes} onChange={(v) => updateComponent(component.id, { notes: v })} multiline />
        </>
      )}

      {tab === 'docs' && (
        <>
          {(
            [
              ['purpose', 'Purpose'],
              ['responsibilities', 'Responsibilities'],
              ['inputs', 'Inputs'],
              ['outputs', 'Outputs'],
              ['dependencies', 'Dependencies'],
              ['interfaces', 'Interfaces'],
              ['failure_modes', 'Failure modes'],
              ['notes', 'Notes'],
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
          <p className="hint">Open a nested canvas for subsystems, modules, and functions.</p>
          <button className="btn primary" type="button" onClick={() => enterComponent(component.id)}>
            Open internal architecture
          </button>
        </>
      )}

      {tab === 'requirements' && (
        <>
          <button className="btn" type="button" onClick={() => addRequirement('')}>
            Link new requirement
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
      <h2>Connection</h2>
      <p className="sub">{connection.kind === 'data_flow' ? 'Data flow' : 'Link'}</p>
      <div className="field">
        <label>Kind</label>
        <select value={connection.kind} onChange={(e) => onChange({ kind: e.target.value as Connection['kind'] })}>
          <option value="connection">Connection</option>
          <option value="data_flow">Data flow</option>
        </select>
      </div>
      <div className="field">
        <label>Protocol</label>
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
        <label>Direction</label>
        <select value={connection.direction} onChange={(e) => onChange({ direction: e.target.value as Connection['direction'] })}>
          <option value="unidirectional">Unidirectional</option>
          <option value="bidirectional">Bidirectional</option>
        </select>
      </div>
      <Field label="Description" value={connection.description} onChange={(v) => onChange({ description: v })} multiline />
      <Field label="Data format" value={connection.data_format} onChange={(v) => onChange({ data_format: v })} />
      <Field label="Payload example" value={connection.data_example} onChange={(v) => onChange({ data_example: v })} multiline />
      <Field label="Frequency" value={connection.frequency} onChange={(v) => onChange({ frequency: v })} />
      <Field label="Latency" value={connection.latency} onChange={(v) => onChange({ latency: v })} />
      <Field label="Reliability" value={connection.reliability} onChange={(v) => onChange({ reliability: v })} />
      <Field label="Notes" value={connection.notes} onChange={(v) => onChange({ notes: v })} multiline />
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
        <p className="hint">No algorithm yet for {component.name}.</p>
        <button className="btn primary" type="button" onClick={onOpen}>
          Create algorithm
        </button>
      </div>
    )
  }

  const setList = (key: 'inputs' | 'outputs' | 'errors' | 'conditions' | 'loops' | 'states', v: string) =>
    onChange(algorithm.id, { [key]: v.split('\n').map((x) => x.trim()).filter(Boolean) })

  return (
    <div>
      <Field label="Name" value={algorithm.name} onChange={(v) => onChange(algorithm.id, { name: v })} />
      <Field label="Description" value={algorithm.description} onChange={(v) => onChange(algorithm.id, { description: v })} multiline />
      <div className="field">
        <label>Steps</label>
        {algorithm.steps.map((step, i) => (
          <div className="step-row" key={step.id}>
            <select
              value={step.kind}
              onChange={(e) => {
                const steps = algorithm.steps.map((s) => (s.id === step.id ? { ...s, kind: e.target.value as AlgorithmStepKind } : s))
                onChange(algorithm.id, { steps })
              }}
            >
              <option>action</option>
              <option>condition</option>
              <option>loop</option>
              <option>input</option>
              <option>output</option>
              <option>error</option>
            </select>
            <input
              value={step.text}
              placeholder={step.kind === 'condition' ? 'Value > threshold?' : 'Read sensor'}
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
                placeholder="YES path / NO path"
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
          Add step
        </button>
      </div>
      <Field label="Inputs" value={algorithm.inputs.join('\n')} onChange={(v) => setList('inputs', v)} multiline />
      <Field label="Outputs" value={algorithm.outputs.join('\n')} onChange={(v) => setList('outputs', v)} multiline />
      <Field label="Errors" value={algorithm.errors.join('\n')} onChange={(v) => setList('errors', v)} multiline />
      <Field label="Conditions" value={algorithm.conditions.join('\n')} onChange={(v) => setList('conditions', v)} multiline />
      <Field label="Loops" value={algorithm.loops.join('\n')} onChange={(v) => setList('loops', v)} multiline />
      <Field label="States" value={algorithm.states.join('\n')} onChange={(v) => setList('states', v)} multiline />
      <div className="field">
        <label>State transitions</label>
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
          Add transition
        </button>
      </div>
    </div>
  )
}
