import { MarkdownField } from '../components/MarkdownField'
import { useProjectStore } from '../store/useProjectStore'
import { uid } from '../lib/ids'

export function DocumentsView() {
  const project = useProjectStore((s) => s.project)!
  const mutate = useProjectStore((s) => s.mutate)
  return (
    <div className="page">
      <h1>Documents</h1>
      <p className="lede">Markdown notes at project scope. Component-level docs live in the inspector.</p>
      <button
        className="btn primary"
        type="button"
        onClick={() =>
          mutate((p) => {
            p.documents.push({ id: uid(), title: 'Untitled', body: '', component_id: null })
          })
        }
      >
        New document
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
              label="Body"
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
    </div>
  )
}
