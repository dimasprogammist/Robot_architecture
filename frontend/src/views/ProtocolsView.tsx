import { useProjectStore } from '../store/useProjectStore'
import { uid } from '../lib/ids'
import type { Protocol } from '../types'

const blank = (): Protocol => ({
  id: uid(),
  name: 'Custom Protocol',
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
})

export function ProtocolsView() {
  const project = useProjectStore((s) => s.project)!
  const mutate = useProjectStore((s) => s.mutate)
  return (
    <div className="page">
      <h1>Protocols</h1>
      <p className="lede">Catalog of transports used by connections. Custom message structures belong here.</p>
      <button className="btn primary" type="button" onClick={() => mutate((p) => p.protocols.push(blank()))}>
        New protocol
      </button>
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
              style={{ fontWeight: 600, fontSize: 15, border: 'none', background: 'transparent', padding: 0 }}
            />
            <p>
              {proto.transport || '—'} {proto.port ? `:${proto.port}` : ''} · {proto.data_format || 'payload'}
            </p>
            <textarea
              style={{ marginTop: 10, width: '100%', minHeight: 64 }}
              placeholder="Message structure"
              value={proto.message_structure}
              onChange={(e) =>
                mutate((p) => {
                  const x = p.protocols.find((i) => i.id === proto.id)
                  if (x) x.message_structure = e.target.value
                })
              }
            />
            <textarea
              style={{ marginTop: 8, width: '100%', minHeight: 48 }}
              placeholder="Description"
              value={proto.description}
              onChange={(e) =>
                mutate((p) => {
                  const x = p.protocols.find((i) => i.id === proto.id)
                  if (x) x.description = e.target.value
                })
              }
            />
          </article>
        ))}
      </div>
    </div>
  )
}
