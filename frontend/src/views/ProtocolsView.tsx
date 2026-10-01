import { ColorSwatches } from '../components/ColorSwatches'
import { useProjectStore } from '../store/useProjectStore'
import { uid } from '../lib/ids'
import type { Protocol } from '../types'

const blank = (): Protocol => ({
  id: uid(),
  name: 'Свой протокол',
  version: '1.0',
  transport: 'TCP',
  port: '',
  direction: 'bidirectional',
  data_format: '',
  encoding: '',
  description: '',
  message_structure: '',
  timing: '',
  timeout: '',
  retry: '',
  crc: '',
  notes: '',
  built_in: false,
  color: '',
})

export function ProtocolsView() {
  const project = useProjectStore((s) => s.project)
  const mutate = useProjectStore((s) => s.mutate)

  if (!project) {
    return null
  }

  return (
    <div className="page">
      <section className="settings-card">
        <h2
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Протоколы</span>

          <button
            className="btn primary"
            type="button"
            onClick={() => mutate((p) => p.protocols.push(blank()))}
          >
            Новый протокол
          </button>
        </h2>

        <div className="grid-cards" style={{ marginTop: 18 }}>
          {project.protocols.map((proto) => (
            <article className="card" key={proto.id}>
              <input
                value={proto.name}
                onChange={(e) =>
                  mutate((p) => {
                    const x = p.protocols.find((i) => i.id === proto.id)
                    if (x) x.name = e.target.value
                  })
                }
                style={{
                  fontWeight: 600,
                  fontSize: 15,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                }}
              />

              <p>
                {proto.transport || '—'}
                {proto.port ? `:${proto.port}` : ''} ·{' '}
                {proto.data_format || 'полезная нагрузка'}
              </p>

              <textarea
                style={{
                  marginTop: 5,
                  width: '100%',
                  minHeight: 10,
                }}
                placeholder="Структура сообщения"
                value={proto.message_structure}
                onChange={(e) =>
                  mutate((p) => {
                    const x = p.protocols.find((i) => i.id === proto.id)
                    if (x) x.message_structure = e.target.value
                  })
                }
              />

              <div className="field" style={{ marginTop: 5 }}>
                <label>Цвет</label>

                <ColorSwatches
                  value={proto.color}
                  onChange={(color) =>
                    mutate((p) => {
                      const x = p.protocols.find((i) => i.id === proto.id)
                      if (x) x.color = color
                    })
                  }
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}