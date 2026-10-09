import { ColorSwatches, PROTOCOL_PALETTE } from '../components/ColorSwatches'
import { useProjectStore } from '../store/useProjectStore'
import { uid } from '../lib/ids'
import { clampStrokeWidth, protocolLabel } from '../model/protocols'
import { PROTOCOL_CARD_CONFIG } from '../model/protocolCard'
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
  stroke_width: 2,
})

export function ProtocolsView() {
  const project = useProjectStore((s) => s.project)
  const mutate = useProjectStore((s) => s.mutate)

  if (!project) return null

  const removeProtocol = (proto: Protocol) => {
    const used = project.connections.filter((c) => c.protocol_id === proto.id || c.protocol_name === proto.name)
    if (used.length) {
      const ok = window.confirm(
        `Протокол «${protocolLabel(proto.name)}» используется в ${used.length} соединениях. ` +
          `После удаления у этих связей не будет протокола. Удалить?`,
      )
      if (!ok) return
    } else if (!window.confirm(`Удалить протокол «${protocolLabel(proto.name)}»?`)) {
      return
    }
    mutate((p) => {
      p.protocols = p.protocols.filter((item) => item.id !== proto.id)
      for (const link of p.connections) {
        if (link.protocol_id === proto.id || link.protocol_name === proto.name) {
          link.protocol_id = null
          link.protocol_name = ''
        }
      }
    })
  }

  return (
    <section className="settings-card protocols-card">
      <div className="settings-card-head">
        <h2>Протоколы</h2>
        <button className="btn" type="button" onClick={() => mutate((p) => p.protocols.push(blank()))}>
          Новый
        </button>
      </div>
      <p className="hint">Имя, цвет и толщина линии связи на холсте.</p>
      <div className="protocol-cards">
        {project.protocols.map((proto) => (
          <div className="protocol-card" key={proto.id}>
            <input
              className="protocol-card-name"
              value={proto.name === 'Электрическое подключение' ? 'Эл. подкл.' : proto.name}
              aria-label="Название протокола"
              onChange={(e) =>
                mutate((p) => {
                  const x = p.protocols.find((i) => i.id === proto.id)
                  if (!x) return
                  const previous = x.name
                  x.name = e.target.value === 'Эл. подкл.' ? 'Электрическое подключение' : e.target.value
                  if (previous !== x.name) {
                    for (const link of p.connections) {
                      if (link.protocol_id === x.id || link.protocol_name === previous) {
                        link.protocol_name = x.name
                        link.protocol_id = x.id
                      }
                    }
                  }
                })
              }
            />
            <label className="protocol-card-stroke hint">
              Толщина
              <input
                type="number"
                min={1}
                max={8}
                step={0.5}
                value={clampStrokeWidth(proto.stroke_width)}
                aria-label="Толщина линии"
                onChange={(e) =>
                  mutate((p) => {
                    const x = p.protocols.find((i) => i.id === proto.id)
                    if (x) x.stroke_width = clampStrokeWidth(e.target.value)
                  })
                }
              />
            </label>
            <ColorSwatches
              compact
              layout={PROTOCOL_CARD_CONFIG.paletteLayout}
              colors={PROTOCOL_PALETTE}
              value={proto.color}
              onChange={(color) =>
                mutate((p) => {
                  const x = p.protocols.find((i) => i.id === proto.id)
                  if (x) x.color = color
                })
              }
            />
            <button className={PROTOCOL_CARD_CONFIG.deleteButtonClass} type="button" onClick={() => removeProtocol(proto)}>
              Удалить
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
