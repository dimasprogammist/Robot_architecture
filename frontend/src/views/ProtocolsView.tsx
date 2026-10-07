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

  if (!project) return null

  return (
    <section className="settings-card protocols-card">
      <div className="settings-card-head">
        <h2>Протоколы</h2>
        <button className="btn" type="button" onClick={() => mutate((p) => p.protocols.push(blank()))}>
          Новый
        </button>
      </div>
      <p className="hint">Имя и цвет — подпись связи на холсте.</p>
      <div className="protocol-cards">
        {project.protocols.map((proto) => (
          <div className="protocol-card" key={proto.id}>
            <input
              value={proto.name}
              aria-label="Название протокола"
              onChange={(e) =>
                mutate((p) => {
                  const x = p.protocols.find((i) => i.id === proto.id)
                  if (x) x.name = e.target.value
                })
              }
            />
            <ColorSwatches
              compact
              value={proto.color}
              onChange={(color) =>
                mutate((p) => {
                  const x = p.protocols.find((i) => i.id === proto.id)
                  if (x) x.color = color
                })
              }
            />
          </div>
        ))}
      </div>
    </section>
  )
}
