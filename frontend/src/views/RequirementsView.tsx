import { useState } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'

export function RequirementsView() {
  const project = useProjectStore((s) => s.project)!
  const addRequirement = useProjectStore((s) => s.addRequirement)
  const updateRequirement = useProjectStore((s) => s.updateRequirement)
  const deleteRequirement = useProjectStore((s) => s.deleteRequirement)
  const select = useProjectStore((s) => s.select)
  const goToArchitecture = useProjectStore((s) => s.goToArchitecture)
  const setNav = useUiStore((s) => s.setNav)
  const [text, setText] = useState('Robot must operate offline.')

  return (
    <div className="page">
      <h1>Requirements</h1>
      <p className="lede">Traceable constraints linked to components and connections.</p>
      <div className="create-bar">
        <input
          value={text}
          placeholder="Robot must operate offline."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (!text.trim()) return
              addRequirement(text.trim())
              setText('')
            }
          }}
        />
        <button
          className="btn primary"
          type="button"
          onClick={() => {
            if (!text.trim()) return
            addRequirement(text.trim())
            setText('')
          }}
        >
          Add
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Text</th>
            <th>Priority</th>
            <th>Linked</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {project.requirements.map((r) => (
            <tr key={r.id}>
              <td>{r.code}</td>
              <td>
                <input value={r.text} onChange={(e) => updateRequirement(r.id, { text: e.target.value })} />
              </td>
              <td>
                <select value={r.priority} onChange={(e) => updateRequirement(r.id, { priority: e.target.value })}>
                  <option>must</option>
                  <option>should</option>
                  <option>could</option>
                </select>
              </td>
              <td>
                {r.component_ids.map((id) => {
                  const c = project.components.find((x) => x.id === id)
                  return (
                    <button
                      key={id}
                      className="tag"
                      type="button"
                      onClick={() => {
                        if (!c) return
                        goToArchitecture(c.architecture_id)
                        select([c.id])
                        setNav('architecture')
                      }}
                    >
                      {c?.name || id}
                    </button>
                  )
                })}
                <select
                  value=""
                  onChange={(e) => {
                    const id = e.target.value
                    if (!id) return
                    updateRequirement(r.id, { component_ids: Array.from(new Set([...r.component_ids, id])) })
                  }}
                >
                  <option value="">Link component…</option>
                  {project.components.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button className="btn ghost danger" type="button" onClick={() => deleteRequirement(r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
