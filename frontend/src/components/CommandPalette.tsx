import { useMemo, useState } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'

export function CommandPalette() {
  const open = useUiStore((s) => s.searchOpen)
  const setOpen = useUiStore((s) => s.setSearchOpen)
  const setNav = useUiStore((s) => s.setNav)
  const project = useProjectStore((s) => s.project)
  const select = useProjectStore((s) => s.select)
  const goToArchitecture = useProjectStore((s) => s.goToArchitecture)
  const [q, setQ] = useState('')
  const hits = useMemo(() => {
    if (!project || !q.trim()) return []
    const s = q.toLowerCase()
    const out: { kind: string; title: string; run: () => void }[] = []
    for (const c of project.components) {
      const blob = [c.name, c.type, c.technology, c.description, c.notes, c.documentation.purpose, c.documentation.notes].join(' ')
      if (blob.toLowerCase().includes(s)) {
        out.push({
          kind: 'component',
          title: c.name,
          run: () => {
            goToArchitecture(c.architecture_id)
            select([c.id])
            setNav('architecture')
            setOpen(false)
          },
        })
      }
    }
    for (const p of project.protocols) {
      if (`${p.name} ${p.description} ${p.transport}`.toLowerCase().includes(s)) {
        out.push({ kind: 'protocol', title: p.name, run: () => { setNav('protocols'); setOpen(false) } })
      }
    }
    for (const a of project.algorithms) {
      if (`${a.name} ${a.description} ${a.steps.map((x) => x.text).join(' ')}`.toLowerCase().includes(s)) {
        out.push({
          kind: 'algorithm',
          title: a.name,
          run: () => {
            select([a.component_id])
            setNav('algorithms')
            setOpen(false)
          },
        })
      }
    }
    for (const e of project.connections) {
      if (`${e.protocol_name} ${e.description} ${e.data_format} ${e.notes}`.toLowerCase().includes(s)) {
        out.push({
          kind: 'connection',
          title: `${e.protocol_name || e.kind}`,
          run: () => {
            goToArchitecture(e.architecture_id)
            select([], e.id)
            setNav('architecture')
            setOpen(false)
          },
        })
      }
    }
    for (const r of project.requirements) {
      if (`${r.code} ${r.text}`.toLowerCase().includes(s)) {
        out.push({ kind: 'requirement', title: `${r.code} ${r.text}`, run: () => { setNav('requirements'); setOpen(false) } })
      }
    }
    for (const d of project.documents) {
      if (`${d.title} ${d.body}`.toLowerCase().includes(s)) {
        out.push({ kind: 'document', title: d.title, run: () => { setNav('documents'); setOpen(false) } })
      }
    }
    return out.slice(0, 20)
  }, [project, q])

  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          className="search-input"
          placeholder="Search components, protocols, algorithms, notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {hits.map((h, i) => (
          <button key={h.kind + h.title + i} className="hit" type="button" onClick={h.run}>
            <span>{h.title}</span>
            <span className="kind">{h.kind}</span>
          </button>
        ))}
        {!q ? <p className="hint" style={{ padding: 16 }}>Type to search the current project.</p> : null}
        {q && !hits.length ? <p className="hint" style={{ padding: 16 }}>No matches.</p> : null}
      </div>
    </div>
  )
}
