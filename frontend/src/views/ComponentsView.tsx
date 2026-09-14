import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'
import { uid } from '../lib/ids'

export function ComponentsView() {
  const project = useProjectStore((s) => s.project)!
  const mutate = useProjectStore((s) => s.mutate)
  const select = useProjectStore((s) => s.select)
  const goToArchitecture = useProjectStore((s) => s.goToArchitecture)
  const setNav = useUiStore((s) => s.setNav)
  const addComponent = useProjectStore((s) => s.addComponent)

  return (
    <div className="page">
      <h1>Components</h1>
      <p className="lede">Software, hardware, data, and protocol blocks in this system. Custom types can be added below.</p>
      <div className="row" style={{ marginBottom: 16 }}>
        <button className="btn primary" type="button" onClick={() => addComponent({ name: 'New component', type: 'Custom Component', category: 'OTHER' })}>
          Add component
        </button>
        <button
          className="btn"
          type="button"
          onClick={() => {
            const name = window.prompt('Custom type name', 'Gateway')
            if (!name) return
            mutate((p) => {
              p.custom_types.push({ id: uid(), category: 'OTHER', name, icon: 'box', built_in: false })
            })
          }}
        >
          New type
        </button>
      </div>
      {project.custom_types.length ? (
        <p className="hint">Custom types: {project.custom_types.map((t) => t.name).join(', ')}</p>
      ) : null}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Technology</th>
            <th>Status</th>
            <th>Owner</th>
          </tr>
        </thead>
        <tbody>
          {project.components.map((c) => (
            <tr
              key={c.id}
              onClick={() => {
                goToArchitecture(c.architecture_id)
                select([c.id])
                setNav('architecture')
              }}
            >
              <td>{c.name}</td>
              <td>{c.type}</td>
              <td>{c.technology}</td>
              <td>{c.status}</td>
              <td>{c.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h1 style={{ marginTop: 40, fontSize: 22 }}>Hardware catalog</h1>
      <p className="lede">Boards, controllers, and sensors available to this project.</p>
      <button
        className="btn"
        type="button"
        onClick={() =>
          mutate((p) => {
            p.hardware.push({
              id: uid(),
              name: 'Custom Hardware',
              manufacturer: '',
              model: '',
              cpu: '',
              ram: '',
              interfaces: '',
              voltage: '',
              protocols: '',
              os: '',
              datasheet: '',
              notes: '',
              category: 'Custom Hardware',
              built_in: false,
            })
          })
        }
      >
        Add custom hardware
      </button>
      <div className="grid-cards" style={{ marginTop: 16 }}>
        {project.hardware.map((h) => (
          <div className="card" key={h.id}>
            <h3>{h.name}</h3>
            <p>
              {[h.manufacturer, h.model].filter(Boolean).join(' · ') || h.category}
            </p>
            <p className="hint" style={{ marginTop: 8 }}>
              {h.cpu} {h.ram}
            </p>
            {!h.built_in ? (
              <input
                style={{ marginTop: 8, width: '100%' }}
                value={h.notes}
                placeholder="Notes"
                onChange={(e) =>
                  mutate((p) => {
                    const x = p.hardware.find((i) => i.id === h.id)
                    if (x) x.notes = e.target.value
                  })
                }
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
