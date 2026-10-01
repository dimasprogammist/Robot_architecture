import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'
import { uid } from '../lib/ids'

const STATUS_LABELS: Record<string, string> = {
  planned: 'Запланирован',
  active: 'Активен',
  deprecated: 'Устарел',
}

export function ComponentsView() {
  const project = useProjectStore((s) => s.project)
  const mutate = useProjectStore((s) => s.mutate)

  const goToArchitecture = useUiStore((s) => s.goToArchitecture)
  const select = useUiStore((s) => s.select)
  const setNav = useUiStore((s) => s.setNav)

  if (!project) return null

  return (
    <div className="page">
      <section className="settings-card">
        <h2
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'nowrap',
          }}
        >
          <span>Компоненты</span>

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'nowrap',
            }}
          >
            <button
              className="btn primary"
              type="button"
              style={{ whiteSpace: 'nowrap' }}
              onClick={() =>
                mutate((p) =>
                  p.components.push({
                    id: uid(),
                    name: 'Новый компонент',
                    type: 'Свой компонент',
                    technology: '',
                    status: 'planned',
                    owner: '',
                    architecture_id: '',
                  }),
                )
              }
            >
              Добавить компонент
            </button>

            <button
              className="btn primary"
              type="button"
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => {
                const name = window.prompt('Название типа', 'Шлюз')
                if (!name) return

                mutate((p) => {
                  p.custom_types.push({
                    id: uid(),
                    category: 'OTHER',
                    name,
                    icon: 'box',
                    built_in: false,
                  })
                })
              }}
            >
              Новый тип
            </button>
          </div>
        </h2>

        {project.custom_types.length ? (
          <p className="hint">
            Свои типы: {project.custom_types.map((t) => t.name).join(', ')}
          </p>
        ) : null}

        <table className="table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Тип</th>
              <th>Технология</th>
              <th>Статус</th>
              <th>Владелец</th>
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
                <td>{STATUS_LABELS[c.status] || c.status}</td>
                <td>{c.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="settings-card" style={{ marginTop: 24 }}>
        <h2
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'nowrap',
          }}
        >
          <span>Каталог железа</span>

          <button
            className="btn primary"
            type="button"
            style={{ whiteSpace: 'nowrap' }}
            onClick={() =>
              mutate((p) => {
                p.hardware.push({
                  id: uid(),
                  name: 'Своё железо',
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
                  category: 'Своё железо',
                  built_in: false,
                })
              })
            }
          >
            Добавить своё железо
          </button>
        </h2>

        <div className="grid-cards" style={{ marginTop: 16 }}>
          {project.hardware.map((h) => (
            <div className="card" key={h.id}>
              <h3>{h.name}</h3>

              <p>
                {[h.manufacturer, h.model].filter(Boolean).join(' · ') ||
                  h.category}
              </p>

              <p className="hint" style={{ marginTop: 8 }}>
                {h.cpu} {h.ram}
              </p>

              {!h.built_in ? (
                <input
                  style={{ marginTop: 8, width: '100%' }}
                  value={h.notes}
                  placeholder="Заметки"
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
      </section>
    </div>
  )
}