import { MarkdownField } from '../components/MarkdownField'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'
import { uid } from '../lib/ids'
import { BomView } from './BomView'
import { RequirementsView } from './RequirementsView'

export function DocumentsView() {
  const project = useProjectStore((s) => s.project)!
  const mutate = useProjectStore((s) => s.mutate)
  const tab = useUiStore((s) => s.docTab)
  const setTab = useUiStore((s) => s.setDocTab)
  return (
    <div className="page">
      <h1>Документы</h1>
      <p className="lede">Требования, заметки и спецификация компонентов в одном разделе.</p>
      <div className="tabs" style={{ marginBottom: 18 }}>
        {(
          [
            ['requirements', 'Требования'],
            ['notes', 'Заметки'],
            ['bom', 'Спецификация'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? 'active' : ''}`} type="button" onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'requirements' ? <RequirementsView embedded /> : null}
      {tab === 'bom' ? <BomView embedded /> : null}
      {tab === 'notes' ? (
        <>
      <button
        className="btn primary"
        type="button"
        onClick={() =>
          mutate((p) => {
            p.documents.push({
              id: uid(),
              title: 'Без названия',
              body: '',
              component_id: null,
              protocol_id: null,
              kind: 'markdown',
              url: '',
              description: '',
            })
          })
        }
      >
        Новый документ
      </button>
      <div style={{ marginTop: 20, display: 'grid', gap: 18, maxWidth: 720 }}>
        {project.documents.map((d) => (
          <article className="card" key={d.id}>
            <input
              value={d.title}
              onChange={(e) =>
                mutate((p) => {
                  const x = p.documents.find((i) => i.id === d.id)
                  if (x) x.title = e.target.value
                })
              }
              style={{ fontWeight: 600, fontSize: 16, border: 'none', background: 'transparent', width: '100%' }}
            />
            <MarkdownField
              label="Текст"
              value={d.body}
              onChange={(v) =>
                mutate((p) => {
                  const x = p.documents.find((i) => i.id === d.id)
                  if (x) x.body = v
                })
              }
            />
          </article>
        ))}
      </div>
        </>
      ) : null}
    </div>
  )
}
